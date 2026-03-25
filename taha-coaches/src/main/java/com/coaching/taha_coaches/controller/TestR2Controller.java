package com.coaching.taha_coaches.controller;

import com.coaching.taha_coaches.infrastructure.cloud.CloudflareR2Service;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.UUID;

@RestController
@RequestMapping("/api/test-r2")
@RequiredArgsConstructor
public class TestR2Controller {

    private final CloudflareR2Service r2Service;

    @PostMapping("/upload")
    public ResponseEntity<String> uploadFile(@RequestParam MultipartFile file) throws IOException {
        // Generate a random key to test
        String extension = file.getOriginalFilename().substring(file.getOriginalFilename().lastIndexOf('.'));
        String key = "test/" + UUID.randomUUID() + extension;

        // Save file to temp path
        Path temp = Files.createTempFile("r2-test-", extension);
        file.transferTo(temp);

        // Upload to R2
        r2Service.upload(key, temp);

        // Delete temp file
        Files.deleteIfExists(temp);

        // Return public URL
        return ResponseEntity.ok("Uploaded successfully! URL: " + r2Service.getPublicUrl(key));
    }
}