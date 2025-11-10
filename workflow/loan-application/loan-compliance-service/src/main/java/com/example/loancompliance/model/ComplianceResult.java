package com.example.loancompliance.model;

public class ComplianceResult {
    private boolean passed;
    private Integer creditScore;
    private boolean flaggedInAmlDatabase;
    private String reason;

    public ComplianceResult(boolean passed,  Integer creditScore, boolean flaggedInAmlDatabase, String reason) {
        this.passed = passed;
        this.creditScore = creditScore;
        this.flaggedInAmlDatabase = flaggedInAmlDatabase;
        this.reason = reason;
    }

    public boolean isPassed() {
        return passed;
    }

    public String getReason() {
        return reason;
    }

    public Integer getCreditScore() {
        return creditScore;
    }

    public boolean isFlaggedInAmlDatabase() {
        return flaggedInAmlDatabase;
    }
}
