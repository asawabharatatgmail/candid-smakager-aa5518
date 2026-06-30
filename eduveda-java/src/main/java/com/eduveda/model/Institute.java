package com.eduveda.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "institutes")
@Data
@NoArgsConstructor
public class Institute {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false)
    private String name;

    @Column(name = "admin_email", nullable = false)
    private String adminEmail;

    @Column(name = "admin_mobile", nullable = false)
    private String adminMobile;

    @Column(name = "logo_url")
    private String logoUrl;

    private String address;
    private String tagline;

    @Column(name = "package_id")
    private UUID packageId;

    @Column(name = "subscription_status")
    private String subscriptionStatus = "inactive";

    @Column(name = "subscription_expiry")
    private LocalDate subscriptionExpiry;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private OffsetDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private OffsetDateTime updatedAt;
}
