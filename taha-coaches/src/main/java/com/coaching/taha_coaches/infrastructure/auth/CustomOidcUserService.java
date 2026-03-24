package com.coaching.taha_coaches.infrastructure.auth;

import com.coaching.taha_coaches.domain.user.User;
import com.coaching.taha_coaches.domain.user.UserRepository;
import jakarta.transaction.Transactional;
import org.springframework.security.oauth2.client.oidc.userinfo.OidcUserRequest;
import org.springframework.security.oauth2.client.oidc.userinfo.OidcUserService;
import org.springframework.security.oauth2.core.OAuth2AuthenticationException;
import org.springframework.security.oauth2.core.oidc.user.DefaultOidcUser;
import org.springframework.security.oauth2.core.oidc.user.OidcUser;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.Map;

@Service
public class CustomOidcUserService extends OidcUserService {

    private final UserRepository userRepository;

    public CustomOidcUserService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @Override
    public OidcUser loadUser(OidcUserRequest userRequest) throws OAuth2AuthenticationException {

        OidcUser oidcUser = super.loadUser(userRequest);

        String provider = userRequest.getClientRegistration().getRegistrationId(); // "google"
        String providerId = oidcUser.getAttribute("sub");
        String email = oidcUser.getEmail();
        String name = oidcUser.getFullName();

        // find or create user
        User user = userRepository.findByProviderAndProviderId(provider, providerId)
                .orElseGet(() -> userRepository.save(
                        User.builder()
                                .email(email)
                                .name(name)
                                .provider(provider)
                                .providerId(providerId)
                                .build()
                ));

        // Wrap in DefaultOidcUser, but attach user as attribute for popup
        Map<String, Object> attributes = new HashMap<>(oidcUser.getAttributes());
        attributes.put("user", user);

        return new DefaultOidcUser(oidcUser.getAuthorities(), oidcUser.getIdToken(), oidcUser.getUserInfo(), "email") {
            @Override
            public Map<String, Object> getAttributes() {
                return attributes;
            }
        };
    }


}
