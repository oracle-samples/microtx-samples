package com.oracle.example.department.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * A separate blockchain table could be used for the ledger aspects but currently this Journal serves multiple purposes:
 *  - Ledger for transfer operations
 *  - Journal for tracking changes made in an LRA
 *  - Store for LRA state
 */
@Entity
@Table(name = "JOURNAL")
@Data
@NoArgsConstructor
public class Journal {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "JOURNAL_ID")
    private long journalId;

    /**
     * Eg withdraw or deposit
     */
    @Column(name = "JOURNAL_TYPE")
    private String journalType;

    @Column(name = "ACCOUNT_ID")
    private String accountId;

    @Column(name = "LRA_ID")
    private String lraId;

    @Column(name = "LRA_STATE")
    private String lraState;

    @Column(name = "JOURNAL_AMOUNT")
    private double journalAmount;

    public Journal(String journalType, String accountId, double journalAmount, String lraId, String lraState) {
        this.journalType = journalType;
        this.accountId = accountId;
        this.lraId = lraId;
        this.lraState = lraState;
        this.journalAmount = journalAmount;
    }
}
