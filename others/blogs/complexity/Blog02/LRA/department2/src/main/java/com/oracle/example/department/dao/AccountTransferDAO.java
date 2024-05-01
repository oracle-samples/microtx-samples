/*
Copyright (c) 2023, Oracle and/or its affiliates. **

The Universal Permissive License (UPL), Version 1.0 **

Subject to the condition set forth below, permission is hereby granted to any person obtaining a copy of this software, associated documentation and/or data
(collectively the "Software"), free of charge and under any and all copyright rights in the Software, and any and all patent rights owned or freely licensable by each
licensor hereunder covering either the unmodified Software as contributed to or provided by such licensor, or (ii) the Larger Works (as defined below), to deal in both **
(a) the Software, and (b) any piece of software and/or hardware listed in the lrgrwrks.txt file if one is included with the Software (each a "Larger Work" to which the
Software is contributed by such licensors), **
without restriction, including without limitation the rights to copy, create derivative works of, display, perform, and distribute the Software and make, use, sell,
offer for sale, import, export, have made, and have sold the Software and the Larger Work(s), and to sublicense the foregoing rights on either these or other terms. **

This license is subject to the following condition: The above copyright notice and either this complete permission notice or at a minimum a reference to the UPL must be
included in all copies or substantial portions of the Software. **

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A
PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF
CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
*/
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
