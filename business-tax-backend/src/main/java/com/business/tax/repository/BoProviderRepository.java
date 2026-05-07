package com.business.tax.repository;

import com.business.tax.entity.BoProvider;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface BoProviderRepository extends JpaRepository<BoProvider, Long> {
    Optional<BoProvider> findByFullName(String fullName);
    Optional<BoProvider> findByIdentificatonNumber(String identificatonNumber);
    boolean existsByFullName(String fullName);
    boolean existsByIdentificatonNumber(String identificatonNumber);
}