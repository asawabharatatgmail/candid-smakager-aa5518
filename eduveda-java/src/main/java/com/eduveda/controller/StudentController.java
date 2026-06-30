package com.eduveda.controller;

import com.eduveda.model.Student;
import com.eduveda.repository.StudentRepository;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/students")
public class StudentController {

    private final StudentRepository studentRepository;
    private final PasswordEncoder passwordEncoder;

    public StudentController(StudentRepository studentRepository, PasswordEncoder passwordEncoder) {
        this.studentRepository = studentRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @GetMapping("/")
    public List<Student> listStudents(@RequestParam(required = false) UUID instituteId) {
        if (instituteId != null) return studentRepository.findByInstituteId(instituteId);
        return studentRepository.findAll();
    }

    @PostMapping("/")
    @ResponseStatus(HttpStatus.CREATED)
    public Student createStudent(@RequestBody Map<String, Object> body) {
        Student s = new Student();
        s.setName((String) body.get("name"));
        s.setEmail((String) body.get("email"));
        s.setMobile((String) body.get("mobile"));
        s.setInstituteId(UUID.fromString((String) body.get("instituteId")));
        s.setPasswordHash(passwordEncoder.encode((String) body.get("password")));
        if (body.get("classId") != null) s.setClassId(UUID.fromString((String) body.get("classId")));
        if (body.get("parentName") != null) s.setParentName((String) body.get("parentName"));
        if (body.get("parentEmail") != null) s.setParentEmail((String) body.get("parentEmail"));
        if (body.get("parentMobile") != null) s.setParentMobile((String) body.get("parentMobile"));
        return studentRepository.save(s);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Student> getStudent(@PathVariable UUID id) {
        return studentRepository.findById(id)
            .map(ResponseEntity::ok)
            .orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/{id}")
    public ResponseEntity<Student> updateStudent(@PathVariable UUID id, @RequestBody Map<String, Object> updates) {
        return studentRepository.findById(id).map(s -> {
            if (updates.containsKey("name")) s.setName((String) updates.get("name"));
            if (updates.containsKey("mobile")) s.setMobile((String) updates.get("mobile"));
            if (updates.containsKey("status")) s.setStatus((String) updates.get("status"));
            return ResponseEntity.ok(studentRepository.save(s));
        }).orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteStudent(@PathVariable UUID id) {
        studentRepository.deleteById(id);
    }
}
