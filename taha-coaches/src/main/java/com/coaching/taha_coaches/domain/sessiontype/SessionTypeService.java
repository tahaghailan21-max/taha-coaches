package com.coaching.taha_coaches.domain.sessiontype;

import com.coaching.taha_coaches.domain.sessiontype.exceptions.SessionTypeNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class SessionTypeService {

    private final SessionTypeRepository repository;

    public List<SessionType> getActive() {
        return repository.findByActiveTrueOrderBySortOrderAsc();
    }

    public SessionType getById(UUID id) {
        return repository.findById(id).orElseThrow(SessionTypeNotFoundException::new);
    }
}
