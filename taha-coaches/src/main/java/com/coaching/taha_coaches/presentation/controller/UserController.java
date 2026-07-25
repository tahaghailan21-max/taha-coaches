package com.coaching.taha_coaches.presentation.controller;

import com.coaching.taha_coaches.domain.user.User;
import com.coaching.taha_coaches.domain.user.UserRepository;
import com.coaching.taha_coaches.infrastructure.auth.AuthenticatedUser;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/user")
@RequiredArgsConstructor
@Transactional
public class UserController {
    private final UserRepository userRepository;

    @GetMapping("/me")
    public User getCurrentUser(@AuthenticationPrincipal AuthenticatedUser principal) {
        if (principal == null) return null;
        return principal.getUser();
    }
}
