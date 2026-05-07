package com.business.tax.repository;

import com.business.tax.entity.BoFunction;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface BoFunctionRepository extends JpaRepository<BoFunction, Long> {
    Optional<BoFunction> findByName(String name);
    boolean existsByName(String name);
}