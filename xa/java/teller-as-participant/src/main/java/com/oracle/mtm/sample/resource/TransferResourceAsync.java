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

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.oracle.mtm.sample.entity.Fee;
import com.oracle.mtm.sample.entity.Transfer;
import com.oracle.mtm.sample.exception.TransferFailedException;
import com.oracle.mtm.sample.service.TransferFeeService;
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
import oracle.tmm.jta.TrmUserTransaction;
import oracle.tmm.task.decorator.MicroTxXATaskExecutor;
import org.eclipse.microprofile.config.inject.ConfigProperty;
import org.eclipse.microprofile.openapi.annotations.OpenAPIDefinition;
import org.eclipse.microprofile.openapi.annotations.info.Info;
import org.eclipse.microprofile.openapi.annotations.media.Content;
import org.eclipse.microprofile.openapi.annotations.media.Schema;
import org.eclipse.microprofile.openapi.annotations.responses.APIResponse;
import org.eclipse.microprofile.openapi.annotations.responses.APIResponses;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.lang.invoke.MethodHandles;
import java.net.URI;
import java.sql.SQLException;
import java.util.concurrent.Callable;
import java.util.concurrent.ExecutionException;
import java.util.concurrent.FutureTask;

@Path("/transfersWithFutureTaskAsync")
@OpenAPIDefinition(info = @Info(title = "Amount Transfer endpoint", version = "1.0"))
public class TransferResourceAsync {

    private static Client withdrawClient = ClientBuilder.newClient();
    private static Client depositClient = ClientBuilder.newClient();

    final static Logger logger = LoggerFactory.getLogger(MethodHandles.lookup().lookupClass());

    @Inject
    TransferFeeService transferFeeService;

    @Inject
    @ConfigProperty(name = "departmentOneEndpoint")
    private String departmentOneEndpoint;

    @Inject
    @ConfigProperty(name = "departmentTwoEndpoint")
    private String departmentTwoEndpoint;

    private ObjectMapper mapper = new ObjectMapper();

    @Inject
    MicroTxXATaskExecutor microTxXATaskExecutor;


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
    public Response transfer(Transfer transferDetails){
        logger.info("Transfer initiated:" + transferDetails);
        Response withdrawResponse = null;
        Response depositResponse = null;
        // Use-case: The transfer service charges 10% as Fee
        transferDetails.setTransferFee(0.1* transferDetails.getAmount());
        transferDetails.setTotalCharged(transferDetails.getAmount() + transferDetails.getTransferFee());
        TrmUserTransaction transaction = new TrmUserTransaction();
        try {
            // Begin a user transaction and also enlist in the transaction by setting enlist = true
            transaction.begin(true);

            FutureTask<Response> withdrawFutureTask = getWithdrawFutureTask(departmentOneEndpoint, transferDetails.getAmount(), transferDetails.getFrom());
            FutureTask<Response> depositFutureTask = getDepositFutureTask(departmentTwoEndpoint, transferDetails.getAmount(), transferDetails.getTo());
            FutureTask<Boolean> depositFeeFutureTask = getDepositFeeFutureTask(transferDetails.getFrom(), transferDetails.getTransferFee());

            microTxXATaskExecutor.submit(withdrawFutureTask);
            microTxXATaskExecutor.submit(depositFutureTask);
            microTxXATaskExecutor.submit(depositFeeFutureTask);

            // Withdraw processing
            withdrawResponse = withdrawFutureTask.get();
            if (withdrawResponse.getStatus() != Response.Status.OK.getStatusCode()) {
                transaction.rollback();
                logger.error("Withdraw failed: "+ transferDetails + "Reason: " + withdrawResponse.getStatusInfo().getReasonPhrase());
                return Response.status(Response.Status.INTERNAL_SERVER_ERROR.getStatusCode()).entity("Withdraw failed").build();
            }

            // Fee processing
            boolean feeDeposited = depositFeeFutureTask.get();
            if (feeDeposited) {
                logger.info("Fee deposited successful" + transferDetails);
            }else{
                transaction.rollback();
                logger.error("Fee deposited failed" + transferDetails);
                return Response.status(Response.Status.INTERNAL_SERVER_ERROR.getStatusCode()).entity("Fee deposit failed").build();
            }

            // Deposit processing
            depositResponse = depositFutureTask.get();
            if (depositResponse.getStatus() != Response.Status.OK.getStatusCode()) {
                transaction.rollback();
                logger.error("Deposit failed: "+ transferDetails + "Reason: " + depositResponse.getStatusInfo().getReasonPhrase());
                return Response.status(Response.Status.INTERNAL_SERVER_ERROR.getStatusCode()).entity("Deposit failed").build();
            }
            // Commit the transaction
            transaction.commit();
            logger.info("Transfer successful:" + transferDetails);
            return Response.ok(transferDetails).build();
        } catch (SystemException e) {
            logger.error("Transfer Fee Deposit failed: "+ transferDetails + "Reason: " + e.getLocalizedMessage());
            return Response.status(Response.Status.INTERNAL_SERVER_ERROR).build();
        } catch(RollbackException | HeuristicMixedException | HeuristicRollbackException e){
            logger.error("Transfer Fee Deposit failed: "+ transferDetails + "Reason: " + e.getLocalizedMessage());
            return Response.status(Response.Status.INTERNAL_SERVER_ERROR.getStatusCode(), "Transfer failed").build();
        } catch (InterruptedException | ExecutionException e) {
            logger.error("Transfer Fee Deposit failed: "+ transferDetails + "Reason: " + e.getLocalizedMessage());
            return Response.status(Response.Status.INTERNAL_SERVER_ERROR.getStatusCode(), "Transfer failed").build();
        } finally {
            if(withdrawResponse != null) withdrawResponse.close();
            if(depositResponse != null) depositResponse.close();
        }
    }

