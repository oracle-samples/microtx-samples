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
package com.oracle.example.teller.resource;

import com.oracle.example.teller.entity.Transfer;
import com.oracle.example.teller.entity.TransferResponse;
import com.oracle.example.teller.exceptions.TransferFailedException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
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
import java.net.URISyntaxException;

@SuppressWarnings("JavadocDeclaration")
@RestController
@RequestMapping("/transfers")
@RequestScope
public class TransferResource {

    private static final Logger LOG = LoggerFactory.getLogger(TransferResource.class);

    @Autowired
    @Qualifier("MicroTxXaRestTemplate")
    RestTemplate restTemplate;

    @Value("${departmentOneEndpoint}")
    String departmentOneEndpoint;

    @Value("${departmentTwoEndpoint}")
    String departmentTwoEndpoint;

    /**
     * Transfer method annotated with @Transactional
     * If there are any exceptions, transaction rolls-back else commits the distributed transaction
     *
     * @param transferDetails
     * @return ResponseEntity with HTTP Response 200 on successful transfer. If there is any exception REST call returns 500.
     * @throws Exception
     */
    @RequestMapping(value = "transfer", method = RequestMethod.POST)
    @Transactional(propagation = Propagation.REQUIRED)
    public ResponseEntity<?> transfer(@RequestBody Transfer transferDetails) throws Exception {
        ResponseEntity<String> withdrawResponse = null;
        ResponseEntity<String> depositResponse = null;

        LOG.info("Transfer initiated: {}", transferDetails);

        withdrawResponse = withdraw(transferDetails.getFrom(), transferDetails.getAmount());
        if (!withdrawResponse.getStatusCode().is2xxSuccessful()) {
            LOG.error("Withdraw failed: {} Reason: {}", transferDetails, withdrawResponse.getBody());
            throw new TransferFailedException(String.format("Withdraw failed: %s Reason: %s", transferDetails, withdrawResponse.getBody()));
        }

        depositResponse = deposit(transferDetails.getTo(), transferDetails.getAmount());
        if (!depositResponse.getStatusCode().is2xxSuccessful()) {
            LOG.error("Deposit failed: {} Reason: {} ", transferDetails, depositResponse.getBody());
            throw new TransferFailedException(String.format("Deposit failed: %s Reason: %s ", transferDetails, depositResponse.getBody()));
        }

        LOG.info("Transfer successful: {}", transferDetails);
        return ResponseEntity
                .ok(new TransferResponse("Transfer completed successfully"));
    }


    /**
     * Send an HTTP request to the service to withdraw amount from the provided account identity
     *
     * @param accountId The account Identity
     * @param amount    The amount to be withdrawn
     * @return HTTP Response from the service
     */
    private ResponseEntity<String> withdraw(String accountId, double amount) throws URISyntaxException {
        URI departmentUri = UriComponentsBuilder.fromUri(URI.create(departmentOneEndpoint))
                .path("/accounts")
                .path("/" + accountId)
                .path("/withdraw")
                .queryParam("amount", amount)
                .build()
                .toUri();

        ResponseEntity<String> responseEntity = restTemplate.postForEntity(departmentUri, null, String.class);
        LOG.info("Withdraw Response: \n" + responseEntity.getBody());
        return responseEntity;
    }

    /**
     * Send an HTTP request to the service to deposit amount into the provided account identity
     *
     * @param accountId The account Identity
     * @param amount    The amount to be deposited
     * @return HTTP Response from the service
     */
    private ResponseEntity<String> deposit(String accountId, double amount) throws URISyntaxException {
        URI departmentUri = UriComponentsBuilder.fromUri(URI.create(departmentTwoEndpoint))
                .path("/accounts")
                .path("/" + accountId)
                .path("/deposit")
                .queryParam("amount", amount)
                .build()
                .toUri();

        ResponseEntity<String> responseEntity = restTemplate.postForEntity(departmentUri, null, String.class);
        LOG.info("Deposit Response: \n" + responseEntity.getBody());
        return responseEntity;
    }

}
