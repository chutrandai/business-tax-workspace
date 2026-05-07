package com.business.tax.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;

@Entity
@Table(name = "bo_user", indexes = {
    @Index(name = "idx_bo_user_tax_number", columnList = "tax_number"),
    @Index(name = "idx_bo_user_user_name", columnList = "user_name"),
    @Index(name = "idx_bo_user_role_id", columnList = "role_id")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BoUser {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "full_name", nullable = false, length = 255)
    private String fullName;

    @Column(name = "mobile_number", length = 20)
    private String mobileNumber;

    @Column(name = "email", length = 255)
    private String email;

    @Column(name = "tax_number", unique = true, length = 50)
    private String taxNumber;

    @Column(name = "address", length = 500)
    private String address;

    @Column(name = "user_name", nullable = false, unique = true, length = 100)
    private String userName;

    @Column(name = "pass_word", nullable = false, length = 255)
    private String passWord;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "role_id")
    private BoRole role;

    @Column(name = "created_date", nullable = false)
    private LocalDate createdDate;

    @Column(name = "created_by", length = 100)
    private String createdBy;

    @Column(name = "updated_date")
    private LocalDate updatedDate;

    @Column(name = "updated_by", length = 100)
    private String updatedBy;

    @Column(name = "status", nullable = false, length = 20)
    @Builder.Default
    private String status = "ACTIVE";
}