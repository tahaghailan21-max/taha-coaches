package com.coaching.taha_coaches.domain.user;

import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.util.Arrays;
import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class UserService {
    private final UserRepository userRepository;

    @Value("${app.admin-emails:}")
    private String adminEmails;

    public Optional<User> getUserById(UUID id) {
        return userRepository.findById(id);
    }

    public User saveUser(User user) {
        return userRepository.save(user);
    }

    public Optional<User> getUserByEmail(String email) {
        return userRepository.findByEmail(email);
    }

    /**
     * Promotes the user to ADMIN if their email is listed in app.admin-emails,
     * demotes back to CLIENT if it no longer is. Called on every login so the
     * stored role stays in sync with configuration.
     */
    public User syncRole(User user) {
        boolean shouldBeAdmin = user.getEmail() != null && Arrays.stream(adminEmails.split(","))
                .map(String::trim)
                .filter(e -> !e.isEmpty())
                .anyMatch(e -> e.equalsIgnoreCase(user.getEmail()));

        Role expected = shouldBeAdmin ? Role.ADMIN : Role.CLIENT;
        if (user.getRole() != expected) {
            user.setRole(expected);
            return userRepository.save(user);
        }
        return user;
    }
}
