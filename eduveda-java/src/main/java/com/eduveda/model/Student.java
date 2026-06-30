package com.eduveda.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "students")
@Data
@NoArgsConstructor
public class Student {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false)
    private String name;

    @Column(unique = true, nullable = false)
    private String email;

    @Column(nullable = false)
    private String mobile;

    @Column(name = "class_id")
    private UUID classId;

    @Column(name = "status")
    private String status = "active";

    @Column(name = "parent_name")
    private String parentName;

    @Column(name = "parent_email")
    private String parentEmail;

    @Column(name = "parent_mobile")
    private String parentMobile;

    @Column(name = "institute_id", nullable = false)
    private UUID instituteId;

    @Column(name = "password_hash", nullable = false)
    private String passwordHash;

    @Column(name = "connected_email")
    private String connectedEmail;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private OffsetDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private OffsetDateTime updatedAt;
}
