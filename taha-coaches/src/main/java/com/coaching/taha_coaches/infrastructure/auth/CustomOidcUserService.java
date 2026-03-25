package com.coaching.taha_coaches.infrastructure.auth;

import com.coaching.taha_coaches.domain.user.User;
import com.coaching.taha_coaches.domain.user.UserRepository;
import com.coaching.taha_coaches.infrastructure.cloud.CloudflareR2Service;
import jakarta.transaction.Transactional;
import org.springframework.security.oauth2.client.oidc.userinfo.OidcUserRequest;
import org.springframework.security.oauth2.client.oidc.userinfo.OidcUserService;
import org.springframework.security.oauth2.core.OAuth2AuthenticationException;
import org.springframework.security.oauth2.core.oidc.user.DefaultOidcUser;
import org.springframework.security.oauth2.core.oidc.user.OidcUser;
import org.springframework.stereotype.Service;

import java.io.InputStream;
import java.net.URL;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

@Service
public class CustomOidcUserService extends OidcUserService {

    private final UserRepository userRepository;
    private final CloudflareR2Service r2Service;

    public CustomOidcUserService(UserRepository userRepository,
                                 CloudflareR2Service r2Service) {
        this.userRepository = userRepository;
        this.r2Service = r2Service;
    }

    @Override
    @Transactional
    public OidcUser loadUser(OidcUserRequest userRequest) throws OAuth2AuthenticationException {

        OidcUser oidcUser = super.loadUser(userRequest);

        String provider = userRequest.getClientRegistration().getRegistrationId(); // "google"
        String providerId = oidcUser.getAttribute("sub");
        String email = oidcUser.getEmail();
        String name = oidcUser.getFullName();

        // find or create user
        User user = userRepository.findByProviderAndProviderId(provider, providerId)
                .orElseGet(() -> {

                    User newUser = User.builder()
                            .email(email)
                            .name(name)
                            .provider(provider)
                            .providerId(providerId)
                            .build();

                    try {
                        // fetch google avatar
                        String googleAvatarUrl = oidcUser.getAttribute("picture");
                        if (googleAvatarUrl != null && !googleAvatarUrl.isEmpty()) {
                            URL url = new URL(googleAvatarUrl);

                            // ALWAYS save as .png to avoid invalid suffix
                            String extension = ".png";

                            Path tempFile = Files.createTempFile("avatar-", extension);
                            try (InputStream in = url.openStream()) {
                                Files.copy(in, tempFile, java.nio.file.StandardCopyOption.REPLACE_EXISTING);
                            }

                            String key = "avatars/" + UUID.randomUUID() + extension;
                            r2Service.upload(key, tempFile);
                            newUser.setAvatarUrl(r2Service.getPublicUrl(key));

                            Files.deleteIfExists(tempFile);
                        }
                    } catch (Exception e) {
                        e.printStackTrace();
                        // continue without avatar if download/upload fails
                    }

                    return userRepository.save(newUser);
                });

        // Wrap in DefaultOidcUser, attach user for frontend
        Map<String, Object> attributes = new HashMap<>(oidcUser.getAttributes());
        attributes.put("user", user);

        return new DefaultOidcUser(
                oidcUser.getAuthorities(),
                oidcUser.getIdToken(),
                oidcUser.getUserInfo(),
                "email"
        ) {
            @Override
            public Map<String, Object> getAttributes() {
                return attributes;
            }
        };
    }
}