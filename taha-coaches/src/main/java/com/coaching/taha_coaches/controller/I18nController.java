package com.coaching.taha_coaches.controller;


import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.MessageSource;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Locale;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/public/i18n")
@RequiredArgsConstructor
public class I18nController {

    private final MessageSource messageSource;

    // Return a map of keys -> translated messages
    @GetMapping("/{lang}")
    public Map<String, String> getLoginMessages(@PathVariable String lang) {
        Locale locale = new Locale(lang);
        return Map.of(
                "username", messageSource.getMessage("login.username", null, locale),
                "password", messageSource.getMessage("login.password", null, locale),
                "submit", messageSource.getMessage("login.submit", null, locale),
                "error", messageSource.getMessage("login.error", null, locale)
        );
    }

}
