package com.eduveda.controller;

import com.eduveda.dto.LoginRequest;
import com.eduveda.model.AppUser;
import com.eduveda.model.Student;
import com.eduveda.model.Teacher;
import com.eduveda.repository.AppUserRepository;
import com.eduveda.repository.StudentRepository;
import com.eduveda.repository.TeacherRepository;
import com.eduveda.service.JwtService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AppUserRepository userRepository;
    private final StudentRepository studentRepository;
    private final TeacherRepository teacherRepository;
    private final JwtService jwtService;
    private final PasswordEncoder passwordEncoder;

    public AuthController(AppUserRepository userRepository,
                          StudentRepository studentRepository,
                          TeacherRepository teacherRepository,
                          JwtService jwtService,
                          PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.studentRepository = studentRepository;
        this.teacherRepository = teacherRepository;
        this.jwtService = jwtService;
        this.passwordEncoder = passwordEncoder;
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@Valid @RequestBody LoginRequest req) {
        String email = req.getEmail();

        // Try users table
        Optional<AppUser> userOpt = userRepository.findByEmail(email);
        if (userOpt.isPresent()) {
            AppUser user = userOpt.get();
            if (!passwordEncoder.matches(req.getPassword(), user.getPasswordHash())) {
                return ResponseEntity.status(401).body(Map.of("error", "Invalid credentials"));
            }
            if ("inactive".equals(user.getStatus())) {
                return ResponseEntity.status(403).body(Map.of("error", "Account inactive"));
            }
            String token = jwtService.generateToken(user.getId().toString(), user.getRole(), user.getInstituteId().toString());
            return buildTokenResponse(token, Map.of(
                "id", user.getId(), "name", user.getName(), "email", user.getEmail(),
                "role", user.getRole(), "instituteId", user.getInstituteId()
            ));
        }

        // Try students
        Optional<Student> studentOpt = studentRepository.findByEmail(email);
        if (studentOpt.isPresent()) {
            Student s = studentOpt.get();
            if (!passwordEncoder.matches(req.getPassword(), s.getPasswordHash())) {
                return ResponseEntity.status(401).body(Map.of("error", "Invalid credentials"));
            }
            String token = jwtService.generateToken(s.getId().toString(), "Student", s.getInstituteId().toString());
            return buildTokenResponse(token, Map.of(
                "id", s.getId(), "name", s.getName(), "email", s.getEmail(),
                "role", "Student", "instituteId", s.getInstituteId()
            ));
        }

        // Try teachers
        Optional<Teacher> teacherOpt = teacherRepository.findByEmail(email);
        if (teacherOpt.isPresent()) {
            Teacher t = teacherOpt.get();
            if (!passwordEncoder.matches(req.getPassword(), t.getPasswordHash())) {
                return ResponseEntity.status(401).body(Map.of("error", "Invalid credentials"));
            }
            String token = jwtService.generateToken(t.getId().toString(), "Teacher", t.getInstituteId().toString());
            return buildTokenResponse(token, Map.of(
                "id", t.getId(), "name", t.getName(), "email", t.getEmail(),
                "role", "Teacher", "instituteId", t.getInstituteId()
            ));
        }

        return ResponseEntity.status(401).body(Map.of("error", "Invalid email or password"));
    }

    private ResponseEntity<?> buildTokenResponse(String token, Map<String, Object> user) {
        return ResponseEntity.ok(Map.of(
            "access_token", token,
            "token_type", "bearer",
            "user", user
        ));
    }
}
