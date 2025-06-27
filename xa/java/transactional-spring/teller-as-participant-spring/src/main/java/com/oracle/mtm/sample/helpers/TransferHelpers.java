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
public class TransferHelpers {

    @Autowired
    @Qualifier("MicroTxXaRestTemplate")
    RestTemplate restTemplate;

    private static final Logger LOG = LoggerFactory.getLogger(TransferHelpers.class);

    @Value("${departmentOneEndpoint}")
    private String departmentOneEndpoint;

    @Value("${departmentTwoEndpoint}")
    private String departmentTwoEndpoint;

    @Value("${departmentThreeEndpoint}")
    private String departmentThreeEndpoint;

    @Value("${departmentFourEndpoint}")
    private String departmentFourEndpoint;

    @Autowired
    private DepositHelper depositHelper;

    public ResponseEntity<?> withdraw_NoAnnotation(Transfer transferDetails) {
        return withdraw(transferDetails);
    }

    public ResponseEntity<?> deposit_NoAnnotation(Transfer transferDetails) {
        return deposit(transferDetails);
    }

    public ResponseEntity<?> deposit_NoAnnotation_Exception(Transfer transferDetails) {
        ResponseEntity<?> depositResponse = deposit(transferDetails);
        throw new RuntimeException("Rollback explicitly");
    }

    @Transactional(propagation = Propagation.REQUIRED)
    public ResponseEntity<?> withdrawRequiredIC_AnnotatedRequired(Transfer transferDetails) {
        return withdraw(transferDetails);
    }

    @Transactional(propagation = Propagation.REQUIRED)
    public ResponseEntity<?> depositRequiredIC_AnnotatedRequired(Transfer transferDetails) {
        return deposit(transferDetails);
    }

    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public ResponseEntity<?> withdrawRequiresNewIC_AnnotatedRequiresNew(Transfer transferDetails) {
        return withdraw(transferDetails);
    }

    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public ResponseEntity<?> depositRequiresNewIC_AnnotatedRequiresNew(Transfer transferDetails) {
        return deposit(transferDetails);
    }

    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public ResponseEntity<?> depositRequiresNewIC_AnnotatedRequiresNew_Exception(Transfer transferDetails) {
        ResponseEntity<?> depositResponse = deposit(transferDetails);
        throw new RuntimeException("this is runtime exception");
    }

    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public ResponseEntity<?> withdrawMandatoryOC_AnnotatedRequiresNew(Transfer transferDetails) {
        return withdraw(transferDetails);
    }

    @Transactional(propagation = Propagation.MANDATORY)
    public ResponseEntity<?> depositMandatoryOC_AnnotatedMandatory(Transfer transferDetails) {
        return deposit(transferDetails);
    }

    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public ResponseEntity<?> withdrawMandatoryIC_AnnotatedRequiresNew(Transfer transferDetails) {
        return withdraw(transferDetails);
    }

    @Transactional(propagation = Propagation.REQUIRED)
    public ResponseEntity<?> withdrawMandatoryRequiredIC_AnnotatedRequired(Transfer transferDetails) {
        return withdraw(transferDetails);
    }

    @Transactional(propagation = Propagation.MANDATORY)
    public ResponseEntity<?> depositMandatoryIC_AnnotatedMandatory(Transfer transferDetails) {
        return deposit(transferDetails);
    }

    @Transactional(propagation = Propagation.SUPPORTS)
    public ResponseEntity<?> withdrawSupportsOC_AnnotatedSupports(Transfer transferDetails) {
        return withdraw(transferDetails);
    }

    @Transactional(propagation = Propagation.SUPPORTS)
    public ResponseEntity<?> depositSupportsOC_AnnotatedSupports(Transfer transferDetails) {
        return deposit(transferDetails);
    }

    @Transactional(propagation = Propagation.MANDATORY)
    public ResponseEntity<?> withdrawSupportsIC_AnnotatedMandatory(Transfer transferDetails) {
        return withdraw(transferDetails);
    }

    @Transactional(propagation = Propagation.SUPPORTS)
    public ResponseEntity<?> depositSupportsIC_AnnotatedSupports(Transfer transferDetails) {
        return deposit(transferDetails);
    }

    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public ResponseEntity<?> withdrawNotSupportedOC_AnnotatedRequiresNew(Transfer transferDetails) {
        return withdraw(transferDetails);
    }

    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public ResponseEntity<?> depositNotSupportedOC_AnnotatedRequiresNew(Transfer transferDetails) {
        return deposit(transferDetails);
    }

    @Transactional(propagation = Propagation.MANDATORY)
    public ResponseEntity<?> withdrawNotSupportedIC_AnnotatedMandatory(Transfer transferDetails) {
        return withdraw(transferDetails);
    }

