package com.business.tax.repository;

import com.business.tax.entity.BoUser;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface BoUserRepository extends JpaRepository<BoUser, Long> {
    Optional<BoUser> findByUserName(String userName);
    Optional<BoUser> findByEmail(String email);
    Optional<BoUser> findByTaxNumber(String taxNumber);
    boolean existsByUserName(String userName);
    boolean existsByEmail(String email);
    boolean existsByTaxNumber(String taxNumber);
}