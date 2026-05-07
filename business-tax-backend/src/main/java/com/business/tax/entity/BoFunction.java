package com.business.tax.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;
import java.util.HashSet;
import java.util.Set;

@Entity
@Table(name = "bo_function", indexes = {
    @Index(name = "idx_bo_function_name", columnList = "name")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BoFunction {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "name", nullable = false, length = 100)
    private String name;

    @Column(name = "description", length = 500)
    private String description;

    @Column(name = "created_date", nullable = false)
    private LocalDate createdDate;

    @Column(name = "created_by", length = 100)
    private String createdBy;

    @OneToMany(mappedBy = "function", fetch = FetchType.LAZY)
    @Builder.Default
    private Set<BoRoleFunctionMap> roleFunctionMaps = new HashSet<>();
}