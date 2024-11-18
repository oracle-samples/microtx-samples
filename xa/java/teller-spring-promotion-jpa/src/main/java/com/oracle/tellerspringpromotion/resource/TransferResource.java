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
 
package com.oracle.tellerspringpromotion.resource;

import com.oracle.microtx.xa.rm.MicroTxUserTransactionService;
import com.oracle.tellerspringpromotion.entity.Transfer;
import com.oracle.tellerspringpromotion.service.CreditFeeService;
import com.oracle.tellerspringpromotion.service.TransferFeeService;
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
import org.springframework.context.annotation.Lazy;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.reactive.function.client.WebClient;
import org.springframework.web.util.UriComponentsBuilder;

import jakarta.transaction.*;
import java.net.URI;
import java.net.URISyntaxException;
import java.sql.SQLException;

@RestController
@RequestMapping("/transfers")
@OpenAPIDefinition(info = @Info(title = "Amount Transfer endpoint", version = "1.0"))
public class TransferResource {

    @Autowired
    @Qualifier("MicroTxXaRestTemplate")
    RestTemplate restTemplate;

    private static final Logger LOG = LoggerFactory.getLogger(TransferResource.class);
    @Autowired
    @Lazy
    TransferFeeService transferFeeService;

    @Autowired
    @Lazy
    CreditFeeService creditFeeService;

    @Autowired
    MicroTxUserTransactionService microTxtransaction;

    @Value("${departmentOneEndpoint}")
    private String departmentOneEndpoint;

    @Value("${departmentTwoEndpoint}")
    private String departmentTwoEndpoint;



