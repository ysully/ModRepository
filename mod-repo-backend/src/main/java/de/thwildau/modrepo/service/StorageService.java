package de.thwildau.modrepo.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.FileSystemResource;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.nio.file.*;

@Service
public class StorageService {
  private final Path root;
  public StorageService(@Value("${modrepo.storageDir}") String storageDir) throws IOException {
    this.root = Path.of(storageDir).toAbsolutePath().normalize();
    Files.createDirectories(this.root);
  }

  public String saveJar(String originalFilename, byte[] bytes) throws IOException {
    var safeName = (System.currentTimeMillis() + "_" + originalFilename)
        .replaceAll("[^a-zA-Z0-9._-]","_");
    Path target = root.resolve(safeName);
    Files.write(target, bytes, StandardOpenOption.CREATE_NEW);
    return safeName; // relative dateiname für DB
  }

  public FileSystemResource loadJar(String storedFilename) {
    return new FileSystemResource(root.resolve(storedFilename));
  }
}