package com.coaching.taha_coaches.infrastructure.config;

import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "booking")
public record BookingProperties(
    int minNoticeHours,
    int horizonDays,
    int cancelCutoffHours,
    int pendingExpiryHours,
    int gridMinutes
) {}
