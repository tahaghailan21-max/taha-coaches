package com.coaching.taha_coaches.domain.sessiontype;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface SessionTypeRepository extends JpaRepository<SessionType, UUID> {
    List<SessionType> findByActiveTrueOrderBySortOrderAsc();
    Optional<SessionType> findByCode(String code);
    boolean existsByCode(String code);
}