    /**
     * API to start local transaction; with single branch
     * @param dorollback - boolean parameter to demonstrate the local transaction rollback
     */

    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Local transaction completed successfully", content = @Content(mediaType = MediaType.APPLICATION_JSON_VALUE, schema = @Schema(ref = "Transfer"))),
            @ApiResponse(responseCode = "500", description = "Transfer failed"),
            @ApiResponse(responseCode = "500", description = "Internal Server Error")
    })

    @RequestMapping(value = "/local", method = RequestMethod.POST)
    public ResponseEntity<?> localtransfer(@RequestBody Transfer transferDetails, @RequestParam(value="doRollback", required = false, defaultValue = "false") Boolean doRollback){
        LOG.info( "Local transaction initiated:" + transferDetails.toString());
        // Use-case: The transfer service charges 10% as Fee
        transferDetails.setTransferFee(0.1* transferDetails.getAmount());
        transferDetails.setTotalCharged(transferDetails.getAmount() + transferDetails.getTransferFee());
        try {
            microTxtransaction.begin(true);
            // Fee processing
            if (!transferFeeService.depositFee(transferDetails.getFrom(), transferDetails.getTransferFee())) {
                microTxtransaction.rollback();
                LOG.info( "Local Fee deposited failed" + transferDetails.toString());
                return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Local Fee deposit failed");
            }
            if(doRollback != null && doRollback) {
                throw new RuntimeException("The Rollback is called");
            }
            LOG.info( "Local Fee deposited successful" + transferDetails.toString());
            microTxtransaction.commit();
            LOG.info( "Local microTxtransaction  successful:" + transferDetails.toString());
            return ResponseEntity.status(HttpStatus.OK).body(transferDetails);
        } catch (SQLException e) {
            LOG.error( "Fee Deposit failed: "+ transferDetails.toString() + "Reason: " + e.getLocalizedMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        } catch (SystemException e) {
            LOG.error( e.getLocalizedMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        } catch(NotSupportedException | RollbackException | HeuristicMixedException | HeuristicRollbackException e){
            LOG.error( e.getLocalizedMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Transfer failed");
        } catch(RuntimeException e){
            LOG.info( "Rollback the local Connection");
            try {
                microTxtransaction.rollback();
            }catch (Exception rollbackException){
                LOG.error( rollbackException.getMessage());
                return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("RollBack failed");
            }
            return ResponseEntity.status(HttpStatus.OK).body("RollBack successful");
        }
    }


    /**
     * API to start a transaction having initiator with multiple resource manager promotion feature and no external participants
     */

    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Transfer completed successfully", content = @Content( mediaType = MediaType.APPLICATION_JSON_VALUE, schema = @Schema(ref = "Transfer"))),
            @ApiResponse(responseCode = "500", description = "Transfer failed"),
            @ApiResponse(responseCode = "500", description = "Internal Server Error")
    })
    @RequestMapping(value = "/multiplerm", method = RequestMethod.POST)
    public ResponseEntity<?>  MultipleRmTransfer(@RequestBody Transfer transferDetails){
        LOG.info( "Multiple RM Transfer initiated:" + transferDetails.toString());
        // Use-case: The transfer service charges 10% as Fee
        transferDetails.setTransferFee(0.1* transferDetails.getAmount());
        transferDetails.setTotalCharged(transferDetails.getAmount() + transferDetails.getTransferFee());
        try {
            // Begin a user transaction and also enlist in the transaction by setting enlist = true
            microTxtransaction.begin(true);
            // Fee processing for Resource 1
            if (!transferFeeService.depositFee(transferDetails.getFrom(), transferDetails.getTransferFee())) {
                LOG.error( "Fee deposited failed" + transferDetails.toString());
                microTxtransaction.rollback();
                return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Fee deposit failed");
            }

            LOG.info( "Fee deposited successful" + transferDetails.toString());


            //creditTransfer for Resource 2
            if (!creditFeeService.depositcredit(transferDetails.getFrom(), transferDetails.getTransferFee())) {
                LOG.error( "Credit deposited failed" + transferDetails.toString());
                microTxtransaction.rollback();
                return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Credit deposited failed");
            }
            LOG.info( "Credit deposited successful" + transferDetails.toString());

            // Commit the transaction
            microTxtransaction.commit();
            LOG.info( "Transfer successful:" + transferDetails.toString());
            return ResponseEntity.status(HttpStatus.OK).body(transferDetails);
        } catch (SQLException e) {
            LOG.error( "Transfer  failed: "+ transferDetails.toString() + "Reason: " + e.getLocalizedMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(e.getLocalizedMessage());
        } catch (SystemException e) {
            LOG.error( e.getLocalizedMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        } catch(NotSupportedException | RollbackException | HeuristicMixedException | HeuristicRollbackException e){
            LOG.error( e.getLocalizedMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Transfer failed");
        }
    }

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
    @RequestMapping(value = "/global", method = RequestMethod.POST)
    public ResponseEntity<?>  globaltransfer(@RequestBody Transfer transferDetails){
        LOG.info( "Global Transfer initiated:" + transferDetails.toString());
        ResponseEntity withdrawResponse = null;
        ResponseEntity depositResponse = null;
        // Use-case: The transfer service charges 10% as Fee
        transferDetails.setTransferFee(0.1* transferDetails.getAmount());
        transferDetails.setTotalCharged(transferDetails.getAmount() + transferDetails.getTransferFee());
        try {
            microTxtransaction.begin(true);
            // First start Fee processing
            if (!transferFeeService.depositFee(transferDetails.getFrom(), transferDetails.getTransferFee())) {
                LOG.error( "Fee deposited failed" + transferDetails.toString());
                microTxtransaction.rollback();
                return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Fee deposit failed");
            }

            LOG.info( "Fee deposited successful" + transferDetails.toString());

            // Begin a user transaction and also enlist in the transaction by setting enlist = true
            // Withdraw processing
            withdrawResponse= withdraw(departmentOneEndpoint, transferDetails.getTotalCharged(), transferDetails.getFrom());
            if (withdrawResponse.getStatusCode() != HttpStatus.OK) {
                microTxtransaction.rollback();
                LOG.error( "Withdraw failed: "+ transferDetails.toString() + "Reason: " + withdrawResponse.getStatusCode());
                return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Withdraw failed");
            }
            // Deposit processing
            depositResponse = deposit(departmentTwoEndpoint, transferDetails.getAmount(), transferDetails.getTo());
            if (depositResponse.getStatusCode() != HttpStatus.OK) {
                microTxtransaction.rollback();
                LOG.error( "Deposit failed: "+ transferDetails.toString() + "Reason: " + depositResponse.getStatusCode());
                return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body( "Deposit failed");
            }
            // Commit the transaction
            microTxtransaction.commit();
            LOG.info( "Transfer successful:" + transferDetails.toString());
            return ResponseEntity.ok(transferDetails);
        } catch (SQLException e) {
            LOG.error( "Transfer Fee Deposit failed: "+ transferDetails.toString() + "Reason: " + e.getLocalizedMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        } catch (SystemException | URISyntaxException e) {
            LOG.error( e.getLocalizedMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        } catch(NotSupportedException | RollbackException | HeuristicMixedException | HeuristicRollbackException e){
            LOG.error( e.getLocalizedMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Transfer failed");
        }
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