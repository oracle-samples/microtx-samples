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
package com.oracle.mtm.sample.resource;

import com.oracle.mtm.sample.data.IAccountService;
import com.oracle.mtm.sample.entity.Account;
import io.swagger.v3.oas.annotations.OpenAPIDefinition;
import io.swagger.v3.oas.annotations.info.Info;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.http.MediaType;

import java.sql.SQLException;

@RestController
@RequestMapping("/accounts")
@OpenAPIDefinition(info = @Info(title = "Accounts endpoint", version = "1.0"))
public class AccountsResource {
    private static final Logger LOG = LoggerFactory.getLogger(AccountsResource.class);

    @Autowired
    IAccountService accountService;

    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Account Details",
                    content = @Content(mediaType = MediaType.APPLICATION_JSON_VALUE, schema = @Schema(ref = "Account"))),
            @ApiResponse(responseCode = "404", description = "No account found for the provided account Identity"),
            @ApiResponse(responseCode = "500", description = "Internal Server Error")
    })
    @RequestMapping(value = "/{accountId}", method = RequestMethod.GET)
    public ResponseEntity<?> getAccountDetails(@PathVariable("accountId") String accountId) {
        try {
            Account account = this.accountService.accountDetails(accountId);
            if(account == null) {
                LOG.error("Account not found: " + accountId);
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body("{ \"message \" : \"No account found for the provided account Identity\"}");
            }
            return ResponseEntity.ok(account);
        } catch (SQLException e) {
            LOG.error(e.getLocalizedMessage());
            return ResponseEntity.internalServerError().body(e.getLocalizedMessage());
        }
    }


    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Amount withdrawn from the account"),
            @ApiResponse(responseCode = "422", description = "Amount must be greater than zero"),
            @ApiResponse(responseCode = "422", description = "Insufficient balance in the account"),
            @ApiResponse(responseCode = "500", description = "Internal Server Error")
    })
    @RequestMapping(value = "/{accountId}/withdraw", method = RequestMethod.POST)
    public ResponseEntity<?>  withdraw(@PathVariable("accountId") String accountId, @RequestParam("amount") double amount) {
        if(amount == 0){
            return ResponseEntity.status(HttpStatus.UNPROCESSABLE_ENTITY).body("Amount must be greater than zero");
        }
        try {
            if (this.accountService.getBalance(accountId) < amount) {
                return ResponseEntity.status(HttpStatus.UNPROCESSABLE_ENTITY).body("Insufficient balance in the account");
            }
            if(this.accountService.withdraw(accountId, amount)) {
                LOG.info(amount + " withdrawn from account: " + accountId);
                return ResponseEntity.ok("Amount withdrawn from the account");
            }
        } catch (SQLException | IllegalArgumentException e) {
            LOG.error(e.getLocalizedMessage());
            return ResponseEntity.internalServerError().body(e.getLocalizedMessage());
        }
        return ResponseEntity.internalServerError().body("Withdraw failed");
    }

    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Amount deposited to the account"),
            @ApiResponse(responseCode = "422", description = "Amount must be greater than zero"),
            @ApiResponse(responseCode = "500", description = "Internal Server Error")
    })
    @RequestMapping(value = "/{accountId}/deposit", method = RequestMethod.POST)
    public ResponseEntity<?>  deposit(@PathVariable("accountId") String accountId, @RequestParam("amount") double amount) {
        if(amount == 0){
            return ResponseEntity.status(HttpStatus.UNPROCESSABLE_ENTITY).body("Amount must be greater than zero");
        }
        try {
            if(this.accountService.deposit(accountId, amount)) {
                LOG.info(amount + " deposited to account: " + accountId);
                return ResponseEntity.ok("Amount deposited to the account");
            }
        } catch (SQLException e) {
            LOG.error(e.getLocalizedMessage());
            return ResponseEntity.internalServerError().body(e.getLocalizedMessage());
        }
        return ResponseEntity.internalServerError().body("Deposit failed");
    }
}