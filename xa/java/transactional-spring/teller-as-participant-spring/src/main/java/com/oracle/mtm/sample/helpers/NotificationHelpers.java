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
public class NotificationHelpers {

    @Autowired
    @Qualifier("MicroTxXaRestTemplate")
    RestTemplate restTemplate;

    private static final Logger LOG = LoggerFactory.getLogger(NotificationHelpers.class);

    @Value("${departmentOneEndpoint}")
    private String departmentOneEndpoint;

    @Transactional(propagation = Propagation.NEVER)
    public ResponseEntity<?> emailNotificationAnnotatedNever(Transfer transferDetails) {
        LOG.info("Email Notification initiated:" + transferDetails.toString());
        ResponseEntity<String> emailResponse = null;
        try {
            emailResponse = emailNotificationAnnotatedNever(transferDetails.getAmount(), transferDetails.getFrom());
            if (!emailResponse.getStatusCode().is2xxSuccessful()) {
                LOG.error("Email Notification failed: " + transferDetails.toString() + "Reason: " + emailResponse.getBody());
                return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Email Notification failed");
            }
            LOG.info("Email notification successful:" + transferDetails.toString());
            return ResponseEntity.status(HttpStatus.OK.value()).body("Email notification successful");
            
        } catch (URISyntaxException e) {
            LOG.error(e.getLocalizedMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        } catch (TransactionException e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(e.getLocalizedMessage());
        }
    }

    @Transactional(propagation = Propagation.NOT_SUPPORTED)
    public ResponseEntity<?> emailNotifyNotSupportedOC_AnnotatedNotSupported(Transfer transferDetails) {
        return emailNotify(transferDetails);
    }

    @Transactional(propagation = Propagation.NOT_SUPPORTED)
    public ResponseEntity<?> emailNotifyNotSupportedIC_AnnotatedNotSupported(Transfer transferDetails) {
        return emailNotify(transferDetails);
    }

    @Transactional(propagation = Propagation.NEVER)
    public ResponseEntity<?> emailNotifyNeverOC_AnnotatedNever(Transfer transferDetails) {
        return emailNotify(transferDetails);
    }

    @Transactional(propagation = Propagation.NEVER)
    public ResponseEntity<?> emailNotifyNeverIC_AnnotatedNever(Transfer transferDetails) {
        return emailNotify(transferDetails);
    }

    public ResponseEntity<?> emailNotify(Transfer transferDetails) {
        LOG.info("Email Notification initiated:" + transferDetails.toString());
        ResponseEntity<String> emailResponse = null;
        try {
            emailResponse = emailNotificationAnnotatedNever(transferDetails.getAmount(), transferDetails.getFrom());
            if (!emailResponse.getStatusCode().is2xxSuccessful()) {
                LOG.error("Email Notification failed: " + transferDetails.toString() + "Reason: " + emailResponse.getBody());
                return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Email Notification failed");
            }
            LOG.info("Email notification successful:" + transferDetails.toString());
            return ResponseEntity.status(HttpStatus.OK.value()).body("Email notification successful");
            
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
    private ResponseEntity<String> emailNotificationAnnotatedNever(double amount, String accountId) throws URISyntaxException {
        URI departmentUri = getDepartmentOneTarget()
                .path("/accounts")
                .path("/" + accountId)
                .path("/emailNotify")
                .queryParam("amount", amount)
                .build()
                .toUri();

        ResponseEntity<String> responseEntity = restTemplate.postForEntity(departmentUri, null, String.class);
        LOG.info("Email Response: {}", responseEntity.getBody());
        return responseEntity;
    }


    private UriComponentsBuilder getDepartmentOneTarget(){
        return UriComponentsBuilder.fromUri(URI.create(departmentOneEndpoint));
    }



    

}