package com.eduveda.repository;

import com.eduveda.model.Student;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface StudentRepository extends JpaRepository<Student, UUID> {
    Optional<Student> findByEmail(String email);
    List<Student> findByInstituteId(UUID instituteId);
    List<Student> findByClassId(UUID classId);
}
