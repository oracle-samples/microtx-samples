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
package com.oracle.tmm.corebanking.services.impl;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.oracle.microtx.xa.rm.MicroTxUserTransactionService;
import com.oracle.tmm.corebanking.domain.AccountBranchDetails;
import com.oracle.tmm.corebanking.domain.response.BalanceResponse;
import com.oracle.tmm.corebanking.domain.response.DepositResponse;
import com.oracle.tmm.corebanking.domain.response.TransferResponse;
import com.oracle.tmm.corebanking.domain.response.WithdrawResponse;
import com.oracle.tmm.corebanking.domain.transactions.TransferRequest;
import com.oracle.tmm.corebanking.services.IBankTransactionService;
import com.oracle.tmm.corebanking.services.IBranchService;
import com.oracle.tmm.corebanking.utils.BranchTransactionUtility;
import com.oracle.tmm.corebanking.utils.TransactionEventsUtility;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;

import jakarta.transaction.*;
import java.net.URISyntaxException;
import java.sql.SQLException;
import java.util.Objects;

@Slf4j
@Component
public class BankTransactionServiceImpl implements IBankTransactionService {

    @Autowired
    IBranchService branchService;

    @Autowired
    BranchTransactionUtility branchTransactionUtility;

    @Autowired
    TransactionEventsUtility transactionEventsUtility;

    @Autowired
    MicroTxUserTransactionService microTxUserTransaction;

    /**
     * Bank Transfer Transaction using MicroTx
     */
    @Override
    public TransferResponse transfer(TransferRequest transferRequest) {
        log.info("Transfer initiated:" + transferRequest.toString());
        WithdrawResponse withdrawResponse = null;
        DepositResponse depositResponse = null;
        TransferResponse transferResponse = new TransferResponse();
        try {
            microTxUserTransaction.begin();
            transactionEventsUtility.registerTransferTransactionEvents(microTxUserTransaction.getTransactionID(), transferRequest);
            transferResponse.setTransactionId(microTxUserTransaction.getTransactionID());
            AccountBranchDetails sourceAccountDetails = branchService.getBranchDetailsByUserAccount(transferRequest.getFromAccountId());
            withdrawResponse = branchTransactionUtility.withdraw(sourceAccountDetails.getServiceEndpoint(), transferRequest.getFromAccountId(), transferRequest.getAmount());
            if (withdrawResponse.getHttpStatusCode() != HttpStatus.OK.value()) {
                log.error("Withdraw failed. Reason: {}", withdrawResponse.getMessage());
                microTxUserTransaction.rollback();
                transferResponse.setMessage(String.format("Transfer Failed as Withdraw operation failed from account %s, due to %s", transferRequest.getFromAccountId(), withdrawResponse.getMessage()));
                transferResponse.setHttpStatusCode(HttpStatus.INTERNAL_SERVER_ERROR.value());
                return transferResponse;
            }
            AccountBranchDetails destAccountDetails = branchService.getBranchDetailsByUserAccount(transferRequest.getToAccountId());
            if (Objects.isNull(destAccountDetails)) {
                log.error("Destination account {} does not exist.", transferRequest.getToAccountId());
                microTxUserTransaction.rollback();
                transferResponse.setMessage(String.format("Destination account %s does not exist. ", transferRequest.getToAccountId()));
                transferResponse.setHttpStatusCode(HttpStatus.INTERNAL_SERVER_ERROR.value());
                return transferResponse;
            }
            depositResponse = branchTransactionUtility.deposit(destAccountDetails.getServiceEndpoint(), transferRequest.getToAccountId(), transferRequest.getAmount());
            if (depositResponse.getHttpStatusCode() != HttpStatus.OK.value()) {
                log.error("Deposit failed. Reason: {}", depositResponse.getMessage());
                microTxUserTransaction.rollback();
                transferResponse.setMessage(String.format("Transfer Failed as Deposit operation failed on account %s.", transferRequest.getToAccountId()));
                transferResponse.setHttpStatusCode(HttpStatus.INTERNAL_SERVER_ERROR.value());
                return transferResponse;
            }

            microTxUserTransaction.commit();
            transferResponse.setMessage("Transfer completed successfully");
            transferResponse.setHttpStatusCode(HttpStatus.OK.value());
            log.info("Transfer successful:" + transferRequest);
            return transferResponse;
        } catch (SystemException | URISyntaxException | SQLException | JsonProcessingException e) {
            log.error(e.getLocalizedMessage());
            transferResponse.setMessage("Transfer Failed. " + e.getLocalizedMessage());
            transferResponse.setHttpStatusCode(HttpStatus.INTERNAL_SERVER_ERROR.value());
            return transferResponse;
        } catch (RollbackException | HeuristicMixedException | HeuristicRollbackException | NotSupportedException e) {
            transferResponse.setMessage("Transfer Failed. " + e.getLocalizedMessage());
            transferResponse.setHttpStatusCode(HttpStatus.INTERNAL_SERVER_ERROR.value());
            return transferResponse;
        }
    }

    @Override
    public BalanceResponse balanceEnquiry(Integer accountId) {
        BalanceResponse balanceResponse = new BalanceResponse();
        try {
            AccountBranchDetails userBranchDetails = branchService.getBranchDetailsByUserAccount(accountId);
            if (Objects.isNull(userBranchDetails)) {
                balanceResponse = null;
            }
            balanceResponse = branchTransactionUtility.getBalance(userBranchDetails.getServiceEndpoint(), accountId);
        } catch (URISyntaxException | SQLException e) {
            balanceResponse.setHttpStatusCode(HttpStatus.INTERNAL_SERVER_ERROR.value());
            balanceResponse.setMessage("Balance Enquiry operation failed." + e.getLocalizedMessage());
            return balanceResponse;
        }
        return balanceResponse;
    }
}
