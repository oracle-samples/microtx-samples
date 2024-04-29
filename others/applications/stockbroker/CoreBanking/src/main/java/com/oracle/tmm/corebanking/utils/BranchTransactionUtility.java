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
package com.oracle.tmm.corebanking.utils;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.oracle.tmm.corebanking.domain.AccountEntry;
import com.oracle.tmm.corebanking.domain.BranchAccountEntry;
import com.oracle.tmm.corebanking.domain.response.*;
import com.oracle.tmm.corebanking.domain.transactions.DepositRequest;
import com.oracle.tmm.corebanking.domain.transactions.WithdrawRequest;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Component;
import org.springframework.web.client.HttpStatusCodeException;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.util.UriComponentsBuilder;

import java.net.URI;
import java.net.URISyntaxException;


@Slf4j
@Component
public class BranchTransactionUtility {

    @Value("${stockBrokerEndpoint}")
    String stockBrokerEndpoint;

    @Autowired
    @Qualifier("MicroTxXaRestTemplate")
    RestTemplate restTemplate;

    private ObjectMapper objectMapper = new ObjectMapper();

    public WithdrawResponse withdraw(String serviceEndpoint, Integer accountId, Double amount) throws URISyntaxException, JsonProcessingException {

        WithdrawResponse withdrawResponse = new WithdrawResponse();
        URI branchUri = UriComponentsBuilder.fromUri(URI.create(serviceEndpoint))
                .path("/transaction")
                .path("/withdraw")
                .build()
                .toUri();

        try {
            ResponseEntity<WithdrawResponse> responseEntity = restTemplate.postForEntity(branchUri, WithdrawRequest.builder().accountId(accountId).amount(amount).build(), WithdrawResponse.class);
            log.info("Withdraw Response: {} : {}", responseEntity.getStatusCode(), responseEntity.getBody());
            withdrawResponse = responseEntity.getBody();
            withdrawResponse.setHttpStatusCode(responseEntity.getStatusCode().value());
        } catch (HttpStatusCodeException e) {
            withdrawResponse = objectMapper.readValue(e.getResponseBodyAsString(), WithdrawResponse.class);
        }
        return withdrawResponse;
    }

    public DepositResponse deposit(String serviceEndpoint, Integer accountId, Double amount) throws URISyntaxException, JsonProcessingException {

        DepositResponse depositResponse = new DepositResponse();
        URI branchUri = UriComponentsBuilder.fromUri(URI.create(serviceEndpoint))
                .path("/transaction")
                .path("/deposit")
                .build()
                .toUri();
        try {
            ResponseEntity<DepositResponse> responseEntity = restTemplate.postForEntity(branchUri, DepositRequest.builder().accountId(accountId).amount(amount).build(), DepositResponse.class);
            log.info("Deposit Response: {} : {}", responseEntity.getStatusCode(), responseEntity.getBody());
            depositResponse = responseEntity.getBody();
            depositResponse.setHttpStatusCode(responseEntity.getStatusCode().value());
        } catch (HttpStatusCodeException e) {
            depositResponse = objectMapper.readValue(e.getResponseBodyAsString(), DepositResponse.class);
        }
        return depositResponse;
    }

    public BalanceResponse getBalance(String serviceEndpoint, Integer accountId) throws URISyntaxException {

        BalanceResponse accountBalance = null;
        URI balanceEnquiryUri = UriComponentsBuilder.fromUri(URI.create(serviceEndpoint))
                .path("/transaction")
                .path("/balanceEnquiry")
                .queryParam("accountId", String.valueOf(accountId))
                .build()
                .toUri();

        ResponseEntity<BalanceResponse> responseEntity = restTemplate.getForEntity(balanceEnquiryUri, BalanceResponse.class);
        log.info("GetBalance Response: {} : {}", responseEntity.getStatusCode(), responseEntity.getBody());
        accountBalance = responseEntity.getBody();
        accountBalance.setHttpStatusCode(responseEntity.getStatusCode().value());
        return accountBalance;
    }

