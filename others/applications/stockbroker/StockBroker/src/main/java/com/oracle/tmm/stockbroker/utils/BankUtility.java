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
package com.oracle.tmm.stockbroker.utils;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.oracle.tmm.stockbroker.domain.response.CreditResponse;
import com.oracle.tmm.stockbroker.domain.response.DebitResponse;
import com.oracle.tmm.stockbroker.domain.response.ErrorResponse;
import com.oracle.tmm.stockbroker.domain.transaction.CreditRequest;
import com.oracle.tmm.stockbroker.domain.transaction.DebitRequest;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Component;
import org.springframework.web.client.HttpStatusCodeException;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.util.UriComponentsBuilder;

import java.net.URI;
import java.net.URISyntaxException;

@Slf4j
@Component
public class BankUtility {

    @Autowired
    @Qualifier("MicroTxXaRestTemplate")
    RestTemplate restTemplate;

    private ObjectMapper objectMapper = new ObjectMapper();

    public CreditResponse credit(String serviceEndpoint, Integer accountId, Double amount) throws URISyntaxException, JsonProcessingException {
        CreditResponse creditResponse = new CreditResponse();
        URI branchUri = UriComponentsBuilder.fromUri(URI.create(serviceEndpoint))
                .path("/payment")
                .path("/credit")
                .build()
                .toUri();
        try {
            ResponseEntity<String> responseEntity = restTemplate.postForEntity(branchUri, new CreditRequest(accountId, amount), String.class);
            log.info("Credit Response: {} : {}", responseEntity.getStatusCode(), responseEntity.getBody());
            if (responseEntity.getStatusCode() == HttpStatus.INTERNAL_SERVER_ERROR) {
                ErrorResponse errorResponse = objectMapper.readValue(responseEntity.getBody(), ErrorResponse.class);
                creditResponse.setHttpStatusCode(responseEntity.getStatusCode().value());
                creditResponse.setMessage(errorResponse.getErrorMessage());
                return creditResponse;
            }
            creditResponse = objectMapper.readValue(responseEntity.getBody(), CreditResponse.class);
            creditResponse.setHttpStatusMessage(responseEntity.getStatusCode().toString());
            creditResponse.setHttpStatusCode(responseEntity.getStatusCode().value());
        } catch (HttpStatusCodeException e) {
            creditResponse = objectMapper.readValue(e.getResponseBodyAsString(), CreditResponse.class);
        }
        return creditResponse;
    }

    public DebitResponse debit(String serviceEndpoint, Integer accountId, Double amount) throws URISyntaxException, JsonProcessingException {
        DebitResponse debitResponse = new DebitResponse();
        URI branchUri = UriComponentsBuilder.fromUri(URI.create(serviceEndpoint))
                .path("/payment")
                .path("/debit")
                .build()
                .toUri();
        try {
            ResponseEntity<String> responseEntity = restTemplate.postForEntity(branchUri, new DebitRequest(accountId, amount), String.class);
            log.info("Debit Response: {} : {}", responseEntity.getStatusCode(), responseEntity.getBody());
            if (responseEntity.getStatusCode() == HttpStatus.INTERNAL_SERVER_ERROR) {
                ErrorResponse errorResponse = objectMapper.readValue(responseEntity.getBody(), ErrorResponse.class);
                debitResponse.setHttpStatusCode(responseEntity.getStatusCode().value());
                debitResponse.setMessage(errorResponse.getErrorMessage());
                return debitResponse;
            }
            debitResponse = objectMapper.readValue(responseEntity.getBody(), DebitResponse.class);
            debitResponse.setHttpStatusMessage(responseEntity.getStatusCode().toString());
            debitResponse.setHttpStatusCode(responseEntity.getStatusCode().value());
        } catch (HttpStatusCodeException e) {
            debitResponse = objectMapper.readValue(e.getResponseBodyAsString(), DebitResponse.class);
        }
        return debitResponse;
    }
}
