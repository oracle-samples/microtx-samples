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
package com.example.mtm.sample.resource;

import com.example.mtm.sample.entity.Transfer;
import com.example.mtm.sample.exception.TransferFailedException;
import com.example.mtm.sample.service.BankingService;
import com.oracle.microtx.xa.rm.MicroTxUserTransaction;
import io.swagger.v3.oas.annotations.OpenAPIDefinition;
import io.swagger.v3.oas.annotations.info.Info;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.context.annotation.RequestScope;

import java.util.concurrent.CompletableFuture;
import java.util.concurrent.ExecutionException;

@RestController
@RequestMapping("/transfersWithSpringAsync")
@OpenAPIDefinition(info = @Info(title = "Amount Transfer endpoint", version = "1.0"))
@RequestScope
public class TransferResourceWithSpringAsync {

    @Autowired
    BankingService bankingService;

    private static final Logger LOG = LoggerFactory.getLogger(TransferResourceWithSpringAsync.class);

    @RequestMapping(value = "", method = RequestMethod.POST)
    @Transactional(propagation = Propagation.REQUIRED)
    public ResponseEntity<?> transfer(@RequestBody Transfer transferDetails) throws Exception {
        LOG.info("Transfer initiated: {}", transferDetails);

        CompletableFuture<ResponseEntity> withdrawCompletableFuture = bankingService.withdraw(transferDetails.getAmount(), transferDetails.getFrom());
        CompletableFuture<ResponseEntity> depositCompletableFuture = bankingService.deposit(transferDetails.getAmount(), transferDetails.getTo());

        // Join all threads so that we can wait until all are done
        CompletableFuture.allOf(withdrawCompletableFuture, depositCompletableFuture).join();

        ResponseEntity<String> withdrawResponse = withdrawCompletableFuture.get();
        if (!withdrawResponse.getStatusCode().is2xxSuccessful()) {
            LOG.error("Withdraw failed: {} Reason: {}", transferDetails, withdrawResponse.getBody());
            throw new TransferFailedException(String.format("Withdraw failed: %s Reason: %s", transferDetails, withdrawResponse.getBody()));
        }

        ResponseEntity<String> depositResponse = depositCompletableFuture.get();
        if (!depositResponse.getStatusCode().is2xxSuccessful()) {
            LOG.error("Deposit failed: {} Reason: {}", transferDetails, depositResponse.getBody());
            throw new TransferFailedException(String.format("Deposit failed: %s Reason: %s ", transferDetails, depositResponse.getBody()));
        }

        LOG.info("Transfer successful: {}", transferDetails);
        return ResponseEntity.ok("Transfer completed successfully");
    }
}