package com.oracle.example.department.dao;

import com.oracle.example.department.data.AccountOperationService;
import com.oracle.example.department.data.IAccountQueryService;
import com.oracle.example.department.entity.Account;
import com.oracle.example.department.entity.Journal;
import com.oracle.example.department.enums.JournalType;
import com.oracle.example.department.repository.JournalRepository;
import com.oracle.microtx.springboot.lra.annotation.LRAStatus;
import com.oracle.microtx.springboot.lra.annotation.ParticipantStatus;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.util.Objects;

@Component
@Transactional
public class AccountTransferDAO {

    @Autowired
    JournalRepository journalRepository;

    @Autowired
    AccountOperationService accountService;

    @Autowired
    IAccountQueryService accountQueryService;

    public void doCompensationWork(Journal journal) throws Exception {
        try {
            Account account = accountQueryService.getAccountDetails(journal.getAccountId());
            account.setAmount(account.getAmount() + journal.getJournalAmount());
            accountService.save(account);
            journal.setLraState(ParticipantStatus.Compensated.name());
            journalRepository.save(journal);
        } catch (Exception e) {
            journal.setLraState(ParticipantStatus.FailedToCompensate.name());
            journalRepository.save(journal);
            throw new Exception("Failed to compensate", e);
        }
    }

    public void doCompleteWork(Journal journal) throws Exception {
        try {
            Account account = accountQueryService.getAccountDetails(journal.getAccountId());
            account.setAmount(account.getAmount() + journal.getJournalAmount());
            accountService.save(account);
            journal.setLraState(ParticipantStatus.Completed.name());
            journalRepository.save(journal);
        } catch (Exception e) {
            journal.setLraState(ParticipantStatus.FailedToComplete.name());
            journalRepository.save(journal);
            throw new Exception("Failed to complete", e);
        }
    }

    public ResponseEntity<?> status(String lraId, JournalType journalType) {
        Journal journal = getJournalForLRAid(lraId, journalType);
        if (Objects.nonNull(journal) && journal.getLraState().equals(ParticipantStatus.Compensated.name())) {
            return ResponseEntity.ok(ParticipantStatus.Compensated);
        } else {
            return ResponseEntity.ok(ParticipantStatus.Completed);
        }
    }

    /**
     * In the case of successful ending status of the LRA, we are purging the journal of the LRA
     * However, if required, comment below code to keep the entry for analysis/auditing
     */
    public void afterLRA(String lraId, String lraStatus, JournalType journalType){
        Journal journal = getJournalForLRAid(lraId, journalType);
        if (Objects.nonNull(journal) && isLRASuccessfullyEnded(lraStatus)) {
            journalRepository.delete(journal);
        }
    }

    public Journal getJournalForLRAid(String lraId, JournalType journalType) {
        return journalRepository.findJournalByLraIdAndJournalType(lraId, journalType.name());
    }

    public void saveJournal(Journal journal) {
        journalRepository.save(journal);
    }

    private static boolean isLRASuccessfullyEnded(String lraStatus) {
        return lraStatus.equals(LRAStatus.Cancelled.name()) || lraStatus.equals(LRAStatus.Closed.name());
    }

}
