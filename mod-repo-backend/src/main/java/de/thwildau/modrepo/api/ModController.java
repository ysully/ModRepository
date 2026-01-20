package de.thwildau.modrepo.api;

import de.thwildau.modrepo.ModRepository;
import de.thwildau.modrepo.service.StorageService;
import org.springframework.core.io.FileSystemResource;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

import javax.sql.DataSource;

import java.nio.file.*;
import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.time.LocalDate;
import java.util.*;

@RestController
@RequestMapping("/api")
public class ModController {

  private final ModRepository repo;
  private final StorageService storage; // aktuell ungenutzt
  private final DataSource dataSource;

  /** Basisordner für Dateien (z. B. ../data/files). Images liegen daneben unter ../data/images */
  private final Path storageDir;
  private final Path dataRoot; // = storageDir.getParent()

  public ModController(
      ModRepository repo,
      StorageService storage,
      DataSource dataSource,
      @org.springframework.beans.factory.annotation.Value("${modrepo.storageDir:../data/files}") String storageDirProp
  ) {
    this.repo = repo;
    this.storage = storage;
    this.dataSource = dataSource;

    this.storageDir = Paths.get(storageDirProp).normalize().toAbsolutePath();
    this.dataRoot = this.storageDir.getParent() != null ? this.storageDir.getParent() : this.storageDir;

    // Verzeichnisse sicherstellen
    try {
      Files.createDirectories(this.storageDir);                 // …/data/files
      Files.createDirectories(this.dataRoot.resolve("images")); // …/data/images
    } catch (Exception e) {
      throw new IllegalStateException("Konnte Speicherverzeichnisse nicht anlegen: " + e.getMessage(), e);
    }
  }

  /** 1) Alle Mods */
  @GetMapping("/mods")
  public List<Map<String, Object>> all() {
    return repo.findAllWithVersions();
  }

