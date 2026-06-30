package com.eduveda.controller;

import com.eduveda.model.Institute;
import com.eduveda.repository.InstituteRepository;
import com.eduveda.repository.LeadRepository;
import com.eduveda.repository.StudentRepository;
import com.eduveda.repository.TeacherRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/institutes")
public class InstituteController {

    private final InstituteRepository instituteRepository;
    private final StudentRepository studentRepository;
    private final TeacherRepository teacherRepository;
    private final LeadRepository leadRepository;

    public InstituteController(InstituteRepository instituteRepository,
                                StudentRepository studentRepository,
                                TeacherRepository teacherRepository,
                                LeadRepository leadRepository) {
        this.instituteRepository = instituteRepository;
        this.studentRepository = studentRepository;
        this.teacherRepository = teacherRepository;
        this.leadRepository = leadRepository;
    }

    @GetMapping("/")
    public List<Institute> listInstitutes() {
        return instituteRepository.findAll();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Institute> getInstitute(@PathVariable UUID id) {
        return instituteRepository.findById(id)
            .map(ResponseEntity::ok)
            .orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateInstitute(@PathVariable UUID id, @RequestBody Map<String, Object> updates) {
        return instituteRepository.findById(id).map(institute -> {
            if (updates.containsKey("name")) institute.setName((String) updates.get("name"));
            if (updates.containsKey("logoUrl")) institute.setLogoUrl((String) updates.get("logoUrl"));
            if (updates.containsKey("address")) institute.setAddress((String) updates.get("address"));
            if (updates.containsKey("tagline")) institute.setTagline((String) updates.get("tagline"));
            return ResponseEntity.ok(instituteRepository.save(institute));
        }).orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/{id}/stats")
    public ResponseEntity<?> getStats(@PathVariable UUID id) {
        long students = studentRepository.findByInstituteId(id).size();
        long teachers = teacherRepository.findByInstituteId(id).size();
        long leads = leadRepository.findByInstituteIdOrderByAddedDateDesc(id).size();
        return ResponseEntity.ok(Map.of(
            "totalStudents", students,
            "totalTeachers", teachers,
            "totalLeads", leads
        ));
    }
}
