package com.business.tax.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;

@Entity
@Table(name = "bo_role_function_map", indexes = {
    @Index(name = "idx_bo_role_func_map_role_id", columnList = "role_id"),
    @Index(name = "idx_bo_role_func_map_function_id", columnList = "function_id")
}, uniqueConstraints = {
    @UniqueConstraint(name = "uk_bo_role_function_map_role_func", columnNames = {"role_id", "function_id"})
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BoRoleFunctionMap {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "role_id", nullable = false)
    private BoRole role;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "function_id", nullable = false)
    private BoFunction function;

    @Column(name = "created_date", nullable = false)
    private LocalDate createdDate;

    @Column(name = "created_by", length = 100)
    private String createdBy;
}