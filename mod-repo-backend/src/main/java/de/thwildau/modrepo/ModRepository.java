package de.thwildau.modrepo;

import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

@Repository
public class ModRepository {

  private final JdbcTemplate jdbc;

  public ModRepository(JdbcTemplate jdbc) {
    this.jdbc = jdbc;
  }

  /** Liste aller Mods inkl. minecraftVersions und JSON-kompatibler Keys */
  public List<Map<String, Object>> findAllWithVersions() {
    // Grunddaten aus mods
    List<Map<String, Object>> base = jdbc.queryForList("""
      SELECT id, title, description, image_path, jar_path,
             downloads, popularity, views, favorites,
             author, category, last_updated
      FROM mods
      ORDER BY CAST(id AS INTEGER)
    """);

    // Versions aus mod_versions holen
    var vers = jdbc.queryForList("""
      SELECT mod_id, mc_version FROM mod_versions ORDER BY mc_version
    """);

    // Zuordnung: mod_id -> List<mc_version>
    Map<String, List<String>> map = new LinkedHashMap<>();
    for (var row : vers) {
      String modId = (String) row.get("mod_id");
      String v = (String) row.get("mc_version");
      map.computeIfAbsent(modId, k -> new ArrayList<>()).add(v);
    }

    // Zusammenführen + Keys so benennen wie im Frontend
    for (var m : base) {
      String id = (String) m.get("id");
      m.put("minecraftVersions", map.getOrDefault(id, List.of()));
      m.put("imageUrl", m.remove("image_path"));
      m.put("jarPath", m.remove("jar_path"));
      m.put("lastUpdated", m.remove("last_updated"));
    }

    return base;
  }

  /** Einzelnes Mod für Download oder Detailansicht (Rohwerte aus Tabelle) */
  public Optional<Map<String, Object>> findById(String id) {
    var list = jdbc.queryForList("SELECT * FROM mods WHERE id = ?", id);
    if (list.isEmpty()) {
      return Optional.empty();
    }
  
    // Kopie anlegen, damit wir nicht direkt auf dem JDBC-Map arbeiten
    Map<String, Object> row = new LinkedHashMap<>(list.get(0));
  
    // Zusätzliche, frontend-freundliche Keys setzen
    Object imagePath = row.get("image_path");
    if (imagePath != null) {
      row.put("imageUrl", imagePath);
    }
  
    Object jarPath = row.get("jar_path");
    if (jarPath != null) {
      row.put("jarPath", jarPath);
    }
  
    Object lastUpdated = row.get("last_updated");
    if (lastUpdated != null) {
      row.put("lastUpdated", lastUpdated);
    }
  
    return Optional.of(row);
  }

  /** Downloadzähler erhöhen */
  public void incrementDownloads(String id) {
    jdbc.update("UPDATE mods SET downloads = downloads + 1 WHERE id = ?", id);
  }

  /** Views erhöhen (bei Detail-Aufruf) */
  public void incrementViews(String id) {
    jdbc.update("UPDATE mods SET views = views + 1 WHERE id = ?", id);
  }

  /** Favorites +1 / -1 (nicht unter 0) */
  public void incrementFavorites(String id) {
    jdbc.update("UPDATE mods SET favorites = favorites + 1 WHERE id = ?", id);
  }

  public void decrementFavorites(String id) {
    jdbc.update("""
      UPDATE mods
         SET favorites = CASE WHEN favorites > 0 THEN favorites - 1 ELSE 0 END
       WHERE id = ?
    """, id);
  }

  /** Globale Top-Statistik (beliebteste Mods) */
  public Map<String, Object> statsTop() {
    var top = jdbc.queryForList("""
      SELECT title, downloads
      FROM mods
      ORDER BY downloads DESC, CAST(id AS INTEGER) ASC
      LIMIT 10
    """);
    Long total = jdbc.queryForObject("SELECT COALESCE(SUM(downloads),0) FROM mods", Long.class);
    return Map.of(
      "downloadsTotal", total == null ? 0 : total,
      "mostDownloaded", top
    );
  }

  /** Kompakte Summary (für Kacheln): Mods/Downloads/Views/Favorites gesamt */
  public Map<String, Object> statsSummary() {
    Long mods      = jdbc.queryForObject("SELECT COUNT(*) FROM mods", Long.class);
    Long downloads = jdbc.queryForObject("SELECT COALESCE(SUM(downloads),0) FROM mods", Long.class);
    Long views     = jdbc.queryForObject("SELECT COALESCE(SUM(views),0) FROM mods", Long.class);
    Long favorites = jdbc.queryForObject("SELECT COALESCE(SUM(favorites),0) FROM mods", Long.class);
    return Map.of(
      "mods", mods == null ? 0 : mods,
      "downloads", downloads == null ? 0 : downloads,
      "views", views == null ? 0 : views,
      "favorites", favorites == null ? 0 : favorites
    );
  }

  /** Beliebteste Mods je Minecraft-Version (Top N je Version) */
  public Map<String, List<Map<String, Object>>> topModsPerVersion(int topN) {
    var rows = jdbc.queryForList("""
      SELECT mv.mc_version AS version, m.title, m.downloads
      FROM mods m
      JOIN mod_versions mv ON mv.mod_id = m.id
      ORDER BY mv.mc_version ASC, m.downloads DESC
    """);

    Map<String, List<Map<String, Object>>> out = new LinkedHashMap<>();
    for (var r : rows) {
      String ver = (String) r.get("version");
      var list = out.computeIfAbsent(ver, k -> new ArrayList<>());
      if (list.size() < topN) {
        list.add(Map.of(
          "title", r.get("title"),
          "downloads", r.get("downloads")
        ));
      }
    }
    return out;
  }
}