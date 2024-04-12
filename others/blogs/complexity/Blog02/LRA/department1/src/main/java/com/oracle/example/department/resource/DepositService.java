package com.oracle.example.department.resource;

import com.oracle.example.department.dao.AccountTransferDAO;
import com.oracle.example.department.data.IAccountOperationService;
import com.oracle.example.department.entity.Journal;
import com.oracle.example.department.enums.JournalType;
import com.oracle.example.department.repository.JournalRepository;
import com.oracle.microtx.springboot.lra.annotation.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import static com.oracle.microtx.springboot.lra.annotation.LRA.*;

@RestController
@RequestMapping("/deposit")
public class DepositService {

    private static final Logger LOG = LoggerFactory.getLogger(DepositService.class);

    @Autowired
    IAccountOperationService accountService;

    @Autowired
    JournalRepository journalRepository;

    @Autowired
    AccountTransferDAO accountTransferDAO;

    /**
     * cancelOnFamily attribute in @LRA is set to empty array to avoid cancellation from participant.
     * As per the requirement, only initiator can trigger cancel, while participant returns right HTTP status code to initiator
     */
    @RequestMapping(value = "/{accountId}", method = RequestMethod.POST)
    @LRA(value = Type.MANDATORY, end = false, cancelOnFamily = {})
    public ResponseEntity<?> deposit(@RequestHeader(LRA_HTTP_CONTEXT_HEADER) String lraId,
                                     @PathVariable("accountId") String accountId, @RequestParam("amount") double amount) {
        accountTransferDAO.saveJournal(new Journal(JournalType.DEPOSIT.name(), accountId, amount, lraId, ParticipantStatus.Active.name()));
        return ResponseEntity.ok("Amount deposited to the account");
    }

    /**
     * Increase balance amount as recorded in journal during deposit call.
     * Update LRA state to ParticipantStatus.Completed.
     */
    @RequestMapping(value = "/complete", method = RequestMethod.PUT)
    @Complete
    public ResponseEntity<?> completeWork(@RequestHeader(LRA_HTTP_CONTEXT_HEADER) String lraId) {
        try {
            LOG.info("deposit complete called for LRA : " + lraId);
            Journal journal = accountTransferDAO.getJournalForLRAid(lraId, JournalType.DEPOSIT);
            if (journal != null) {
                String lraState = journal.getLraState();
                if (lraState.equals(ParticipantStatus.Completing.name()) ||
                        lraState.equals(ParticipantStatus.Completed.name())) {
                    // idempotency : if current LRA stats is already Completed, do nothing
                    return ResponseEntity.ok(ParticipantStatus.valueOf(lraState));
                }
                accountTransferDAO.doCompleteWork(journal);
            } else {
                LOG.warn("Journal entry does not exist for LRA : {} ", lraId);
            }
            return ResponseEntity.ok(ParticipantStatus.Completed.name());
        } catch (Exception e) {
            LOG.error("Complete operation failed : " + e.getMessage());
            return ResponseEntity.ok(ParticipantStatus.FailedToComplete.name());
        }
    }

    /**
     * Update LRA state to ParticipantStatus.Compensated.
     */
    @RequestMapping(value = "/compensate", method = RequestMethod.PUT)
    @Compensate
    public ResponseEntity<?> compensateWork(@RequestHeader(LRA_HTTP_CONTEXT_HEADER) String lraId) {
        LOG.info("Account deposit compensate() called for LRA : " + lraId);
        Journal journal = accountTransferDAO.getJournalForLRAid(lraId, JournalType.DEPOSIT);
        if (journal != null) {
            String lraState = journal.getLraState();
            if (lraState.equals(ParticipantStatus.Compensating.name()) ||
                    lraState.equals(ParticipantStatus.Compensated.name())) {
                // idempotency : if current LRA stats is already Compensated, do nothing
                return ResponseEntity.ok(ParticipantStatus.valueOf(lraState));
            }
            journal.setLraState(ParticipantStatus.Compensated.name());
            accountTransferDAO.saveJournal(journal);
        }
        return ResponseEntity.ok(ParticipantStatus.Compensated.name());
    }

    @RequestMapping(value = "/status", method = RequestMethod.GET)
    @Status
    public ResponseEntity<?> status(@RequestHeader(LRA_HTTP_CONTEXT_HEADER) String lraId,
                                    @RequestHeader(LRA_HTTP_PARENT_CONTEXT_HEADER) String parentLRA) throws Exception {
        return accountTransferDAO.status(lraId, JournalType.DEPOSIT);
    }

    /**
     * Delete journal entry for LRA (or keep for auditing)
     */
    @RequestMapping(value = "/after", method = RequestMethod.PUT)
    @AfterLRA
    public ResponseEntity<?> afterLRA(@RequestHeader(LRA_HTTP_ENDED_CONTEXT_HEADER) String lraId, @RequestBody String status) {
        LOG.info("After LRA Called : " + lraId);
        accountTransferDAO.afterLRA(lraId, status, JournalType.DEPOSIT);
        return ResponseEntity.ok().build();
    }

}
