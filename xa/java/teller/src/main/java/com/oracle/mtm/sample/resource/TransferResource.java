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
import com.oracle.mtm.sample.AllTrustingClientBuilder;
import com.oracle.mtm.sample.Configuration;
import com.oracle.mtm.sample.entity.Account;
import com.oracle.mtm.sample.entity.FailureResponse;
import com.oracle.mtm.sample.entity.Transfer;
import com.oracle.mtm.sample.entity.TransferResponse;
import oracle.tmm.jta.TrmUserTransaction;
import org.eclipse.microprofile.config.inject.ConfigProperty;
import org.eclipse.microprofile.openapi.annotations.OpenAPIDefinition;
import org.eclipse.microprofile.openapi.annotations.info.Info;
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
import jakarta.ws.rs.client.Entity;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import jakarta.ws.rs.core.UriBuilder;
import java.lang.invoke.MethodHandles;
import java.net.URI;
import java.net.URISyntaxException;
import java.sql.SQLException;
import java.util.concurrent.TimeUnit;

@Path("/transfers")
@OpenAPIDefinition(info = @Info(title = "Amount Transfer endpoint", version = "1.0"))
public class TransferResource {

    private static Client withdrawClient = AllTrustingClientBuilder.newClient();
    private static Client depositClient = AllTrustingClientBuilder.newClient();
    private static Client fetchClient = AllTrustingClientBuilder.newClient();

    private ObjectMapper objectMapper = new ObjectMapper();

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
     * API to get initiate a transfer using TMM XA coordinator
     * @param transferDetails transfer entity with transfer details
     * @return HTTP response
     */

    @APIResponses(value = {
            @APIResponse(responseCode = "200", description = "Transfer completed successfully"),
            @APIResponse(responseCode = "400", description = "Invalid request"),
            @APIResponse(responseCode = "500", description = "Withdraw failed"),
            @APIResponse(responseCode = "500", description = "Deposit failed"),
            @APIResponse(responseCode = "500", description = "Transfer failed"),
            @APIResponse(responseCode = "500", description = "Internal Server Error")
    })
    @POST
    @Consumes(MediaType.APPLICATION_JSON)
    public Response transfer(Transfer transferDetails, @QueryParam("demoIntervalSeconds") int demoIntervalSecs){
        if (transferDetails == null) {
            return Response.status(400).entity("missing transfer details").build();
        }
        if(demoIntervalSecs > 50){
            return Response.status(400).entity("demoIntervalSeconds cannot be more than 50").build();
        }
        logger.info("Transfer initiated: {}", transferDetails);
        Response withdrawResponse = null;
        Response depositResponse = null;
        TrmUserTransaction transaction = new TrmUserTransaction();
        try {
            transaction.begin();
            withdrawResponse= withdraw(departmentOneEndpoint, transferDetails.getAmount(), transferDetails.getFrom());
            if (withdrawResponse.getStatus() != Response.Status.OK.getStatusCode()) {
                transaction.rollback();
                logger.error("Withdraw failed: {}. Reason: {}", transferDetails, withdrawResponse.getStatusInfo().getReasonPhrase());
                return Response.status(Response.Status.INTERNAL_SERVER_ERROR.getStatusCode()).entity(new TransferResponse("Withdraw failed")).build();
            }
            depositResponse = deposit(departmentTwoEndpoint, transferDetails.getAmount(), transferDetails.getTo());
            if (depositResponse.getStatus() != Response.Status.OK.getStatusCode()) {
                transaction.rollback();
                logger.error("Deposit failed: {}. Reason: {}", transferDetails, depositResponse.getStatusInfo().getReasonPhrase());
                return Response.status(Response.Status.INTERNAL_SERVER_ERROR.getStatusCode()).entity(new TransferResponse("Deposit failed")).build();
            }
            if (demoIntervalSecs > 0) {
                logger.info("Sleep for {} seconds before commit", demoIntervalSecs);
                TimeUnit.SECONDS.sleep(demoIntervalSecs);
            }
            transaction.commit();
            logger.info("Transfer successful: {}", transferDetails);
            return Response.status(Response.Status.OK.getStatusCode())
                    .entity(new TransferResponse("Transfer completed successfully"))
                    .build();
        } catch (SystemException | URISyntaxException e) {
            logger.error("{}", e.getLocalizedMessage());
            return Response.status(Response.Status.INTERNAL_SERVER_ERROR).entity(new TransferResponse("Transfer failed. "+e.getMessage())).build();
        } catch(RollbackException | HeuristicMixedException | HeuristicRollbackException e){
            logger.error("{}", e.getLocalizedMessage());
            return Response.status(Response.Status.INTERNAL_SERVER_ERROR.getStatusCode()).entity(new TransferResponse("Transfer failed. "+e.getMessage())).build();
        } catch (InterruptedException e) {
            logger.error("Thread interrupted: {}", e.getMessage());
            return Response.status(Response.Status.INTERNAL_SERVER_ERROR).entity(new TransferResponse("Transfer failed. "+e.getMessage())).build();
        } finally {
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
        logger.info("Withdraw Response: {}", response.toString());
        logger.info("Withdraw Response Body: {}", response.readEntity(String.class));
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
        logger.info( "Deposit Response: {}", response.toString());
        logger.info( "Deposit Response Body: {}", response.readEntity(String.class));
        return response;
    }

    /**
     * REST Method to fetchBalance from department/participant services
     * @param department : department1|department2
     * @param accountId : account ID's
     * @return  HTTP Response from the service consumed by front-end
     */
    @GET
    @Path("fetchBalance")
    @Produces(MediaType.APPLICATION_JSON)
    public Response getAccountDetails(@QueryParam("department") String department, @QueryParam("accountId") String accountId) {
        String departmentEndpoint = department.equals("department1") ? departmentOneEndpoint : departmentTwoEndpoint;
        try {
            String depositEndpoint = UriBuilder.fromUri(new URI(departmentEndpoint))
                    .path("accounts")
                    .path(accountId)
                    .toString();
            Response response = fetchClient.target(depositEndpoint).request().get();
            logger.info("Fetch balance from {} returned {}", department, response.toString());
            Account account = response.readEntity(Account.class);
            return Response.status(Response.Status.OK).entity(objectMapper.writeValueAsString(account)).build();
        } catch (Exception e) {
            String errorMessage = "Unable to fetch balance. Reason: " + e.getMessage();
            logger.error(errorMessage);
            Response response = Response.status(Response.Status.INTERNAL_SERVER_ERROR)
                    .entity(new FailureResponse(errorMessage))
                    .build();
            return response;
        }
    }
}
