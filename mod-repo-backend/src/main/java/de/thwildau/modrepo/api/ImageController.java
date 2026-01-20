package de.thwildau.modrepo.api;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.FileSystemResource;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.nio.file.Path;

@RestController
@RequestMapping("/api/images")
public class ImageController {

    @Value("${modrepo.storageDir}")
    private String storageDir;

    @GetMapping("/{filename}")
    public ResponseEntity<FileSystemResource> getImage(@PathVariable String filename) {
        Path path = Path.of(storageDir).getParent().resolve("images").resolve(filename);

        FileSystemResource res = new FileSystemResource(path);
        if (!res.exists()) {
            return ResponseEntity.notFound().build();
        }

        return ResponseEntity.ok(res);
    }
}