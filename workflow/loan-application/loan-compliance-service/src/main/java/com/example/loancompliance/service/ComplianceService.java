package com.example.loancompliance.service;

import com.example.loancompliance.data.ComplianceData;
import com.example.loancompliance.model.ComplianceRequest;
import com.example.loancompliance.model.ComplianceResult;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.Map;

@Service
public class ComplianceService {

    @Autowired
    private ComplianceData complianceData;

    public ComplianceResult runComplianceChecks(ComplianceRequest request) {
        Map<String, Object> userComplianceData =  complianceData.getComplianceData(request.getSocialSecurityNumber());
        if (userComplianceData == null) {
            return new ComplianceResult(false, 0, false, "No compliance data found for given ssn");
        }

        boolean amlFlagged = (boolean) userComplianceData.get("aml_flagged");
        Integer creditScore = (Integer) userComplianceData.get("credit_score");

        if (amlFlagged) {
            return new ComplianceResult(false, creditScore, amlFlagged, "User flagged in AML");
        }

        if (creditScore < 700) {
            return new ComplianceResult(false, creditScore, amlFlagged, "Credit score below threshold 700 value");
        }

        return new ComplianceResult(true, creditScore, amlFlagged, "Compliance check passed");
    }
}
