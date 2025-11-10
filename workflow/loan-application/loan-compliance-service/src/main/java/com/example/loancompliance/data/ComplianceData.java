package com.example.loancompliance.data;

import org.springframework.stereotype.Component;

import java.util.HashMap;
import java.util.Map;

@Component
public class ComplianceData {
    public static Map<String, Map<String, Object>> complianceData = new HashMap<>();

    public ComplianceData() {
        complianceData.put("123-45-6789",  Map.of(
                "name", "John Smith",
                "credit_score", 800,
                "aml_flagged", false
                ));
        complianceData.put("219-09-9999", Map.of(
                "name", "Jane Doe",
                "credit_score", 300,
                "aml_flagged", false
        ));
        complianceData.put("078-05-1120", Map.of(
                "name", "Richard Williams",
                "credit_score", 500,
                "aml_flagged", false
        ));
        complianceData.put("000-12-3456", Map.of(
                "name", "Joseph Rodriguez",
                "credit_score", 750,
                "aml_flagged", true
        ));
    }

    public Map<String, Object> getComplianceData(String socialSecurityNumber) {
        return complianceData.get(socialSecurityNumber);
    }
}
