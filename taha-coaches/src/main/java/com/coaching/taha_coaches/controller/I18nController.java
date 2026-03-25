package com.coaching.taha_coaches.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.context.MessageSource;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.*;

@RestController
@RequestMapping("/api/public/i18n")
@RequiredArgsConstructor
public class I18nController {

    private final MessageSource messageSource;

    @GetMapping("/{lang}")
    public Map<String, String> getTranslations(@PathVariable String lang) {
        Locale locale = Locale.forLanguageTag(lang);

        // Fetch all keys dynamically
        ResourceBundle bundle = ResourceBundle.getBundle("messages", locale);

        Map<String, String> translations = new HashMap<>();
        for (String key : bundle.keySet()) {
            translations.put(key, bundle.getString(key));
        }

        return translations;
    }
}