package com.coaching.taha_coaches.infrastructure.config;

import com.coaching.taha_coaches.domain.sessiontype.SessionType;
import com.coaching.taha_coaches.domain.sessiontype.SessionTypeRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class SessionTypeSeeder implements CommandLineRunner {

    private final SessionTypeRepository repository;

    @Override
    public void run(String... args) {
        seed("QUICK_CALL",     20, 1);
        seed("QUICK_SESSION",  60, 2);
        seed("NORMAL_SESSION", 90, 3);
    }

    private void seed(String code, int durationMinutes, int sortOrder) {
        if (!repository.existsByCode(code)) {
            repository.save(SessionType.builder()
                .code(code)
                .durationMinutes(durationMinutes)
                .sortOrder(sortOrder)
                .active(true)
                .build());
        }
    }
}
