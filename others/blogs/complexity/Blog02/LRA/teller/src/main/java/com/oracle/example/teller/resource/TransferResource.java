package com.oracle.example.teller.resource;

import com.oracle.example.teller.entity.Transfer;
import com.oracle.example.teller.entity.TransferResponse;
import com.oracle.microtx.springboot.lra.annotation.AfterLRA;
import com.oracle.microtx.springboot.lra.annotation.LRA;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.context.annotation.RequestScope;
import org.springframework.web.util.UriComponentsBuilder;

import java.net.URI;

import static com.oracle.microtx.springboot.lra.annotation.LRA.LRA_HTTP_CONTEXT_HEADER;

@RestController
@RequestMapping("/transfers")
@RequestScope
public class TransferResource {

    private static final Logger LOG = LoggerFactory.getLogger(TransferResource.class);

    @Autowired
    @Qualifier("MicroTxLRA")
    RestTemplate restTemplate;

    @Value("${departmentOneEndpoint}")
    String departmentOneEndpoint;

    @Value("${departmentTwoEndpoint}")
    String departmentTwoEndpoint;

    @RequestMapping(value = "transfer", method = RequestMethod.POST)
    @LRA(value = LRA.Type.REQUIRES_NEW, end = true, cancelOnFamily = {HttpStatus.Series.CLIENT_ERROR, HttpStatus.Series.SERVER_ERROR})
    public ResponseEntity<?> transfer(@RequestBody Transfer transferDetails,
                                      @RequestHeader(LRA_HTTP_CONTEXT_HEADER) String lraId) {

        LOG.info("Transfer initiated: {}", transferDetails);
        try {
            ResponseEntity<String> withdrawResponse = withdraw(transferDetails.getFrom(), transferDetails.getAmount());
            if (!withdrawResponse.getStatusCode().is2xxSuccessful()) {
                LOG.error("Withdraw failed: {} Reason: {}", transferDetails, withdrawResponse.getBody());
                return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                        .body(new TransferResponse("Withdraw failed. " + withdrawResponse.getBody()));
            }

            ResponseEntity<String> depositResponse = deposit(transferDetails.getTo(), transferDetails.getAmount());
            if (!depositResponse.getStatusCode().is2xxSuccessful()) {
                LOG.error("Deposit failed: {} Reason: {} ", transferDetails, depositResponse.getBody());
                return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                        .body(new TransferResponse("Deposit failed"));
            }
        } catch (Exception e) {
            LOG.error("Transfer failed with exception {}", e.getLocalizedMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new TransferResponse("Transfer failed. " + e.getLocalizedMessage()));
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
    private ResponseEntity<String> withdraw(String accountId, double amount) {
        URI departmentUri = UriComponentsBuilder.fromUri(URI.create(departmentOneEndpoint))
                .path("/withdraw")
                .path("/" + accountId)
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
    private ResponseEntity<String> deposit(String accountId, double amount) {
        URI departmentUri = UriComponentsBuilder.fromUri(URI.create(departmentTwoEndpoint))
                .path("/deposit")
                .path("/" + accountId)
                .queryParam("amount", amount)
                .build()
                .toUri();

        ResponseEntity<String> responseEntity = restTemplate.postForEntity(departmentUri, null, String.class);
        LOG.info("Deposit Response: \n" + responseEntity.getBody());
        return responseEntity;
    }

    @RequestMapping(value = "/afterLra", method = RequestMethod.PUT)
    @AfterLRA
    public ResponseEntity<?> afterLra(@RequestHeader(LRA_HTTP_CONTEXT_HEADER) String lraId, @RequestBody String status) {
        LOG.info("Received afterLra for transfer : {} with status {}",  lraId, status);
        return ResponseEntity.ok().build();
    }

}