    @Transactional(propagation = Propagation.SUPPORTS)
    public ResponseEntity<?> depositNotSupportedIC_AnnotatedSupports(Transfer transferDetails) {
        return deposit(transferDetails);
    }

    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public ResponseEntity<?> withdrawNeverOC_AnnotatedRequiresNew(Transfer transferDetails) {
        return withdraw(transferDetails);
    }

    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public ResponseEntity<?> depositNeverOC_AnnotatedRequiresNew(Transfer transferDetails) {
        return deposit(transferDetails);
    }

    @Transactional(propagation = Propagation.MANDATORY)
    public ResponseEntity<?> withdrawNeverIC_AnnotatedMandatory(Transfer transferDetails) {
        return withdraw(transferDetails);
    }

    @Transactional(propagation = Propagation.MANDATORY)
    public ResponseEntity<?> depositNeverIC_AnnotatedMandatory(Transfer transferDetails) {
        return deposit(transferDetails);
    }

    public ResponseEntity<?> withdraw2(Transfer transferDetails) {
        LOG.info("Withdraw initiated: " + transferDetails);
    
        try {
            ResponseEntity<String> withdrawResponse = withdraw2(transferDetails.getAmount(), transferDetails.getFrom());
    
            if (!withdrawResponse.getStatusCode().is2xxSuccessful()) {
                LOG.info("Withdraw failed: " + transferDetails + " Reason: " + withdrawResponse.getBody());
                return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Withdraw failed");
            }
    
            LOG.info("Withdraw successful: " + transferDetails);
    
            // if (false) {
            //     throw new RuntimeException("custom runtime exception");
            // }
            return ResponseEntity.ok("Withdraw completed successfully");
    
        } catch (URISyntaxException e) {
            LOG.error(e.getLocalizedMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        } catch (TransactionException e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(e.getLocalizedMessage());
        }
    }

    public ResponseEntity<?> deposit2(Transfer transferDetails) {
        LOG.info("Deposit initiated: " + transferDetails);

        try {
            ResponseEntity<?> depositResponse = deposit2(transferDetails.getAmount(), transferDetails.getTo());
    
            if (!depositResponse.getStatusCode().is2xxSuccessful()) {
                LOG.info("Deposit failed: " + transferDetails + 
                            " Reason: " + depositResponse.getBody());
                return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Deposit failed");
            }
    
            LOG.info("Deposit successful: " + transferDetails);
    
            // if (false) { 
            //     throw new RuntimeException("custom runtime exception");
            // }
    
            return ResponseEntity.ok("Deposit completed successfully");
    
        } catch (URISyntaxException e) {
            LOG.error(e.getLocalizedMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        } catch (TransactionException e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(e.getLocalizedMessage());
        }
    }

    @Transactional(propagation = Propagation.REQUIRED)
    public ResponseEntity<?> withdrawNested_AnnotatedRequired(Transfer transferDetails) {
        LOG.info("Withdraw initiated: " + transferDetails);
    
        try {
            ResponseEntity<String> withdrawResponse = withdraw(transferDetails.getAmount(), transferDetails.getFrom());
    
            if (!withdrawResponse.getStatusCode().is2xxSuccessful()) {
                LOG.info("Withdraw failed: " + transferDetails + 
                            " Reason: " + withdrawResponse.getBody());
                return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Withdraw failed");
            }
    
            LOG.info("Withdraw successful: " + transferDetails);
    
            ResponseEntity<?> depositResponse = depositHelper.depositNested_AnnotatedRequired(transferDetails);
            // try {
            //     depositResponse = depositHelper.depositNested(transferDetails);
            // } catch (CustomCheckedException1 e) {
            //     System.out.println(e.getMessage());
            //     e.printStackTrace();
            // }
    
            boolean success = withdrawResponse.getStatusCode().is2xxSuccessful() && depositResponse != null && depositResponse.getStatusCode().is2xxSuccessful();
    
            if (success) {
                return ResponseEntity.ok("Transfer completed successfully");
            } else {
                return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Transfer failed");
            }
    
        } catch (URISyntaxException e) {
            LOG.error(e.getLocalizedMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        } catch (TransactionException e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(e.getLocalizedMessage());
        }
    }

    @Transactional(propagation = Propagation.REQUIRED)
    public ResponseEntity<?> withdrawRequiredNestedIC_AnnotatedRequired(Transfer transferDetails) {
        LOG.info("Withdraw initiated: " + transferDetails);
    
        try {
            ResponseEntity<String> withdrawResponse = withdraw(transferDetails.getAmount(), transferDetails.getFrom());
    
            if (!withdrawResponse.getStatusCode().is2xxSuccessful()) {
                LOG.info("Withdraw failed: " + transferDetails + 
                            " Reason: " + withdrawResponse.getBody());
                return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Withdraw failed");
            }
    
            LOG.info("Withdraw successful: " + transferDetails);
    
            ResponseEntity<?> depositResponse = depositHelper.depositRequiredNestedIC_AnnotatedRequired(transferDetails);
            // try {
            //     depositResponse = depositHelper.depositRequiredNestedIC(transferDetails);
            // } catch (CustomCheckedException1 e) {
            //     System.out.println(e.getMessage());
            //     e.printStackTrace();
            // }
    
            boolean success = withdrawResponse.getStatusCode().is2xxSuccessful() && depositResponse != null && depositResponse.getStatusCode().is2xxSuccessful();
    
            if (success) {
                return ResponseEntity.ok("Transfer completed successfully");
            } else {
                return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Transfer failed");
            }
    
        } catch (URISyntaxException e) {
            LOG.error(e.getLocalizedMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        } catch (TransactionException e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(e.getLocalizedMessage());
        }
    }

    @Transactional(propagation = Propagation.REQUIRED)
    public ResponseEntity<String> withdrawMandatoryNestedIC_AnnotatedRequired(Transfer transferDetails) {
        LOG.info("Withdraw initiated: {}", transferDetails);

        try {
            ResponseEntity<String> withdrawResponse = withdraw(transferDetails.getAmount(), transferDetails.getFrom());

            if (!withdrawResponse.getStatusCode().is2xxSuccessful()) {
                LOG.info("Withdraw failed: {} Reason: {}", transferDetails, withdrawResponse.getBody());
                return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Withdraw failed");
            }

            LOG.info("Withdraw successful: {}", transferDetails);

            ResponseEntity<?> depositResponse = depositHelper.depositMandatoryNestedIC_AnnotatedMandatory(transferDetails);

            if (withdrawResponse.getStatusCode().is2xxSuccessful() &&
                depositResponse != null && depositResponse.getStatusCode().is2xxSuccessful()) {
                return ResponseEntity.ok("Transfer completed successfully");
            }

            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Transfer failed");

        } catch (URISyntaxException e) {
            LOG.error(e.getLocalizedMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        } catch (TransactionException e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(e.getLocalizedMessage());
        }
    }
    
    @Transactional(propagation = Propagation.REQUIRED)
    public ResponseEntity<String> withdrawSupportsNestedIC_AnnotatedRequired(Transfer transferDetails) {
        LOG.info("Withdraw initiated: {}", transferDetails);

        try {
            ResponseEntity<String> withdrawResponse = withdraw(transferDetails.getAmount(), transferDetails.getFrom());

            if (!withdrawResponse.getStatusCode().is2xxSuccessful()) {
                LOG.info("Withdraw failed: {} Reason: {}", transferDetails, withdrawResponse.getBody());
                return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Withdraw failed");
            }

            LOG.info("Withdraw successful: {}", transferDetails);

            ResponseEntity<?> depositResponse = depositHelper.depositSupportsNestedIC_AnnotatedSupports(transferDetails); 

            if (withdrawResponse.getStatusCode().is2xxSuccessful() &&
                depositResponse != null && depositResponse.getStatusCode().is2xxSuccessful()) {
                return ResponseEntity.ok("Transfer completed successfully");
            }

            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Transfer failed");

        } catch (URISyntaxException e) {
            LOG.error(e.getLocalizedMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        } catch (TransactionException e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(e.getLocalizedMessage());
        }
    }

    public ResponseEntity<String> transferAB(Transfer transferDetails) {
        LOG.info("Withdraw initiated: {}", transferDetails);


        try {
            ResponseEntity<String> withdrawResponse = withdraw(transferDetails.getAmount(), transferDetails.getFrom());

            if (!withdrawResponse.getStatusCode().is2xxSuccessful()) {
                LOG.info("Withdraw failed: {} Reason: {}", transferDetails, withdrawResponse.getBody());
                return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Withdraw failed");
            }

            LOG.info("Withdraw successful: {}", transferDetails);

            ResponseEntity<?> depositResponse = deposit(transferDetails.getAmount(), transferDetails.getTo());

            if (!depositResponse.getStatusCode().is2xxSuccessful()) {
                LOG.info("Deposit failed: {} Reason: {}", transferDetails, depositResponse.getBody());
                return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Deposit failed");
            }

            LOG.info("Transfer successful: {}", transferDetails);
            return ResponseEntity.ok("Transfer completed successfully");

        } catch (URISyntaxException e) {
            LOG.error(e.getLocalizedMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        } catch (TransactionException e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(e.getLocalizedMessage());
        }
    }

    public ResponseEntity<String> transferCD(Transfer transferDetails) {
        LOG.info("Withdraw initiated: {}", transferDetails);

        try {
            ResponseEntity<String> withdrawResponse = withdraw2(transferDetails.getAmount(), transferDetails.getFrom());

            if (!withdrawResponse.getStatusCode().is2xxSuccessful()) {
                LOG.info("Withdraw failed: {} Reason: {}", transferDetails, withdrawResponse.getBody());
                return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Withdraw failed");
            }

            LOG.info("Withdraw successful: {}", transferDetails);

            ResponseEntity<?> depositResponse = deposit2(transferDetails.getAmount(), transferDetails.getTo());

            if (!depositResponse.getStatusCode().is2xxSuccessful()) {
                LOG.info("Deposit failed: {} Reason: {}", transferDetails, depositResponse.getBody());
                return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Deposit failed");
            }

            LOG.info("Transfer successful: {}", transferDetails);
            return ResponseEntity.ok("Transfer completed successfully");

        } catch (URISyntaxException e) {
            LOG.error(e.getLocalizedMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        } catch (TransactionException e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(e.getLocalizedMessage());
        }
    }

    public ResponseEntity<?> withdraw(Transfer transferDetails) {
        LOG.info("Withdraw initiated: " + transferDetails);
    
        ResponseEntity<String> withdrawResponse = null;
        try {
            withdrawResponse = withdraw(transferDetails.getAmount(), transferDetails.getFrom());
    
            if (!withdrawResponse.getStatusCode().is2xxSuccessful()) {
                LOG.info("Withdraw failed: " + transferDetails + " Reason: " + withdrawResponse.getBody());
                return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Withdraw failed");
            }
    
            LOG.info("Withdraw successful: " + transferDetails);
            return ResponseEntity.ok("Withdraw completed successfully");
    
        } catch (URISyntaxException e) {
            LOG.error(e.getLocalizedMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        } catch (TransactionException e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(e.getLocalizedMessage());
        }
    }

    public ResponseEntity<?> deposit(Transfer transferDetails) {
        LOG.info("Deposit initiated: " + transferDetails);
    
        ResponseEntity<?> depositResponse = null;
        try {
            depositResponse = deposit(transferDetails.getAmount(), transferDetails.getTo());
    
            if (!depositResponse.getStatusCode().is2xxSuccessful()) {
                LOG.info("Deposit failed: " + transferDetails + 
                            " Reason: " + depositResponse.getBody());
                return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Deposit failed");
            }
    
            LOG.info("Deposit successful: " + transferDetails);
            return ResponseEntity.ok("Deposit completed successfully");
    
        } catch (URISyntaxException e) {
            LOG.error(e.getLocalizedMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        } catch (TransactionException e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(e.getLocalizedMessage());
        }
    }

    /**
     * Send an HTTP request to the service to withdraw amount from the provided account identity
     * @param amount The amount to be withdrawn
     * @param accountId The account Identity
     * @return HTTP Response from the service
     */
    private ResponseEntity<String> withdraw(double amount, String accountId) throws URISyntaxException {
        URI departmentUri = getDepartmetnOneTarget()
                .path("/accounts")
                .path("/" + accountId)
                .path("/withdraw")
                .queryParam("amount", amount)
                .build()
                .toUri();

        ResponseEntity<String> responseEntity = restTemplate.postForEntity(departmentUri, null, String.class);
        LOG.info("Withdraw Response: {}", responseEntity.getBody());
        return responseEntity;
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

    private UriComponentsBuilder getDepartmetnOneTarget(){
        return UriComponentsBuilder.fromUri(URI.create(departmentOneEndpoint));
    }

    private UriComponentsBuilder getDepartmentTwoTarget(){
        return UriComponentsBuilder.fromUri(URI.create(departmentTwoEndpoint));
    }


    /**
     * Send an HTTP request to the service to withdraw amount from the provided account identity
     * @param amount The amount to be withdrawn
     * @param accountId The account Identity
     * @return HTTP Response from the service
     */
    private ResponseEntity<String> withdraw2(double amount, String accountId) throws URISyntaxException {
        URI departmentUri = getDepartmetnThreeTarget()
                .path("/accounts")
                .path("/" + accountId)
                .path("/withdraw")
                .queryParam("amount", amount)
                .build()
                .toUri();

        ResponseEntity<String> responseEntity = restTemplate.postForEntity(departmentUri, null, String.class);
        LOG.info("Withdraw Response: {}", responseEntity.getBody());
        return responseEntity;
    }

    /**
     * Send an HTTP request to the service to deposit amount into the provided account identity
     * @param amount The amount to be deposited
     * @param accountId The account Identity
     * @return HTTP Response from the service
     */
    private ResponseEntity<String> deposit2(double amount, String accountId) throws URISyntaxException {
        URI departmentUri = getDepartmentFourTarget()
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

    private UriComponentsBuilder getDepartmetnThreeTarget(){
        return UriComponentsBuilder.fromUri(URI.create(departmentThreeEndpoint));
    }

    private UriComponentsBuilder getDepartmentFourTarget(){
        return UriComponentsBuilder.fromUri(URI.create(departmentFourEndpoint));
    }



}