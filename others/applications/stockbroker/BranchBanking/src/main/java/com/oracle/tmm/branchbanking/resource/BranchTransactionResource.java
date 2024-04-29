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
package com.oracle.tmm.branchbanking.resource;

import com.oracle.tmm.branchbanking.domain.response.*;
import com.oracle.tmm.branchbanking.domain.transactions.Deposit;
import com.oracle.tmm.branchbanking.domain.transactions.Withdraw;
import com.oracle.tmm.branchbanking.services.IBranchBankService;
import io.swagger.v3.oas.annotations.OpenAPIDefinition;
import io.swagger.v3.oas.annotations.info.Info;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.sql.SQLException;

@RestController
@RequestMapping("transaction")
@OpenAPIDefinition(info = @Info(title = "Branch Transactions endpoint", version = "1.0"))
@Slf4j
public class BranchTransactionResource {

    @Autowired
    IBranchBankService branchService;

    @RequestMapping(value = "withdraw", method = RequestMethod.POST)
    public ResponseEntity<?> withdraw(@RequestBody Withdraw withdraw) {
        WithdrawResponse withdrawResponse = new WithdrawResponse();
        try {
            System.out.println("withdraw = "+withdraw);
            if (this.branchService.getBalance(withdraw.getAccountId()) < withdraw.getAmount()) {
                withdrawResponse.setMessage("Insufficient balance in the account");
                withdrawResponse.setHttpStatusCode(HttpStatus.PRECONDITION_FAILED.value());
                return ResponseEntity.internalServerError().body(withdrawResponse);
            }
            if (branchService.withdraw(withdraw.getAccountId(), withdraw.getAmount())) {
                log.info("Amount {} withdrawn from the account {}", withdraw.getAmount(), withdraw.getAccountId());
                withdrawResponse.setMessage(String.format("Amount %s withdrawn from the account %s", withdraw.getAmount(), withdraw.getAccountId()));
                return ResponseEntity.ok().body(withdrawResponse);
            }
        } catch (SQLException e) {
            String failMessage = "Withdraw failed with database exception. "+e.getMessage();
            log.error(failMessage);
            withdrawResponse.setMessage(failMessage);
            withdrawResponse.setHttpStatusCode(HttpStatus.INTERNAL_SERVER_ERROR.value());
            return ResponseEntity.internalServerError().body(withdrawResponse);
        } catch (IllegalArgumentException e){
            String failMessage = "Withdraw failed with database exception. "+e.getMessage();
            log.error(failMessage);
            withdrawResponse.setMessage(failMessage);
            withdrawResponse.setHttpStatusCode(HttpStatus.INTERNAL_SERVER_ERROR.value());
            return ResponseEntity.internalServerError().body(withdrawResponse);
        }
        withdrawResponse.setMessage(String.format("Amount withdraw from account %s failed.", withdraw.getAccountId()));
        return ResponseEntity.internalServerError().body(withdrawResponse);
    }

    @RequestMapping(value = "deposit", method = RequestMethod.POST)
    public ResponseEntity<?> deposit(@RequestBody Deposit deposit) {
        DepositResponse depositResponse = new DepositResponse();
        try {
            if (branchService.deposit(deposit.getAccountId(), deposit.getAmount())) {
                log.info("Amount {} deposited to the account {}",  deposit.getAmount(), deposit.getAccountId());
                depositResponse.setMessage(String.format("Amount %s deposited to the account %s", deposit.getAmount(), deposit.getAccountId()));
                return ResponseEntity
                        .ok().body(depositResponse);
            }
        } catch (SQLException e) {
            log.error(e.getLocalizedMessage());
            depositResponse.setMessage(e.getMessage());
            return ResponseEntity
                    .internalServerError().body(depositResponse);
        }
        depositResponse.setMessage(String.format("Amount deposit to account %s failed.", deposit.getAccountId()));
        return ResponseEntity
                .internalServerError().body(depositResponse);
    }

    @RequestMapping(value = "balanceEnquiry", method = RequestMethod.GET)
    public ResponseEntity<?> getBalance(@RequestParam("accountId") Integer accountId) {
        try {
            return ResponseEntity
                    .ok().body(new AccountBalance(accountId, branchService.getBalance(accountId)));
        } catch (IllegalArgumentException e) {
            log.error("Account {} not found ", accountId);
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(ErrorResponse.builder().errorMessage("Account not found.").build());
        } catch (SQLException e) {
            e.printStackTrace();
            log.error("Exception {}",e.getLocalizedMessage());
            return ResponseEntity.internalServerError()
                    .body(AccountResponse.builder().message("Account query failed. " + e.getMessage()).build());
        }
    }

}
