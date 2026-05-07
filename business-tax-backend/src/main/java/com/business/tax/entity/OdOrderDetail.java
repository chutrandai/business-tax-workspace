package com.business.tax.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;

@Entity
@Table(name = "od_order_detail", indexes = {
    @Index(name = "idx_od_order_detail_order_id", columnList = "order_id"),
    @Index(name = "idx_od_order_detail_unit_id", columnList = "unit_id"),
    @Index(name = "idx_od_order_detail_product_name", columnList = "product_name")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class OdOrderDetail {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "order_id", nullable = false)
    private OdOrder order;

    @Column(name = "product_name", nullable = false, length = 255)
    private String productName;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "unit_id")
    private BoUnit unit;

    @Column(name = "quantity", nullable = false)
    @Builder.Default
    private Long quantity = 0L;

    @Column(name = "unit_price", nullable = false)
    @Builder.Default
    private Long unitPrice = 0L;

    @Column(name = "total_amount", nullable = false)
    @Builder.Default
    private Long totalAmount = 0L;

    @Column(name = "created_date", nullable = false)
    private LocalDate createdDate;

    @Column(name = "created_by", length = 100)
    private String createdBy;
}