    public CreateSavingsAccountResponse createBranchAccount(String serviceEndpoint, BranchAccountEntry branchAccountEntry) throws URISyntaxException, JsonProcessingException {

        CreateSavingsAccountResponse createSavingsAccountResponse = new CreateSavingsAccountResponse();
        URI branchUri = UriComponentsBuilder.fromUri(URI.create(serviceEndpoint))
                .path("/account")
                .path("/open")
                .build()
                .toUri();

        try {
            ResponseEntity<CreateSavingsAccountResponse> responseEntity = restTemplate.postForEntity(branchUri, branchAccountEntry, CreateSavingsAccountResponse.class);
            log.info("CreateSavingsAccount Response : {} : {}", responseEntity.getStatusCode(), responseEntity.getBody());
            createSavingsAccountResponse = responseEntity.getBody();
            createSavingsAccountResponse.setHttpStatusCode(responseEntity.getStatusCode().value());
        } catch (HttpStatusCodeException e) {
            createSavingsAccountResponse = objectMapper.readValue(e.getResponseBodyAsString(), CreateSavingsAccountResponse.class);
        }
        return createSavingsAccountResponse;
    }

    public CloseSavingsAccountResponse closeBranchAccount(String serviceEndpoint, Integer accountId) throws URISyntaxException, JsonProcessingException {
        CloseSavingsAccountResponse closeSavingsAccountResponse = new CloseSavingsAccountResponse();
        URI branchUri = UriComponentsBuilder.fromUri(URI.create(serviceEndpoint))
                .path("/account")
                .path("/close")
                .queryParam("accountId", accountId)
                .build()
                .toUri();
        try {
            ResponseEntity<CloseSavingsAccountResponse> responseEntity = restTemplate.exchange(branchUri, HttpMethod.DELETE, null, CloseSavingsAccountResponse.class);
            log.info("CloseSavingsAccount Response : {} : {}", responseEntity.getStatusCode(), responseEntity.getBody());
            closeSavingsAccountResponse = responseEntity.getBody();
            closeSavingsAccountResponse.setHttpStatusCode(responseEntity.getStatusCode().value());
        } catch (HttpStatusCodeException e) {
            closeSavingsAccountResponse = objectMapper.readValue(e.getResponseBodyAsString(), CloseSavingsAccountResponse.class);
        }
        return closeSavingsAccountResponse;
    }

    public CreateStockBrokerAccountResponse createStockBrokerAccount(AccountEntry accountEntry) throws URISyntaxException, JsonProcessingException {
        CreateStockBrokerAccountResponse createStockBrokerAccountResponse = new CreateStockBrokerAccountResponse();
        URI branchUri = UriComponentsBuilder.fromUri(URI.create(stockBrokerEndpoint))
                .path("/account")
                .path("/open")
                .build()
                .toUri();

        try {
            ResponseEntity<CreateStockBrokerAccountResponse> responseEntity = restTemplate.postForEntity(branchUri, accountEntry, CreateStockBrokerAccountResponse.class);
            log.info("CloseSavingsAccount Response : {} : {}", responseEntity.getStatusCode(), responseEntity.getBody());
            createStockBrokerAccountResponse = responseEntity.getBody();
            createStockBrokerAccountResponse.setHttpStatusCode(responseEntity.getStatusCode().value());
        } catch (HttpStatusCodeException e) {
            createStockBrokerAccountResponse = objectMapper.readValue(e.getResponseBodyAsString(), CreateStockBrokerAccountResponse.class);
        }
        return createStockBrokerAccountResponse;
    }

    public CloseStockBrokerAccountResponse closeStockBrokerAccount(Integer accountId) throws URISyntaxException, JsonProcessingException {
        CloseStockBrokerAccountResponse closeStockBrokerAccountResponse = new CloseStockBrokerAccountResponse();
        URI branchUri = UriComponentsBuilder.fromUri(URI.create(stockBrokerEndpoint))
                .path("/account")
                .path("/close")
                .queryParam("accountId", accountId)
                .build()
                .toUri();
        try {
            ResponseEntity<CloseStockBrokerAccountResponse> responseEntity = restTemplate.exchange(branchUri, HttpMethod.DELETE, null, CloseStockBrokerAccountResponse.class);
            log.info("CloseSavingsAccount Response : {} : {}", responseEntity.getStatusCode(), responseEntity.getBody());
            closeStockBrokerAccountResponse = responseEntity.getBody();
            closeStockBrokerAccountResponse.setHttpStatusCode(responseEntity.getStatusCode().value());
        } catch (HttpStatusCodeException e) {
            closeStockBrokerAccountResponse = objectMapper.readValue(e.getResponseBodyAsString(), CloseStockBrokerAccountResponse.class);
        }
        return closeStockBrokerAccountResponse;
    }
}