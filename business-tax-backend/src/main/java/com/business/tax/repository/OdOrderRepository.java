package com.business.tax.repository;

import com.business.tax.entity.OdOrder;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.time.LocalDate;
import java.util.List;

@Repository
public interface OdOrderRepository extends JpaRepository<OdOrder, Long> {
    List<OdOrder> findByUserId(Long userId);
    List<OdOrder> findByProviderId(Long providerId);
    List<OdOrder> findByType(String type);
    List<OdOrder> findByOrderDateBetween(LocalDate startDate, LocalDate endDate);
    List<OdOrder> findByUserIdAndType(Long userId, String type);

    @Query("SELECT o FROM OdOrder o WHERE o.user.id = :userId AND o.orderDate BETWEEN :startDate AND :endDate")
    List<OdOrder> findByUserIdAndDateRange(@Param("userId") Long userId, @Param("startDate") LocalDate startDate, @Param("endDate") LocalDate endDate);
}