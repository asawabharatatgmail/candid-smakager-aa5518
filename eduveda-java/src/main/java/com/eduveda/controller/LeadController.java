package com.eduveda.controller;

import com.eduveda.model.Lead;
import com.eduveda.repository.LeadRepository;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/leads")
public class LeadController {

    private final LeadRepository leadRepository;

    public LeadController(LeadRepository leadRepository) {
        this.leadRepository = leadRepository;
    }

    @GetMapping("/")
    public List<Lead> listLeads(@RequestParam UUID instituteId) {
        return leadRepository.findByInstituteIdOrderByAddedDateDesc(instituteId);
    }

    @PostMapping("/")
    @ResponseStatus(HttpStatus.CREATED)
    public Lead createLead(@RequestBody Map<String, Object> body) {
        Lead lead = new Lead();
        lead.setName((String) body.get("name"));
        lead.setEmail((String) body.get("email"));
        lead.setMobile((String) body.get("mobile"));
        lead.setSource((String) body.getOrDefault("source", "Website"));
        lead.setStatus((String) body.getOrDefault("status", "New"));
        lead.setInstituteId(UUID.fromString((String) body.get("instituteId")));
        lead.setAddedDate(LocalDate.now());
        if (body.get("notes") != null) lead.setNotes((String) body.get("notes"));
        return leadRepository.save(lead);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Lead> updateLead(@PathVariable UUID id, @RequestBody Map<String, Object> updates) {
        return leadRepository.findById(id).map(lead -> {
            if (updates.containsKey("status")) lead.setStatus((String) updates.get("status"));
            if (updates.containsKey("notes")) lead.setNotes((String) updates.get("notes"));
            if (updates.containsKey("source")) lead.setSource((String) updates.get("source"));
            return ResponseEntity.ok(leadRepository.save(lead));
        }).orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteLead(@PathVariable UUID id) {
        leadRepository.deleteById(id);
    }
}
