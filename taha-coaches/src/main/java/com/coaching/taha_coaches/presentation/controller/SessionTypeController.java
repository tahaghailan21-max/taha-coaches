package com.coaching.taha_coaches.presentation.controller;

import com.coaching.taha_coaches.domain.sessiontype.SessionType;
import com.coaching.taha_coaches.domain.sessiontype.SessionTypeService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/public/session-types")
@RequiredArgsConstructor
public class SessionTypeController {

    private final SessionTypeService service;

    @GetMapping
    public ResponseEntity<List<SessionType>> getActive() {
        return ResponseEntity.ok(service.getActive());
    }
}
