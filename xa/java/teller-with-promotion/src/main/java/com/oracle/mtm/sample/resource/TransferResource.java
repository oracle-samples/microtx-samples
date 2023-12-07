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
 
package com.oracle.mtm.sample.resource;

import com.oracle.mtm.sample.Configuration;
import com.oracle.mtm.sample.entity.Transfer;
import com.oracle.mtm.sample.service.CreditFeeService;
import com.oracle.mtm.sample.service.TransferFeeService;

import oracle.tmm.jta.TrmUserTransaction;
import org.eclipse.microprofile.config.inject.ConfigProperty;
import org.eclipse.microprofile.openapi.annotations.OpenAPIDefinition;
import org.eclipse.microprofile.openapi.annotations.info.Info;
import org.eclipse.microprofile.openapi.annotations.media.Content;
import org.eclipse.microprofile.openapi.annotations.media.Schema;
import org.eclipse.microprofile.openapi.annotations.responses.APIResponse;
import org.eclipse.microprofile.openapi.annotations.responses.APIResponses;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import jakarta.inject.Inject;
import jakarta.transaction.HeuristicMixedException;
import jakarta.transaction.HeuristicRollbackException;
import jakarta.transaction.RollbackException;
import jakarta.transaction.SystemException;
import jakarta.ws.rs.*;
import jakarta.ws.rs.client.Client;
import jakarta.ws.rs.client.ClientBuilder;
import jakarta.ws.rs.client.Entity;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import jakarta.ws.rs.core.UriBuilder;
import java.lang.invoke.MethodHandles;
import java.net.URI;
import java.net.URISyntaxException;
import java.sql.SQLException;
import java.util.logging.Level;

@Path("/transfers")
@OpenAPIDefinition(info = @Info(title = "Amount Transfer endpoint", version = "1.0"))
public class TransferResource {

    private static Client withdrawClient = ClientBuilder.newClient();
    private static Client depositClient = ClientBuilder.newClient();

    @Inject
    TransferFeeService transferFeeService;

    @Inject
    CreditFeeService creditFeeService;

    @Inject
    @ConfigProperty(name = "departmentOneEndpoint")
    private String departmentOneEndpoint;

    @Inject
    @ConfigProperty(name = "departmentTwoEndpoint")
    private String departmentTwoEndpoint;

    @Inject
    private Configuration config;

    final static Logger logger = LoggerFactory.getLogger(MethodHandles.lookup().lookupClass());


    /**
     * API to start local transaction with single branch
     * @param dorollback - boolean parameter to demonstrate the local transaction rollback
     */
    @Path("/local")
    @APIResponses(value = {
            @APIResponse(responseCode = "200", description = "Local transaction completed successfully", content = @Content(mediaType = MediaType.APPLICATION_JSON, schema = @Schema(ref = "Transfer"))),
            @APIResponse(responseCode = "500", description = "Transfer failed"),
            @APIResponse(responseCode = "500", description = "Internal Server Error")
    })
    @POST
    @Consumes(MediaType.APPLICATION_JSON)
    @Produces(MediaType.APPLICATION_JSON)
    public Response localtransfer(Transfer transferDetails, @QueryParam("doRollback") Boolean doRollback){
        logger.info("Local transaction initiated:" + transferDetails.toString());
        // Use-case: The transfer service charges 10% as Fee
        transferDetails.setTransferFee(0.1* transferDetails.getAmount());
        transferDetails.setTotalCharged(transferDetails.getAmount() + transferDetails.getTransferFee());
        TrmUserTransaction transaction = new TrmUserTransaction();
        try {
            transaction.begin(true);
            // Fee processing
            if (!transferFeeService.depositFee(transferDetails.getFrom(), transferDetails.getTransferFee())) {
                transaction.rollback();
                logger.error("Local Fee deposited failed" + transferDetails.toString());
                return Response.status(Response.Status.INTERNAL_SERVER_ERROR.getStatusCode(), "Local Fee deposit failed").build();
            }
            if(doRollback != null && doRollback) {
                throw new RuntimeException("The Rollback is called");
            }
            logger.info("Local Fee deposited successful" + transferDetails.toString());
            transaction.commit();
            logger.info("Local transaction  successful:" + transferDetails.toString());
            return Response.ok(transferDetails).build();
        } catch (SQLException e) {
            logger.error("Fee Deposit failed: "+ transferDetails.toString() + "Reason: " + e.getLocalizedMessage());
            return Response.status(Response.Status.INTERNAL_SERVER_ERROR).build();
        } catch (SystemException e) {
            logger.error(e.getLocalizedMessage());
            return Response.status(Response.Status.INTERNAL_SERVER_ERROR).build();
        } catch(RollbackException | HeuristicMixedException | HeuristicRollbackException e){
            logger.error(e.getLocalizedMessage());
            return Response.status(Response.Status.INTERNAL_SERVER_ERROR.getStatusCode(), "Transfer failed").build();
        } catch(RuntimeException e){
            logger.info("Rollback the local Connection");
            try {
                transaction.rollback();
            }catch (Exception rollbackException){
                logger.error(rollbackException.getMessage());
                return Response.status(Response.Status.INTERNAL_SERVER_ERROR.getStatusCode(), "RollBack failed").build();
            }
            return Response.status(Response.Status.OK.getStatusCode(), "RollBack successful").build();
        }
    }


