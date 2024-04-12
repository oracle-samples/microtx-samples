package com.oracle.example.department.resource;

import com.oracle.example.department.dao.AccountTransferDAO;
import com.oracle.example.department.data.IAccountOperationService;
import com.oracle.example.department.data.IAccountQueryService;
import com.oracle.example.department.entity.Journal;
import com.oracle.example.department.enums.JournalType;
import com.oracle.example.department.exception.NotFoundException;
import com.oracle.example.department.exception.UnprocessableEntityException;
import com.oracle.example.department.repository.JournalRepository;
import com.oracle.microtx.springboot.lra.annotation.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import static com.oracle.microtx.springboot.lra.annotation.LRA.*;

@RestController
@RequestMapping("/withdraw")
public class WithdrawService {

    private static final Logger LOG = LoggerFactory.getLogger(WithdrawService.class);

    @Autowired
    IAccountOperationService accountService;

    @Autowired
    JournalRepository journalRepository;

    @Autowired
    AccountTransferDAO accountTransferDAO;

    @Autowired
    IAccountQueryService accountQueryService;

    /**
     * cancelOnFamily attribute in @LRA is set to empty array to avoid cancellation from participant.
     * As per the requirement, only initiator can trigger cancel, while participant returns right HTTP status code to initiator
     */
    @RequestMapping(value = "/{accountId}", method = RequestMethod.POST)
    @LRA(value = LRA.Type.MANDATORY, end = false, cancelOnFamily = {})
    public ResponseEntity<?> withdraw(@RequestHeader(LRA_HTTP_CONTEXT_HEADER) String lraId,
                                      @PathVariable("accountId") String accountId, @RequestParam("amount") double amount) {
        try {
            this.accountService.withdraw(accountId, amount);
            accountTransferDAO.saveJournal(new Journal(JournalType.WITHDRAW.name(), accountId, amount, lraId, ParticipantStatus.Active.name()));
            LOG.info(amount + " withdrawn from account: " + accountId);
            return ResponseEntity.ok("Amount withdrawn from the account");
        } catch (NotFoundException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
        } catch (UnprocessableEntityException e) {
            LOG.error(e.getLocalizedMessage());
            return ResponseEntity.status(HttpStatus.UNPROCESSABLE_ENTITY).body(e.getMessage());
        } catch (Exception e) {
            LOG.error(e.getLocalizedMessage());
            return ResponseEntity.internalServerError().body(e.getLocalizedMessage());
        }
    }

    /**
     * Update LRA state. Do nothing else.
     */
    @RequestMapping(value = "/complete", method = RequestMethod.PUT)
    @Complete
    public ResponseEntity<?> completeWork(@RequestHeader(LRA_HTTP_CONTEXT_HEADER) String lraId) {
        LOG.info("withdraw complete called for LRA : " + lraId);
        Journal journal = accountTransferDAO.getJournalForLRAid(lraId, JournalType.WITHDRAW);
        if (journal != null) {
            String lraState = journal.getLraState();
            if (lraState.equals(ParticipantStatus.Completing.name()) ||
                    lraState.equals(ParticipantStatus.Completed.name())) {
                // idempotency : if current LRA stats is already Completed, do nothing
                return ResponseEntity.ok(ParticipantStatus.valueOf(lraState));
            }
            journal.setLraState(ParticipantStatus.Completed.name());
            accountTransferDAO.saveJournal(journal);
        }
        return ResponseEntity.ok(ParticipantStatus.Completed.name());
    }

    /**
     * Read the journal and increase the balance by the previous withdrawal amount before the LRA
     */
    @RequestMapping(value = "/compensate", method = RequestMethod.PUT)
    @Compensate
    public ResponseEntity<?> compensateWork(@RequestHeader(LRA_HTTP_CONTEXT_HEADER) String lraId) {
        LOG.info("Account withdraw compensate() called for LRA : " + lraId);
        try {
            Journal journal = accountTransferDAO.getJournalForLRAid(lraId, JournalType.WITHDRAW);
            if (journal != null) {
                String lraState = journal.getLraState();
                if (lraState.equals(ParticipantStatus.Compensating.name()) ||
                        lraState.equals(ParticipantStatus.Compensated.name())) {
                    // idempotency : if current LRA stats is already Compensated, do nothing
                    return ResponseEntity.ok(ParticipantStatus.valueOf(lraState));
                }
                accountTransferDAO.doCompensationWork(journal);
            } else {
                LOG.warn("Journal entry does not exist for LRA : {} ", lraId);
            }
            return ResponseEntity.ok(ParticipantStatus.Compensated.name());
        } catch (Exception e) {
            LOG.error("Compensate operation failed : " + e.getMessage());
            return ResponseEntity.ok(ParticipantStatus.FailedToCompensate.name());
        }
    }

    @RequestMapping(value = "/status", method = RequestMethod.GET)
    @Status
    public ResponseEntity<?> status(@RequestHeader(LRA_HTTP_CONTEXT_HEADER) String lraId,
                                    @RequestHeader(LRA_HTTP_PARENT_CONTEXT_HEADER) String parentLRA) throws Exception {
        return accountTransferDAO.status(lraId, JournalType.WITHDRAW);
    }

    /**
     * Delete journal entry for LRA (or keep for auditing)
     */
    @RequestMapping(value = "/after", method = RequestMethod.PUT)
    @AfterLRA
    public ResponseEntity<?> afterLRA(@RequestHeader(LRA_HTTP_ENDED_CONTEXT_HEADER) String lraId, @RequestBody String status) {
        LOG.info("After LRA called for lraId : {} with status {} ", lraId, status);
        accountTransferDAO.afterLRA(lraId, status, JournalType.WITHDRAW);
        return ResponseEntity.ok().build();
    }

}
