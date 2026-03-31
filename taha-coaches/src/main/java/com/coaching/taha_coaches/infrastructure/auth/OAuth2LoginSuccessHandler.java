package com.coaching.taha_coaches.infrastructure.auth;

import com.coaching.taha_coaches.domain.user.User;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.core.oidc.user.OidcUser;
import org.springframework.stereotype.Component;
import org.springframework.security.web.authentication.SimpleUrlAuthenticationSuccessHandler;

import java.io.IOException;

@Component
@RequiredArgsConstructor
public class OAuth2LoginSuccessHandler extends SimpleUrlAuthenticationSuccessHandler {

    private final ObjectMapper objectMapper;

    @Value("${frontend.url}")
    private String frontendUrl;

    @Override
    public void onAuthenticationSuccess(HttpServletRequest request,
                                        HttpServletResponse response,
                                        Authentication authentication) throws IOException {

        AuthenticatedUser principal =
                (AuthenticatedUser) authentication.getPrincipal();

        User user = principal.getUser();

        String userJson = objectMapper.writeValueAsString(user);

        response.setContentType("text/html");
        response.setCharacterEncoding("UTF-8");
        response.getWriter().write("""
            <html>
            <body>
              <script>
                window.opener.postMessage(%s, '%s');
                window.close();
              </script>
            </body>
            </html>
        """.formatted(userJson, frontendUrl));
        response.getWriter().flush();
    }
}