    /**
     * API to get an account details
     * @param accountId - The accountId for which the details should be returned
     * @return - Account Details associated with the accountId
     */
    @APIResponses(value = {
            @APIResponse(responseCode = "200", description = "Account Details",
                    content = @Content(mediaType = MediaType.APPLICATION_JSON, schema = @Schema(ref = "Account"))),
            @APIResponse(responseCode = "404", description = "No account found for the provided account Identity"),
            @APIResponse(responseCode = "500", description = "Internal Server Error")
    })
    @GET
    @Path("{accountId}")
    @Produces(MediaType.APPLICATION_JSON)
    public Response getAccountDetails(@PathParam("accountId") String accountId) {
        try {
            Fee fee = transferFeeService.getFeeDetails(accountId);
            if(fee == null) {
                logger.error("Account not found: {}", accountId);
                return Response.status(Response.Status.NOT_FOUND.getStatusCode()).entity("No account found for the provided account Identity").build();
            }
            return Response.status(Response.Status.OK).entity(mapper.writeValueAsString(fee)).build();
        } catch (JsonProcessingException | SQLException e) {
            logger.error(e.getLocalizedMessage());
            return Response.status(Response.Status.INTERNAL_SERVER_ERROR).build();
        }
    }

    private FutureTask<Boolean> getDepositFeeFutureTask(String from, double transferFee) {
        Callable<Boolean> task = () -> {
            Boolean hasFeeDeposited = false;
            try {
                hasFeeDeposited = transferFeeService.depositFee(from, transferFee);
            } catch (Exception e) {
                logger.error("Updating deposit fee failed: {}", e.getMessage());
            }
            return hasFeeDeposited;
        };
        return new FutureTask<>(task);
    }

    /**
     * Send an HTTP request to the service to withdraw amount from the provided account identity
     * @param serviceEndpoint The service endpoint which is called to withdraw
     * @param amount The amount to be withdrawn
     * @param accountId The account Identity
     * @return HTTP Response from the service
     */
    private FutureTask<Response> getWithdrawFutureTask(String serviceEndpoint, double amount, String accountId) {
        Callable<Response> task = () -> {
            Response response = null;
            try {
                String withDrawEndpoint = UriBuilder.fromUri(new URI(serviceEndpoint))
                        .path("accounts")
                        .path(accountId)
                        .path("withdraw")
                        .queryParam("amount", amount)
                        .toString();

                response = withdrawClient.target(withDrawEndpoint).request().post(Entity.text(""));
                logger.info("Withdraw Response: {}", response.toString());
                logger.info("Withdraw Response Body: {}", response.readEntity(String.class));
            } catch (Exception e) {
                logger.error("Withdraw failed: {}", e.getMessage());
                throw new TransferFailedException("Withdraw failed: " + e.getMessage());
            }
            return response;
        };
        return new FutureTask<>(task);
    }

    /**
     * Send an HTTP request to the service to deposit amount into the provided account identity
     * @param serviceEndpoint The service endpoint which is called to deposit
     * @param amount The amount to be deposited
     * @param accountId The account Identity
     * @return HTTP Response from the service
     */
    private FutureTask<Response> getDepositFutureTask(String serviceEndpoint, double amount, String accountId) {
        Callable<Response> task = () -> {
            Response response = null;
            try {
                String depositEndpoint = UriBuilder.fromUri(new URI(serviceEndpoint))
                        .path("accounts")
                        .path(accountId)
                        .path("/deposit")
                        .queryParam("amount", amount)
                        .toString();

                response = depositClient.target(depositEndpoint).request().post(Entity.text(""));
                logger.info( "Deposit Response: {}", response.toString());
                logger.info( "Deposit Response Body: {}", response.readEntity(String.class));
            } catch (Exception e) {
                logger.error("Deposit failed: {}", e.getMessage());
                throw new TransferFailedException("Deposit failed: " + e.getMessage(), e);
            }
            return response;
        };
        return new FutureTask<>(task);
    }
}
