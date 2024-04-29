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
package com.oracle.tmm.corebanking.resource;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.oracle.microtx.xa.rm.MicroTxUserTransactionService;
import com.oracle.tmm.corebanking.domain.*;
import com.oracle.tmm.corebanking.domain.response.*;
import com.oracle.tmm.corebanking.services.IAccountService;
import com.oracle.tmm.corebanking.services.IBranchService;
import com.oracle.tmm.corebanking.utils.BranchTransactionUtility;
import io.swagger.v3.oas.annotations.OpenAPIDefinition;
import io.swagger.v3.oas.annotations.info.Info;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import jakarta.transaction.*;
import java.net.URISyntaxException;
import java.sql.SQLException;
import java.util.Objects;


@RestController
@RequestMapping("/account")
@OpenAPIDefinition(info = @Info(title = "Account Resource endpoint", version = "1.0"))
@Slf4j
public class AccountResource {

    @Autowired
    IAccountService accountService;
    @Autowired
    IBranchService branchService;

    @Autowired
    BranchTransactionUtility branchTransactionUtility;

    @Autowired
    MicroTxUserTransactionService microTxUserTransaction;

    /**
     * Create Bank Account Transaction using MicroTx
     */
    @RequestMapping(value = "open", method = RequestMethod.POST, produces = {MediaType.APPLICATION_JSON_VALUE})
    public ResponseEntity<?> openAccount(@RequestBody AccountEntry accountEntry, @RequestParam(value = "initialBalance", required = false) Double initialBalance) {
        initialBalance = Objects.nonNull(initialBalance) ? initialBalance : 0;
        Branch branchDetails = null;
        OpenBankAccountResponse openBankAccountResponse = new OpenBankAccountResponse();
        try {
            microTxUserTransaction.begin(true);
            openBankAccountResponse.setTransactionId(microTxUserTransaction.getTransactionID());
            branchDetails = branchService.branchDetails(accountEntry.getBranchId());
            accountEntry.setAccountNumber(branchDetails.getLastAccountNumber() + 1);
            if (!accountService.createAccount(accountEntry)) {
                microTxUserTransaction.rollback();
                log.error("Creating user account in bank failed.");
                openBankAccountResponse.setMessage("Opening new bank account failed as account creation failed in Core Bank.");
                return ResponseEntity.internalServerError()
                        .body(openBankAccountResponse);
            }
            CreateSavingsAccountResponse createSavingsAccountResponse = branchTransactionUtility.createBranchAccount(branchDetails.getServiceURL(), new BranchAccountEntry(accountEntry.getAccountNumber(), accountEntry.getBranchId(), initialBalance));
            if (createSavingsAccountResponse.getHttpStatusCode() != HttpStatus.OK.value()) {
                microTxUserTransaction.rollback();
                log.error("Creating savings account in branch failed. {}", createSavingsAccountResponse.getMessage());
                openBankAccountResponse.setMessage("Creating savings account in branch failed. " + createSavingsAccountResponse.getMessage());
                return ResponseEntity.internalServerError()
                        .body(openBankAccountResponse);
            }
            CreateStockBrokerAccountResponse createStockBrokerAccountResponse = branchTransactionUtility.createStockBrokerAccount(accountEntry);
            if (createStockBrokerAccountResponse.getHttpStatusCode() != HttpStatus.OK.value()) {
                microTxUserTransaction.rollback();
                log.error("Creating user account with StockBroker failed. {}", createStockBrokerAccountResponse.getMessage());
                openBankAccountResponse.setMessage("Creating user account with StockBroker failed.");
                return ResponseEntity.internalServerError()
                        .body(openBankAccountResponse);
            }
            branchService.updateBranchLastAccountNumber(accountEntry.getBranchId(), accountEntry.getAccountNumber());
            microTxUserTransaction.commit();
        } catch (RollbackException | HeuristicMixedException | HeuristicRollbackException | NotSupportedException e) {
            openBankAccountResponse.setMessage("Opening new bank account failed with exception." + e.getLocalizedMessage());
            return ResponseEntity.internalServerError()
                    .body(openBankAccountResponse);
        } catch (SystemException | SQLException | URISyntaxException | JsonProcessingException e) {
            openBankAccountResponse.setMessage("Opening new bank account failed with exception." + e.getLocalizedMessage());
            return ResponseEntity.internalServerError()
                    .body(openBankAccountResponse);
        }
        openBankAccountResponse.setMessage(String.format("Successfully created savings account %s in %s (%s) branch. And associated account with StockBroker.",
                accountEntry.getAccountNumber(), branchDetails.getBranchName(), accountEntry.getBranchId()));
        return ResponseEntity.ok()
                .body(openBankAccountResponse);
    }

