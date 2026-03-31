package com.coaching.taha_coaches.infrastructure.auth;

import com.coaching.taha_coaches.domain.user.User;
import com.coaching.taha_coaches.domain.user.UserRepository;
import com.coaching.taha_coaches.infrastructure.cloud.CloudflareR2Service;
import jakarta.transaction.Transactional;
import org.springframework.security.oauth2.client.userinfo.DefaultOAuth2UserService;
import org.springframework.security.oauth2.client.userinfo.OAuth2UserRequest;
import org.springframework.security.oauth2.core.OAuth2AuthenticationException;
import org.springframework.security.oauth2.core.user.DefaultOAuth2User;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.stereotype.Service;

import java.io.InputStream;
import java.net.URL;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

@Service
public class CustomOAuth2UserService extends DefaultOAuth2UserService {

    private final UserRepository userRepository;
    private final CloudflareR2Service r2Service;

    public CustomOAuth2UserService(UserRepository userRepository,
                                   CloudflareR2Service r2Service) {
        this.userRepository = userRepository;
        this.r2Service = r2Service;
    }

    @Override
    @Transactional
    public OAuth2User loadUser(OAuth2UserRequest userRequest)
            throws OAuth2AuthenticationException {

        OAuth2User oauth2User = super.loadUser(userRequest);

        String provider = userRequest.getClientRegistration().getRegistrationId(); // "facebook"

        // 🔴 Facebook-specific attributes
        String providerId = oauth2User.getAttribute("id");
        String name = oauth2User.getAttribute("name");
        String email = oauth2User.getAttribute("email"); // may be null!

        User user = userRepository.findByProviderAndProviderId(provider, providerId)
                .orElseGet(() -> {

                    // ⚠️ Fallback email si le provider n'a pas fourni d'email
                    String safeEmail = (email != null && !email.isEmpty())
                            ? email
                            : provider + "-" + providerId + "@no-email.com";

                    User newUser = User.builder()
                            .email(safeEmail)
                            .name(name)
                            .provider(provider)
                            .providerId(providerId)
                            .build();

                    try {
                        // Facebook avatar
                        String avatarUrl = "https://graph.facebook.com/" + providerId + "/picture?type=large";

                        URL url = new URL(avatarUrl);

                        Path tempFile = Files.createTempFile("avatar-", ".png");
                        try (InputStream in = url.openStream()) {
                            Files.copy(in, tempFile, java.nio.file.StandardCopyOption.REPLACE_EXISTING);
                        }

                        String key = "avatars/" + UUID.randomUUID() + ".png";
                        r2Service.upload(key, tempFile);
                        newUser.setAvatarUrl(r2Service.getPublicUrl(key));

                        Files.deleteIfExists(tempFile);
                    } catch (Exception e) {
                        e.printStackTrace();
                    }

                    return userRepository.save(newUser);
                });

        return new AuthenticatedUser(
                user,
                oauth2User.getAttributes(),
                oauth2User.getAuthorities()
        );
    }
}