package com.coaching.taha_coaches;

import com.coaching.taha_coaches.infrastructure.config.BookingProperties;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
@EnableConfigurationProperties(BookingProperties.class)
public class TahaCoachesApplication {
    public static void main(String[] args) {
        SpringApplication.run(TahaCoachesApplication.class, args);
    }
}