    /**
     * Close Bank Account Transaction using MicroTx
     */
    @RequestMapping(value = "close", method = RequestMethod.POST, produces = {MediaType.APPLICATION_JSON_VALUE})
    public ResponseEntity<?> closeAccount(@RequestParam("accountId") Integer accountId) {
        CloseBankAccountResponse closeBankAccountResponse = new CloseBankAccountResponse();
        try {
            microTxUserTransaction.begin(true);
            closeBankAccountResponse.setTransactionId(microTxUserTransaction.getTransactionID());
            AccountBranchDetails accountBranchDetails = branchService.getBranchDetailsByUserAccount(accountId);
            if (Objects.isNull(accountBranchDetails)) {
                microTxUserTransaction.rollback();
                String failMessage = String.format("AccountId %s does not exist in any bank branch. ", accountId);
                closeBankAccountResponse.setMessage(failMessage);
                log.error(failMessage);
                return ResponseEntity.internalServerError()
                        .body(closeBankAccountResponse);
            }
            CloseSavingsAccountResponse closeSavingsAccountResponse = branchTransactionUtility.closeBranchAccount(accountBranchDetails.getServiceEndpoint(), accountId);
            if (closeSavingsAccountResponse.getHttpStatusCode() != HttpStatus.OK.value()) {
                microTxUserTransaction.rollback();
                String failMessage = "Closing savings account in branch failed. " + closeSavingsAccountResponse.getMessage();
                closeBankAccountResponse.setMessage(failMessage);
                log.error(failMessage);
                return ResponseEntity.internalServerError()
                        .body(closeBankAccountResponse);
            }
            CloseStockBrokerAccountResponse closeStockBrokerAccountResponse = branchTransactionUtility.closeStockBrokerAccount(accountId);
            if (closeStockBrokerAccountResponse.getHttpStatusCode() != HttpStatus.OK.value()) {
                microTxUserTransaction.rollback();
                String failMessage = "Creating user account with StockBroker failed. " + closeStockBrokerAccountResponse.getMessage();
                closeBankAccountResponse.setMessage(failMessage);
                log.error(failMessage);

                return ResponseEntity.internalServerError()
                        .body(closeBankAccountResponse);
            }
            if (!accountService.deleteAccount(accountId)) {
                microTxUserTransaction.rollback();
                String failMessage = "Closing user account failed in Core Bank.";
                closeBankAccountResponse.setMessage(failMessage);
                log.error(failMessage);

                return ResponseEntity.internalServerError()
                        .body(closeBankAccountResponse);
            }
            microTxUserTransaction.commit();
        } catch (RollbackException | HeuristicMixedException | HeuristicRollbackException | NotSupportedException e) {
            closeBankAccountResponse.setMessage("Closing new bank account failed with exception." + e.getLocalizedMessage());
            return ResponseEntity.internalServerError()
                    .body(closeBankAccountResponse);
        } catch (SystemException | SQLException | URISyntaxException | JsonProcessingException e) {
            closeBankAccountResponse.setMessage("Closing new bank account failed with exception." + e.getLocalizedMessage());
            return ResponseEntity.internalServerError()
                    .body(closeBankAccountResponse);
        }
        closeBankAccountResponse.setMessage(String.format("Successfully closed bank account %s.", accountId));
        return ResponseEntity.ok()
                .body(closeBankAccountResponse);
    }

    @RequestMapping(value = "details", method = RequestMethod.GET, produces = {MediaType.APPLICATION_JSON_VALUE})
    public ResponseEntity<?> accountDetails(@RequestParam(value = "accountId", required = false) Integer accountId) {
        try {
            if (Objects.isNull(accountId)) {
                Accounts accounts = accountService.accountDetails();
                return ResponseEntity.ok()
                        .body(accounts);
            }
            AccountEntry accountEntry = accountService.accountDetails(accountId);
            if (Objects.isNull(accountEntry)) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(ErrorResponse.builder().errorMessage("Account not found.").build());
            }
            return ResponseEntity.ok()
                    .body(accountEntry);
        } catch (SQLException e) {
            return ResponseEntity.internalServerError()
                    .body(ErrorResponse.builder().errorMessage("Retrieving account details failed.").build());
        }
    }

}
