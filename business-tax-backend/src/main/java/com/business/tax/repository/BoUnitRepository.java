package com.business.tax.repository;

import com.business.tax.entity.BoUnit;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface BoUnitRepository extends JpaRepository<BoUnit, Long> {
    Optional<BoUnit> findByName(String name);
    boolean existsByName(String name);
}