  /** 2) Download einer Mod (.jar) + Zähler erhöhen */
  @GetMapping("/mods/{id}/download")
  public ResponseEntity<FileSystemResource> download(@PathVariable String id) {
    var mod = repo.findById(id)
        .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND));

    String jarPath = (String) mod.get("jar_path");
    if (jarPath == null || jarPath.isBlank()) {
      throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Keine Datei hinterlegt");
    }

    // 1) Falls in DB ein Pfad wie "/storage/xxx.jar" steht → relativ zu dataRoot auflösen
    // 2) Sonst als Dateiname unter storageDir behandeln
    Path filePath = jarPath.startsWith("/")
        ? dataRoot.resolve(jarPath.substring(1)).normalize()
        : storageDir.resolve(jarPath).normalize();

    var file = new FileSystemResource(filePath);
    if (!file.exists()) {
      throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Datei nicht gefunden: " + filePath);
    }

    repo.incrementDownloads(id);

    HttpHeaders headers = new HttpHeaders();
    headers.setContentDisposition(ContentDisposition.attachment()
        .filename(filePath.getFileName().toString()).build());
    headers.setContentType(MediaType.APPLICATION_OCTET_STREAM);
    try {
      headers.setContentLength(Files.size(filePath));
    } catch (Exception ignored) {}

    return new ResponseEntity<>(file, headers, HttpStatus.OK);
  }

  /** 3) Statistik: Top */
  @GetMapping("/stats/top")
  public Map<String, Object> top() {
    return repo.statsTop();
  }

  /** 4) Statistik: Beliebteste Mods pro Minecraft-Version */
  @GetMapping("/stats/byVersion")
  public Map<String, List<Map<String, Object>>> byVersion(
      @RequestParam(name = "top", defaultValue = "5") int top) {
    int safeTop = Math.max(1, Math.min(top, 10));
    return repo.topModsPerVersion(safeTop);
  }

  /** 5) Upload eines neuen Mods (Multipart) – nutzt die Spring-DataSource-Konfiguration */
  @PostMapping(value = "/mods", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
  public ResponseEntity<?> uploadMod(
      @RequestParam String title,
      @RequestParam String author,
      @RequestParam String category,
      @RequestParam String description,
      @RequestParam(required = true) String versions,  
      @RequestParam(required = true) MultipartFile fileJar,
      @RequestParam(required = false) MultipartFile fileImage
  ) {
    try (Connection conn = dataSource.getConnection()) {
      conn.setAutoCommit(false);

      // neue ID (numerisch) bestimmen
      String newId;
      try (PreparedStatement ps = conn.prepareStatement("SELECT COALESCE(MAX(CAST(id AS INTEGER)),0)+1 FROM mods");
           ResultSet rs = ps.executeQuery()) {
        newId = rs.next() ? rs.getString(1) : UUID.randomUUID().toString();
      }

      // Dateien speichern
      String jarPathDb = null;    // in DB nur Dateiname (unter storageDir)
      String imagePathDb = null;  // in DB /images/<datei> (am dataRoot aufzulösen)

      if (fileJar != null && !fileJar.isEmpty()) {
        String safeName = Paths.get(
            Optional.ofNullable(fileJar.getOriginalFilename()).orElse("mod-" + newId + ".jar")
        ).getFileName().toString();
        Path dest = storageDir.resolve(safeName);
        fileJar.transferTo(dest.toFile());
        jarPathDb = safeName;
      }

      if (fileImage != null && !fileImage.isEmpty()) {
        String safeName = Paths.get(
            Optional.ofNullable(fileImage.getOriginalFilename()).orElse("image-" + newId + ".png")
        ).getFileName().toString();
        Path dest = dataRoot.resolve("images").resolve(safeName);
        fileImage.transferTo(dest.toFile());
        imagePathDb = "/api/images/" + safeName;
      }

      // Datensatz anlegen
      try (PreparedStatement ps = conn.prepareStatement("""
        INSERT INTO mods (id, title, description, image_path, jar_path,
                          downloads, popularity, views, favorites,
                          author, category, last_updated)
        VALUES (?, ?, ?, ?, ?, 0, 0, 0, 0, ?, ?, ?)
      """)) {
        ps.setString(1, newId);
        ps.setString(2, title);
        ps.setString(3, description);
        ps.setString(4, imagePathDb);
        ps.setString(5, jarPathDb);
        ps.setString(6, author);
        ps.setString(7, category);
        ps.setString(8, LocalDate.now().toString());
        ps.executeUpdate();
      }

      if (versions != null && !versions.isBlank()) {
        String[] parts = versions.split("[,;\\s]+"); // trennt Komma, Semikolon, Whitespace
        try (PreparedStatement ps = conn.prepareStatement(
            "INSERT OR IGNORE INTO mod_versions (mod_id, mc_version) VALUES (?, ?)"
        )) {
          for (String v : parts) {
            String vv = v.trim();
            if (!vv.isEmpty()) {
              ps.setString(1, newId);
              ps.setString(2, vv);
              ps.addBatch();
            }
          }
          ps.executeBatch();
        }
      }

      conn.commit();
      return ResponseEntity.ok(Map.of("status", "ok", "id", newId));
    } catch (Exception e) {
      e.printStackTrace();
      throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Fehler beim Upload: " + e.getMessage());
    }
  }

  /** 6) Detail-Aufruf zählt View (wird aus dem Frontend einmalig getriggert) */
  @PostMapping("/mods/{id}/view")
  public ResponseEntity<Void> addView(@PathVariable String id) {
    repo.incrementViews(id);
    return ResponseEntity.accepted().build();
  }

  /** 7) Favorite toggeln: on=true -> +1, on=false -> -1 */
  @PostMapping("/mods/{id}/favorite")
  public ResponseEntity<Map<String,Object>> setFavorite(
      @PathVariable String id,
      @RequestParam("on") boolean on
  ) {
    if (on) repo.incrementFavorites(id); else repo.decrementFavorites(id);
    return ResponseEntity.ok(Map.of("status", "ok"));
  }

  /** 8) Kompakte Übersicht für Startseiten-Kacheln */
  @GetMapping("/stats/summary")
  public Map<String,Object> summary() {
    return repo.statsSummary();
  }
}