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
import io.swagger.v3.oas.annotations.OpenAPIDefinition;
import io.swagger.v3.oas.annotations.info.Info;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.scheduling.concurrent.ThreadPoolTaskExecutor;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.context.annotation.RequestScope;
import org.springframework.web.util.UriComponentsBuilder;

import java.net.URI;
import java.util.concurrent.Callable;
import java.util.concurrent.ExecutionException;
import java.util.concurrent.FutureTask;

@Component
@RestController
@RequestMapping("/transfersWithFutureTaskAsync")
@OpenAPIDefinition(info = @Info(title = "Amount Transfer endpoint", version = "1.0"))
@RequestScope
public class TransferResourceWithFutureTaskAsync {

    @Autowired
    @Qualifier("MicroTxXaRestTemplate")
    RestTemplate restTemplate;

    @Value("${departmentOneEndpoint}")
    String departmentOneEndpoint;

    @Value("${departmentTwoEndpoint}")
    String departmentTwoEndpoint;

    @Autowired
    @Qualifier("microTxThreadPoolTaskExecutor")
    ThreadPoolTaskExecutor threadPoolTaskExecutor;

    private static final Logger LOG = LoggerFactory.getLogger(TransferResourceWithFutureTaskAsync.class);

    @RequestMapping(value = "", method = RequestMethod.POST)
    @Transactional(propagation = Propagation.REQUIRED)
    public ResponseEntity<?> transfer(@RequestBody Transfer transferDetails) {
        try {
            LOG.info("Transfer initiated: {}", transferDetails);

            FutureTask<ResponseEntity<String>> withdrawFutureTask = getWithdrawFutureTask(transferDetails.getAmount(), transferDetails.getFrom());
            FutureTask<ResponseEntity<String>> depositFutureTask = getDepositFutureTask(transferDetails.getAmount(), transferDetails.getTo());
            threadPoolTaskExecutor.submit(withdrawFutureTask);
            threadPoolTaskExecutor.submit(depositFutureTask);

            ResponseEntity<String> withdrawResponse = withdrawFutureTask.get();
            if (withdrawResponse != null && !withdrawResponse.getStatusCode().is2xxSuccessful()) {
                LOG.error("Withdraw failed: {} Reason: {}", transferDetails, withdrawResponse.getBody());
                throw new TransferFailedException(String.format("Withdraw failed: %s Reason: %s", transferDetails, withdrawResponse.getBody()));
            }

            ResponseEntity<String> depositResponse = depositFutureTask.get();
            if (!depositResponse.getStatusCode().is2xxSuccessful()) {
                LOG.error("Deposit failed: {} Reason: {}", transferDetails, depositResponse.getBody());
                throw new TransferFailedException(String.format("Deposit failed: %s Reason: %s ", transferDetails, depositResponse.getBody()));
            }

            LOG.info("Transfer successful: {}", transferDetails);
            return ResponseEntity.ok("Transfer completed successfully");
        } catch (InterruptedException | ExecutionException | TransferFailedException e) {
            // @Transactional rollbacks only on RuntimeException (TransferFailedException)
            throw new TransferFailedException("Transfer Failed");
        }
    }

    /**
     * Send an HTTP request to the service to withdraw amount from the provided account identity
     * @param amount The amount to be withdrawn
     * @param accountId The account Identity
     * @return FutureTask HTTP Response from the service
     */
    private FutureTask<ResponseEntity<String>> getWithdrawFutureTask(double amount, String accountId) {
        Callable<ResponseEntity<String>> task = () -> {
            ResponseEntity<String> responseEntity = null;
            try {
                URI departmentUri = UriComponentsBuilder.fromUri(URI.create(departmentOneEndpoint))
                        .path("/accounts")
                        .path("/" + accountId)
                        .path("/withdraw")
                        .queryParam("amount", amount)
                        .build()
                        .toUri();

                responseEntity = restTemplate.postForEntity(departmentUri, null, String.class);
                LOG.info("Withdraw Response: {}", responseEntity.getBody());
            } catch (Exception e) {
                LOG.error("Withdraw failed: {}", e.getMessage());
                throw new TransferFailedException("Withdraw failed: " + e.getMessage());
            }
            return responseEntity;
        };
        return new FutureTask<>(task);
    }

    /**
     * Send an HTTP request to the service to deposit amount into the provided account identity
     * @param amount The amount to be deposited
     * @param accountId The account Identity
     * @return FutureTask HTTP Response from the service
     */
    private FutureTask<ResponseEntity<String>> getDepositFutureTask(double amount, String accountId) {
        Callable<ResponseEntity<String>> task = () -> {
            ResponseEntity<String> responseEntity = null;
            try {
                URI departmentUri = UriComponentsBuilder.fromUri(URI.create(departmentTwoEndpoint))
                        .path("/accounts")
                        .path("/" + accountId)
                        .path("/deposit")
                        .queryParam("amount", amount)
                        .build()
                        .toUri();

                responseEntity = restTemplate.postForEntity(departmentUri, null, String.class);
                LOG.info("Deposit Response: {}", responseEntity.getBody());
            } catch (Exception e) {
                LOG.error("Deposit failed: {}", e.getMessage());
                throw new TransferFailedException("Deposit failed: " + e.getMessage(), e);
            }
            return responseEntity;
        };
        return new FutureTask<>(task);
    }
}