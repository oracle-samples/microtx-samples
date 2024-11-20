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
 
package com.oracle.teller.resource;

import com.oracle.teller.entity.Transfer;
import com.oracle.teller.exception.TransferFailedException;
import com.oracle.teller.service.TransferFeeService;
import io.swagger.v3.oas.annotations.OpenAPIDefinition;
import io.swagger.v3.oas.annotations.info.Info;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import jakarta.ws.rs.Consumes;
import jakarta.ws.rs.POST;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.Produces;
import jakarta.ws.rs.core.Response;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Lazy;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

import org.springframework.web.client.RestTemplate;
import org.springframework.web.util.UriComponentsBuilder;


import java.net.URI;
import java.net.URISyntaxException;


@Component
@Path("/transfers")
@OpenAPIDefinition(info = @Info(title = "Amount Transfer endpoint", version = "1.0"))
public class TransferResource {

    @Autowired
    @Qualifier("MicroTxXaRestTemplate")
    RestTemplate restTemplate;

    private static final Logger LOG = LoggerFactory.getLogger(TransferResource.class);

    @Autowired
    @Lazy
    TransferFeeService transferFeeService;


    @Value("${departmentOneEndpoint}")
    private String departmentOneEndpoint;

    @Value("${departmentTwoEndpoint}")
    private String departmentTwoEndpoint;


    /**
     * API to start a transaction do demonstrate transaction promotion with multiple participants
     */
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Transfer completed successfully", content = @Content(mediaType = MediaType.APPLICATION_JSON_VALUE, schema = @Schema(ref = "Transfer"))),
            @ApiResponse(responseCode = "500", description = "Withdraw failed"),
            @ApiResponse(responseCode = "500", description = "Deposit failed"),
            @ApiResponse(responseCode = "500", description = "Transfer failed"),
            @ApiResponse(responseCode = "500", description = "Internal Server Error")
    })
    @POST
    @Consumes(jakarta.ws.rs.core.MediaType.APPLICATION_JSON)
    @Produces(jakarta.ws.rs.core.MediaType.APPLICATION_JSON)
    @Transactional(propagation = Propagation.REQUIRED)
    public Response transfer(Transfer transferDetails) throws Exception{
        LOG.info( "Transfer initiated:" + transferDetails.toString());
        ResponseEntity withdrawResponse = null;
        ResponseEntity depositResponse = null;
        // Use-case: The transfer service charges 10% as Fee
        transferDetails.setTransferFee(0.1* transferDetails.getAmount());
        transferDetails.setTotalCharged(transferDetails.getAmount() + transferDetails.getTransferFee());

        // Withdraw processing
        withdrawResponse= withdraw(departmentOneEndpoint, transferDetails.getTotalCharged(), transferDetails.getFrom());
        if (withdrawResponse.getStatusCode() != HttpStatus.OK) {
            LOG.error( "Withdraw failed: "+ transferDetails.toString() + "Reason: " + withdrawResponse.getStatusCode());
            throw new TransferFailedException(String.format("Withdraw failed: %s Reason: %s", transferDetails, withdrawResponse.getBody()));
        }

        // First start Fee processing
        if (!transferFeeService.depositFee(transferDetails.getFrom(), transferDetails.getTransferFee())) {
            LOG.error( "Fee deposited failed" + transferDetails.toString());
            throw new TransferFailedException(String.format("Fee Deposit failed: %s Reason: %s", transferDetails));
        }

        LOG.info( "Fee deposited successful" + transferDetails.toString());

        // Deposit processing
        depositResponse = deposit(departmentTwoEndpoint, transferDetails.getAmount(), transferDetails.getTo());
        if (depositResponse.getStatusCode() != HttpStatus.OK) {
            LOG.error( "Deposit failed: "+ transferDetails.toString() + "Reason: " + depositResponse.getStatusCode());
            throw new TransferFailedException(String.format("Deposit failed: %s Reason: %s ", transferDetails, depositResponse.getBody()));
        }
        LOG.info("Transfer successful:" + transferDetails.toString());
        return Response.ok("Transfer completed successfully").build();
    }

    /**
     * Send an HTTP request to the service to withdraw amount from the provided account identity
     * @param serviceEndpoint The service endpoint which is called to withdraw
     * @param amount The amount to be withdrawn
     * @param accountId The account Identity
     * @return HTTP Response from the service
     */
    private ResponseEntity<?> withdraw(String serviceEndpoint, double amount, String accountId) throws URISyntaxException {

        String withDrawEndpoint = UriComponentsBuilder.fromUri(URI.create(serviceEndpoint))
                .path("/accounts")
                .path("/" + accountId)
                .path("/withdraw")
                .queryParam("amount", amount)
                .build()
                .toString();

        ResponseEntity<String> response = restTemplate.postForEntity(withDrawEndpoint, null, String.class);

        HttpStatus status = HttpStatus.resolve(response.getStatusCode().value());
        LOG.info( "Withdraw Response: \n" + response.getBody().toString());
        return response;
    }

    /**
     * Send an HTTP request to the service to deposit amount into the provided account identity
     * @param serviceEndpoint The service endpoint which is called to deposit
     * @param amount The amount to be deposited
     * @param accountId The account Identity
     * @return HTTP Response from the service
     */
    private ResponseEntity<?> deposit(String serviceEndpoint, double amount, String accountId) throws URISyntaxException {
        String depositEndpoint = UriComponentsBuilder.fromUri(URI.create(serviceEndpoint))
                .path("/accounts")
                .path("/" + accountId)
                .path("/deposit")
                .queryParam("amount", amount)
                .build()
                .toString();

        ResponseEntity<String> response = restTemplate.postForEntity(depositEndpoint, null, String.class);

        LOG.info( "Deposit Response: \n" + response.getBody().toString());
        return response;
    }
}