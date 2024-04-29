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
package com.oracle.tmm.corebanking.listeners;


import com.oracle.tmm.corebanking.domain.AccountBranchDetails;
import com.oracle.tmm.corebanking.domain.TransactionHistoryEntry;
import com.oracle.tmm.corebanking.domain.enums.TransactionType;
import com.oracle.tmm.corebanking.domain.response.ErrorResponse;
import com.oracle.tmm.corebanking.domain.transactions.DebitRequest;
import com.oracle.tmm.corebanking.services.IBankTransactionService;
import com.oracle.tmm.corebanking.services.IBranchService;
import com.oracle.tmm.corebanking.services.IHistoryService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

/**
 * Listener for MicroTx transaction. This class methods will be called on registered transactions.
 */
@RestController
@RequestMapping("debit-transaction-sync")
@Slf4j
public class DebitTransactionEventListenerResource {

    @Autowired
    @Qualifier("DebitTransactionContext")
    Map<String, DebitRequest> debitTransactionContext;

    @Autowired
    IHistoryService historyService;

    @Autowired
    IBankTransactionService bankTransactionService;

    @Autowired
    IBranchService branchService;

    /**
     * The beforeCompletion method is called by the transaction manager prior to the start of the two-phase transaction commit process.
     * This call is executed with the transaction context of the transaction that is being committed.
     *
     **/
    @RequestMapping(value = "/{gtrid}/beforecompletion", method = RequestMethod.POST, produces = {MediaType.APPLICATION_JSON_VALUE})
    public ResponseEntity<?> beforeCompletion(@PathVariable("gtrid") String gtrid) {
        //tasks to be done before the transaction completion
        return ResponseEntity.ok().build();
    }

    /**
     * This method is called by the transaction manager after the transaction is committed or rolled back.
     * Possible values of status: STATUS_COMMITTED , STATUS_ROLLEDBACK
     **/
    @RequestMapping(value = "/{gtrid}/aftercompletion/{status}", method = RequestMethod.POST, produces = {MediaType.APPLICATION_JSON_VALUE})
    public ResponseEntity<?> afterCompletion(@PathVariable("gtrid") String gtrid, @PathVariable("status") String status) {
        try {
            DebitRequest debitRequest = debitTransactionContext.get(gtrid);
            AccountBranchDetails sourceAccountDetails = branchService.getBranchDetailsByUserAccount(debitRequest.getAccountId());
            if (status.equals("STATUS_COMMITTED")) {
                historyService.logTransaction(TransactionHistoryEntry.builder().accountId(debitRequest.getAccountId()).branchId(sourceAccountDetails.getBranchId())
                        .transactionType(TransactionType.DEBIT)
                        .description(String.format("Amount debited for stock purchase from account %s.", debitRequest.getAccountId()))
                        .amount(debitRequest.getAmount())
                        .balance(bankTransactionService.balanceEnquiry(debitRequest.getAccountId()).getAccountBalance())
                        .build());
            } else if (status.equals("STATUS_ROLLEDBACK")) {
                historyService.logTransaction(TransactionHistoryEntry.builder().accountId(debitRequest.getAccountId()).branchId(sourceAccountDetails.getBranchId())
                        .transactionType(TransactionType.DEBIT_FAILED)
                        .description(String.format("Debiting amount for stock purchase failed on account %s.", debitRequest.getAccountId()))
                        .amount(debitRequest.getAmount())
                        .balance(bankTransactionService.balanceEnquiry(debitRequest.getAccountId()).getAccountBalance())
                        .build());
            }
            debitTransactionContext.remove(gtrid);
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            e.printStackTrace();
            log.error("Exception while logging the debit transaction history in transaction callback events. {}", e.getMessage());
            return ResponseEntity.internalServerError().body(ErrorResponse.builder().errorMessage(e.getMessage()).build());
        }
    }

}