    /**
     * API to start a transaction having initiator with multiple resource manager promotion feature and no external participants
     */
    @Path("/multiplerm")
    @APIResponses(value = {
            @APIResponse(responseCode = "200", description = "Transfer completed successfully", content = @Content(mediaType = MediaType.APPLICATION_JSON, schema = @Schema(ref = "Transfer"))),
            @APIResponse(responseCode = "500", description = "Transfer failed"),
            @APIResponse(responseCode = "500", description = "Internal Server Error")
    })
    @POST
    @Consumes(MediaType.APPLICATION_JSON)
    @Produces(MediaType.APPLICATION_JSON)
    public Response MultipleRmTransfer(Transfer transferDetails){
        logger.info("Multiple RM Transfer initiated:" + transferDetails.toString());
        // Use-case: The transfer service charges 10% as Fee
        transferDetails.setTransferFee(0.1* transferDetails.getAmount());
        transferDetails.setTotalCharged(transferDetails.getAmount() + transferDetails.getTransferFee());
        TrmUserTransaction transaction = new TrmUserTransaction();
        try {
            // Begin a user transaction and also enlist in the transaction by setting enlist = true
            transaction.begin(true);
            // Fee processing for Resource 1
            if (!transferFeeService.depositFee(transferDetails.getFrom(), transferDetails.getTransferFee())) {
                logger.error("Fee deposited failed" + transferDetails.toString());
                transaction.rollback();
                return Response.status(Response.Status.INTERNAL_SERVER_ERROR.getStatusCode(), "Fee deposit failed").build();
            }

            logger.info("Fee deposited successful" + transferDetails.toString());


            //creditTransfer for Resource 2
            if (!creditFeeService.depositcredit(transferDetails.getFrom(), transferDetails.getTransferFee())) {
                logger.error("Credit deposited failed" + transferDetails.toString());
                transaction.rollback();
                return Response.status(Response.Status.INTERNAL_SERVER_ERROR.getStatusCode(), "Credit deposited failed").build();
            }
            logger.info("Credit deposited successful" + transferDetails.toString());

            // Commit the transaction
            transaction.commit();
            logger.info("Transfer successful:" + transferDetails.toString());
            return Response.ok(transferDetails).build();
        } catch (SQLException e) {
            logger.error("Transfer  failed: "+ transferDetails.toString() + "Reason: " + e.getLocalizedMessage());
            return Response.status(Response.Status.INTERNAL_SERVER_ERROR).build();
        } catch (SystemException e) {
            logger.error(e.getLocalizedMessage());
            return Response.status(Response.Status.INTERNAL_SERVER_ERROR).build();
        } catch(RollbackException | HeuristicMixedException | HeuristicRollbackException e){
            logger.error(e.getLocalizedMessage());
            return Response.status(Response.Status.INTERNAL_SERVER_ERROR.getStatusCode(), "Transfer failed").build();
        }
    }

