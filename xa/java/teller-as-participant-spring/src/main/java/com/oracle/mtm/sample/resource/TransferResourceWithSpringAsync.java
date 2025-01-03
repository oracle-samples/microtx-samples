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

import com.oracle.mtm.sample.entity.Fee;
import com.oracle.mtm.sample.entity.Transfer;
import com.oracle.mtm.sample.exception.TransferFailedException;
import com.oracle.mtm.sample.service.BankingService;
import com.oracle.mtm.sample.service.TransferFeeService;
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
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.TransactionException;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.context.annotation.RequestScope;

import java.net.URISyntaxException;
import java.sql.SQLException;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.ExecutionException;

@RestController
@RequestMapping("/transfersWithSpringAsync")
@OpenAPIDefinition(info = @Info(title = "Amount Transfer endpoint", version = "1.0"))
@RequestScope
public class TransferResourceWithSpringAsync {

    @Autowired
    BankingService bankingService;

    @Autowired
    TransferFeeService transferFeeService;

    private static final Logger LOG = LoggerFactory.getLogger(TransferResourceWithSpringAsync.class);

    @RequestMapping(value = "", method = RequestMethod.POST)
    @Transactional(propagation = Propagation.REQUIRED)
    public ResponseEntity<?> transfer(@RequestBody Transfer transferDetails) throws ExecutionException, InterruptedException {
        // Use-case: The transfer service charges 10% as Fee
        transferDetails.setTransferFee(0.1 * transferDetails.getAmount());
        transferDetails.setTotalCharged(transferDetails.getAmount() + transferDetails.getTransferFee());
        LOG.info("Transfer initiated: {}", transferDetails);

        CompletableFuture<ResponseEntity> withdrawCompletableFuture = bankingService.withdraw(transferDetails.getAmount(), transferDetails.getFrom());
        CompletableFuture<ResponseEntity> depositCompletableFuture = bankingService.deposit(transferDetails.getAmount(), transferDetails.getTo());
        CompletableFuture<Boolean> depositFeeFuture = bankingService.depositFee(transferDetails.getFrom(), transferDetails.getTransferFee());

        // Join all threads so that we can wait until all are done
        CompletableFuture.allOf(withdrawCompletableFuture, depositCompletableFuture, depositFeeFuture).join();

        ResponseEntity<String> withdrawResponse = withdrawCompletableFuture.get();
        if (!withdrawResponse.getStatusCode().is2xxSuccessful()) {
            LOG.error("Withdraw failed: {} Reason: {}", transferDetails, withdrawResponse.getBody());
            throw new TransferFailedException("Withdraw failed " + withdrawResponse.getBody());
        }

        ResponseEntity<String> depositResponse = depositCompletableFuture.get();
        if (!depositResponse.getStatusCode().is2xxSuccessful()) {
            LOG.error("Deposit failed: {} Reason: {}", transferDetails, depositResponse.getBody());
            throw new TransferFailedException("Deposit failed " + depositResponse.getBody());
        }

        boolean feeDeposited = depositFeeFuture.get();
        if (feeDeposited) {
            LOG.info("Fee deposited successful {}", transferDetails);
        } else {
            LOG.error("Fee deposited failed {}", transferDetails);
            throw new TransferFailedException("Fee deposited failed");
        }

        LOG.info("Transfer successful: {}", transferDetails);
        return ResponseEntity.ok("Transfer completed successfully");
    }

    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Account Details",
                    content = @Content(mediaType = MediaType.APPLICATION_JSON_VALUE, schema = @Schema(ref = "Account"))),
            @ApiResponse(responseCode = "404", description = "No account found for the provided account Identity"),
            @ApiResponse(responseCode = "500", description = "Internal Server Error")
    })
    @RequestMapping(value = "/{accountId}", method = RequestMethod.GET)
    public ResponseEntity<?> getFeeDetails(@PathVariable("accountId") String accountId) {
        try {
            Fee fee = transferFeeService.feeDetails(accountId);
            if (fee == null) {
                LOG.error("Account not found: {}", accountId);
                ResponseEntity.status(HttpStatus.NOT_FOUND).body("No account found for the provided fee Identity");
            }
            return ResponseEntity.ok(fee);
        } catch (SQLException e) {
            LOG.error(e.getLocalizedMessage());
            return ResponseEntity.internalServerError().body(e.getLocalizedMessage());
        }
    }
}