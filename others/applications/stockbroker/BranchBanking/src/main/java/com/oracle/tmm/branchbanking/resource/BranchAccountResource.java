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

import com.oracle.tmm.branchbanking.domain.AccountEntry;
import com.oracle.tmm.branchbanking.domain.response.AccountResponse;
import com.oracle.tmm.branchbanking.services.IAccountService;
import com.oracle.tmm.branchbanking.services.IBranchBankService;
import io.swagger.v3.oas.annotations.OpenAPIDefinition;
import io.swagger.v3.oas.annotations.info.Info;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.sql.SQLException;

@RestController
@RequestMapping("/account")
@OpenAPIDefinition(info = @Info(title = "Branch account operations endpoint", version = "1.0"))
@Slf4j
public class BranchAccountResource {

    @Autowired
    IAccountService accountService;

    @Autowired
    IBranchBankService branchService;

    @RequestMapping(value = "open", method = RequestMethod.POST)
    public ResponseEntity<?> openAccount(@RequestBody AccountEntry accountEntry) {
        try {
            if (accountService.openAccount(accountEntry)) {
                return ResponseEntity.ok()
                        .body(AccountResponse.builder()
                                .message(String.format("Successfully created new account %s in branch %s.", accountEntry.getAccountNumber(), accountEntry.getBranchId()))
                                .build());
            }
            return ResponseEntity.internalServerError()
                    .body(AccountResponse.builder()
                            .message(String.format("Account creation failed in branch %s.", accountEntry.getBranchId()))
                            .build());
        } catch (SQLException e) {
            log.error(e.getLocalizedMessage());
            return ResponseEntity.internalServerError()
                    .body(AccountResponse.builder()
                            .message("Account creation failed. " + e.getMessage())
                            .build());
        }
    }

    @RequestMapping(value = "close", method = RequestMethod.DELETE)
    public ResponseEntity<?> closeAccount(@RequestParam("accountId") Integer accountId) {
        try {
            branchService.withdraw(accountId, branchService.getBalance(accountId));
            if (accountService.closeAccount(accountId)) {
                return ResponseEntity.ok()
                        .body(AccountResponse.builder()
                                .message(String.format("Successfully closed account %s in branch.", accountId))
                                .build());
            }
            return ResponseEntity.internalServerError()
                    .body(AccountResponse.builder()
                            .message(String.format("Closing account %s failed.", accountId))
                            .build());
        } catch (SQLException e) {
            log.error(e.getLocalizedMessage());
            return ResponseEntity.internalServerError()
                    .body(AccountResponse.builder()
                            .message("Closing account %s failed. " + e.getMessage())
                            .build());
        }
    }

}