    /**
     * API to start a transaction do demonstrate transaction promotion with multiple participants
     */
    @Path("/global")
    @APIResponses(value = {
            @APIResponse(responseCode = "200", description = "Transfer completed successfully", content = @Content(mediaType = MediaType.APPLICATION_JSON, schema = @Schema(ref = "Transfer"))),
            @APIResponse(responseCode = "500", description = "Withdraw failed"),
            @APIResponse(responseCode = "500", description = "Deposit failed"),
            @APIResponse(responseCode = "500", description = "Transfer failed"),
            @APIResponse(responseCode = "500", description = "Internal Server Error")
    })
    @POST
    @Consumes(MediaType.APPLICATION_JSON)
    @Produces(MediaType.APPLICATION_JSON)
    public Response globaltransfer(Transfer transferDetails){
        logger.info("Global Transfer initiated:" + transferDetails.toString());
        Response withdrawResponse = null;
        Response depositResponse = null;
        // Use-case: The transfer service charges 10% as Fee
        transferDetails.setTransferFee(0.1* transferDetails.getAmount());
        transferDetails.setTotalCharged(transferDetails.getAmount() + transferDetails.getTransferFee());
        TrmUserTransaction transaction = new TrmUserTransaction();
        try {
            transaction.begin(true);
            // First start Fee processing
            if (!transferFeeService.depositFee(transferDetails.getFrom(), transferDetails.getTransferFee())) {
                logger.error("Fee deposited failed" + transferDetails.toString());
                transaction.rollback();
                return Response.status(Response.Status.INTERNAL_SERVER_ERROR.getStatusCode(), "Fee deposit failed").build();
            }

            logger.info("Fee deposited successful" + transferDetails.toString());

            // Begin a user transaction and also enlist in the transaction by setting enlist = true
            // Withdraw processing
            withdrawResponse= withdraw(departmentOneEndpoint, transferDetails.getTotalCharged(), transferDetails.getFrom());
            if (withdrawResponse.getStatus() != Response.Status.OK.getStatusCode()) {
                transaction.rollback();
                logger.error("Withdraw failed: "+ transferDetails.toString() + "Reason: " + withdrawResponse.getStatusInfo().getReasonPhrase());
                return Response.status(Response.Status.INTERNAL_SERVER_ERROR.getStatusCode(), "Withdraw failed").build();
            }
            // Deposit processing
            depositResponse = deposit(departmentTwoEndpoint, transferDetails.getAmount(), transferDetails.getTo());
            if (depositResponse.getStatus() != Response.Status.OK.getStatusCode()) {
                transaction.rollback();
                logger.error("Deposit failed: "+ transferDetails.toString() + "Reason: " + depositResponse.getStatusInfo().getReasonPhrase());
                return Response.status(Response.Status.INTERNAL_SERVER_ERROR.getStatusCode(), "Deposit failed").build();
            }
            // Commit the transaction
            transaction.commit();
            logger.info("Transfer successful:" + transferDetails.toString());
            return Response.ok(transferDetails).build();
        } catch (SQLException e) {
            logger.error("Transfer Fee Deposit failed: "+ transferDetails.toString() + "Reason: " + e.getLocalizedMessage());
            return Response.status(Response.Status.INTERNAL_SERVER_ERROR).build();
        } catch (SystemException | URISyntaxException e) {
            logger.error(e.getLocalizedMessage());
            return Response.status(Response.Status.INTERNAL_SERVER_ERROR).build();
        } catch(RollbackException | HeuristicMixedException | HeuristicRollbackException e){
            logger.error(e.getLocalizedMessage());
            return Response.status(Response.Status.INTERNAL_SERVER_ERROR.getStatusCode(), "Transfer failed").build();
        }  finally {
            if(withdrawResponse != null) withdrawResponse.close();
            if(depositResponse != null) depositResponse.close();
        }
    }

    /**
     * Send an HTTP request to the service to withdraw amount from the provided account identity
     * @param serviceEndpoint The service endpoint which is called to withdraw
     * @param amount The amount to be withdrawn
     * @param accountId The account Identity
     * @return HTTP Response from the service
     */
    private Response withdraw(String serviceEndpoint, double amount, String accountId) throws URISyntaxException {
        String withDrawEndpoint = UriBuilder.fromUri(new URI(serviceEndpoint)).path("accounts").path(accountId).path("withdraw").queryParam("amount", amount).toString();
        Response response = withdrawClient.target(withDrawEndpoint).request().post(Entity.text(""));
        logger.info("Withdraw Response: \n" + response.toString());
        return response;
    }

    /**
     * Send an HTTP request to the service to deposit amount into the provided account identity
     * @param serviceEndpoint The service endpoint which is called to deposit
     * @param amount The amount to be deposited
     * @param accountId The account Identity
     * @return HTTP Response from the service
     */
    private Response deposit(String serviceEndpoint, double amount, String accountId) throws URISyntaxException {
        String depositEndpoint = UriBuilder.fromUri(new URI(serviceEndpoint)).path("accounts").path(accountId).path("/deposit").queryParam("amount", amount).toString();
        Response response = depositClient.target(depositEndpoint).request().post(Entity.text(""));
        logger.info("Deposit Response: \n" + response.toString());
        return response;
    }
}