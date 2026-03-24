package com.coaching.taha_coaches.controller;

import com.coaching.taha_coaches.domain.user.User;
import com.coaching.taha_coaches.domain.user.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class AuthController {

    private final UserService userService;

    @GetMapping("/user/me")
    public User getCurrentUser(@AuthenticationPrincipal OAuth2User principal) {
        if (principal == null) return null;

        String email = principal.getAttribute("email");
        String name = principal.getAttribute("name");
        String providerId = principal.getAttribute("sub");

        return userService.getUserByEmail(email)
                .orElseGet(() -> userService.saveUser(
                        User.builder()
                                .email(email)
                                .name(name)
                                .provider("google")
                                .providerId(providerId)
                                .build()
                ));
    }

    @PostMapping("/logout")
    public void logout() {
        // Spring Security handles logout automatically
    }
}