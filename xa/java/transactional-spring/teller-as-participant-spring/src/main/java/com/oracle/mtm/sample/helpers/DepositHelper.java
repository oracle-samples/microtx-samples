package com.oracle.mtm.sample.helpers;

import com.oracle.mtm.sample.service.TransferFeeService;
import com.oracle.mtm.sample.entity.Fee;
import com.oracle.mtm.sample.entity.Transfer;
import com.oracle.mtm.sample.exception.CustomCheckedException1;
import com.oracle.mtm.sample.exception.CustomCheckedException2;
import com.oracle.mtm.sample.exception.CustomUnCheckedException;
import io.swagger.v3.oas.annotations.OpenAPIDefinition;
import io.swagger.v3.oas.annotations.info.Info;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Component;
import org.springframework.transaction.TransactionException;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.context.annotation.RequestScope;
import org.springframework.web.util.UriComponentsBuilder;

import java.net.URI;
import java.net.URISyntaxException;
import java.sql.SQLException;


@Component
public class DepositHelper {

    @Autowired
    @Qualifier("MicroTxXaRestTemplate")
    RestTemplate restTemplate;

    private static final Logger LOG = LoggerFactory.getLogger(DepositHelper.class);

    @Value("${departmentTwoEndpoint}")
    private String departmentTwoEndpoint;

    @Transactional(propagation = Propagation.REQUIRED)
    public ResponseEntity<?> depositNested_AnnotatedRequired(Transfer transferDetails) {
        LOG.info("deposit initiated:" + transferDetails.toString());
        try {
            ResponseEntity<String> depositResponse = deposit( transferDetails.getAmount(), transferDetails.getTo());
            if (!depositResponse.getStatusCode().is2xxSuccessful()) {
                LOG.error("deposit failed: " + transferDetails.toString() + "Reason: " + depositResponse.getBody());
                return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("deposit failed");
            }
            LOG.info("deposit successful:" + transferDetails.toString());
            // if(false){
            //     throw new CustomCheckedException1("runtime exception");
            // }
            return ResponseEntity.status(HttpStatus.OK.value()).body("Deposit completed successfully");
            
        } catch (URISyntaxException e) {
            LOG.error(e.getLocalizedMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        } catch (TransactionException e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(e.getLocalizedMessage());
        }
    }

    @Transactional(propagation = Propagation.REQUIRED)
    public ResponseEntity<?> depositRequiredNestedIC_AnnotatedRequired(Transfer transferDetails) {
        LOG.info("deposit initiated:" + transferDetails.toString());
        try {
            ResponseEntity<String> depositResponse = deposit(transferDetails.getAmount(), transferDetails.getTo());
            if (!depositResponse.getStatusCode().is2xxSuccessful()) {
                LOG.error("deposit failed: " + transferDetails.toString() + "Reason: " + depositResponse.getBody());
                return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("deposit failed");
            }
            LOG.info("deposit successful:" + transferDetails.toString());
            // if(false){
            //     throw new CustomCheckedException1("runtime exception");
            // }
            return ResponseEntity.status(HttpStatus.OK.value()).body("Deposit completed successfully");
            
        } catch (URISyntaxException e) {
            LOG.error(e.getLocalizedMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        } catch (TransactionException e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(e.getLocalizedMessage());
        }
    }

    @Transactional(propagation = Propagation.MANDATORY)
    public ResponseEntity<?> depositMandatoryNestedIC_AnnotatedMandatory(Transfer transferDetails) {
        LOG.info("deposit initiated:" + transferDetails.toString());
        try {
            ResponseEntity<String> depositResponse = deposit(transferDetails.getAmount(), transferDetails.getTo());
            if (!depositResponse.getStatusCode().is2xxSuccessful()) {
                LOG.error("deposit failed: " + transferDetails.toString() + "Reason: " + depositResponse.getBody());
                return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("deposit failed");
            }
            LOG.info("deposit successful:" + transferDetails.toString());
            // if(false){
            //     throw new CustomCheckedException1("runtime exception");
            // }
            return ResponseEntity.status(HttpStatus.OK.value()).body("Deposit completed successfully");
            
        } catch (URISyntaxException e) {
            LOG.error(e.getLocalizedMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        } catch (TransactionException e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(e.getLocalizedMessage());
        }
    }

    @Transactional(propagation = Propagation.SUPPORTS)
    public ResponseEntity<?> depositSupportsNestedIC_AnnotatedSupports(Transfer transferDetails) {
        LOG.info("deposit initiated:" + transferDetails.toString());
        try {
            ResponseEntity<String> depositResponse = deposit(transferDetails.getAmount(), transferDetails.getTo());
            if (!depositResponse.getStatusCode().is2xxSuccessful()) {
                LOG.error("deposit failed: " + transferDetails.toString() + "Reason: " + depositResponse.getBody());
                return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("deposit failed");
            }
            LOG.info("deposit successful:" + transferDetails.toString());
            // if(false){
            //     throw new CustomCheckedException1("runtime exception");
            // }
            return ResponseEntity.status(HttpStatus.OK.value()).body("Deposit completed successfully");
            
        } catch (URISyntaxException e) {
            LOG.error(e.getLocalizedMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        } catch (TransactionException e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(e.getLocalizedMessage());
        }
    }



    /**
     * Send an HTTP request to the service to deposit amount into the provided account identity
     * @param amount The amount to be deposited
     * @param accountId The account Identity
     * @return HTTP Response from the service
     */
    private ResponseEntity<String> deposit(double amount, String accountId) throws URISyntaxException {
        URI departmentUri = getDepartmentTwoTarget()
                .path("/accounts")
                .path("/" + accountId)
                .path("/deposit")
                .queryParam("amount", amount)
                .build()
                .toUri();

        ResponseEntity<String> responseEntity = restTemplate.postForEntity(departmentUri, null, String.class);
        LOG.info("Deposit Response: {}", responseEntity.getBody());
        return responseEntity;
    }


    private UriComponentsBuilder getDepartmentTwoTarget(){
        return UriComponentsBuilder.fromUri(URI.create(departmentTwoEndpoint));
    }

}