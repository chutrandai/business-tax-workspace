package com.business.tax.repository;

import com.business.tax.entity.BoRole;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface BoRoleRepository extends JpaRepository<BoRole, Long> {
    Optional<BoRole> findByName(String name);
    boolean existsByName(String name);
}