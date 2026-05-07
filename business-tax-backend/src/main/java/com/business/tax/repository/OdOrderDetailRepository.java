package com.business.tax.repository;

import com.business.tax.entity.OdOrderDetail;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface OdOrderDetailRepository extends JpaRepository<OdOrderDetail, Long> {
    List<OdOrderDetail> findByOrderId(Long orderId);
    List<OdOrderDetail> findByUnitId(Long unitId);
    List<OdOrderDetail> findByProductNameContainingIgnoreCase(String productName);

    @Query("SELECT od FROM OdOrderDetail od WHERE od.order.id = :orderId")
    List<OdOrderDetail> findAllByOrderId(@Param("orderId") Long orderId);
}