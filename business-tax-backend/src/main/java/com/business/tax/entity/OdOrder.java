package com.business.tax.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "od_order", indexes = {
    @Index(name = "idx_od_order_user_id", columnList = "user_id"),
    @Index(name = "idx_od_order_provider_id", columnList = "provider_id"),
    @Index(name = "idx_od_order_type", columnList = "type"),
    @Index(name = "idx_od_order_date", columnList = "order_date")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class OdOrder {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "type", nullable = false, length = 10)
    private String type; // IN (nhập hàng) / OUT (xuất hàng)

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private BoUser user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "provider_id")
    private BoProvider provider;

    @Column(name = "order_date", nullable = false)
    private LocalDate orderDate;

    @Column(name = "total_amount")
    @Builder.Default
    private Long totalAmount = 0L;

    @Column(name = "description", length = 1000)
    private String description;

    @Column(name = "created_date", nullable = false)
    private LocalDate createdDate;

    @Column(name = "created_by", length = 100)
    private String createdBy;

    @OneToMany(mappedBy = "order", fetch = FetchType.LAZY, cascade = CascadeType.ALL)
    @Builder.Default
    private List<OdOrderDetail> orderDetails = new ArrayList<>();
}