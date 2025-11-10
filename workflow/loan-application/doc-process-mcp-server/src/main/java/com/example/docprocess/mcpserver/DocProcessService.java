package com.example.docprocess.mcpserver;

import org.springframework.ai.tool.annotation.Tool;
import org.springframework.stereotype.Service;

@Service
public class DocProcessService {
    @Tool(description = "Verifies the identity proof")
    public String verifyIdentityProof(String identificationNumber, String identifierType) {
        System.out.println("identificationNumber: " + identificationNumber + " identifierType: " + identifierType);
        return "Identity proof is verified successfully";
    }

    @Tool(description = "Verifies the income documents")
    public String verifyIncomeProof(String docText) {
        return "Income proof is verified successfully";
    }
}