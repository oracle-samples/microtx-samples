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
