package com.coaching.taha_coaches.infrastructure.cloud;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import software.amazon.awssdk.auth.credentials.AwsBasicCredentials;
import software.amazon.awssdk.auth.credentials.StaticCredentialsProvider;
import software.amazon.awssdk.regions.Region;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.PutObjectRequest;

import java.net.URI;
import java.nio.file.Path;
@Service
public class CloudflareR2Service {

    private final S3Client s3;

    @Value("${cloudflare.r2.bucket}")
    private String bucket;

    @Value("${cloudflare.r2.publicEndpoint}") // e.g., https://pub-81145e1965014ef3b2ee195b1531334a.r2.dev
    private String publicEndpoint;


    public CloudflareR2Service(
            @Value("${cloudflare.r2.endpoint}") String endpoint,
            @Value("${cloudflare.r2.accessKey}") String accessKey,
            @Value("${cloudflare.r2.secretKey}") String secretKey) {

        this.s3 = S3Client.builder()
                .endpointOverride(URI.create(endpoint))
                .credentialsProvider(StaticCredentialsProvider.create(
                        AwsBasicCredentials.create(accessKey, secretKey)
                ))
                .region(Region.US_EAST_1) // Required but ignored by R2
                .build();
    }

    // Upload a file to R2
    public void upload(String key, Path filePath) {
        PutObjectRequest request = PutObjectRequest.builder()
                .bucket(bucket)
                .key(key)
                .build();
        s3.putObject(request, filePath);
    }

    // Get public URL for the object (bucket must be public)
    public String getPublicUrl(String key) {
        // Format: https://<bucket>.<account-id>.r2.cloudflarestorage.com/<key>
        return String.format("%s/%s", publicEndpoint, key);
    }
}
