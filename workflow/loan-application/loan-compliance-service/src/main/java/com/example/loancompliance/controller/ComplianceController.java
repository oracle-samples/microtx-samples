package com.example.loancompliance.controller;

import com.example.loancompliance.model.ComplianceRequest;
import com.example.loancompliance.model.ComplianceResult;
import com.example.loancompliance.service.ComplianceService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/compliance")
public class ComplianceController {

    @Autowired
    private ComplianceService complianceService;

    @PostMapping("/check")
    public ComplianceResult runCheck(@Valid @RequestBody ComplianceRequest request) {
        return complianceService.runComplianceChecks(request);
    }
}
