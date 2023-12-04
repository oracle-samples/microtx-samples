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
import com.oracle.mtm.sample.Configuration;
import com.oracle.mtm.sample.data.IAccountsService;
import com.oracle.mtm.sample.entity.Account;
import org.eclipse.microprofile.openapi.annotations.OpenAPIDefinition;
import org.eclipse.microprofile.openapi.annotations.info.Info;
import org.eclipse.microprofile.openapi.annotations.media.Content;
import org.eclipse.microprofile.openapi.annotations.media.Schema;
import org.eclipse.microprofile.openapi.annotations.responses.APIResponse;
import org.eclipse.microprofile.openapi.annotations.responses.APIResponses;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import jakarta.inject.Inject;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import java.lang.invoke.MethodHandles;
import java.sql.SQLException;
import java.util.logging.Level;


@Path("/accounts")
@OpenAPIDefinition(info = @Info(title = "Accounts endpoint", version = "1.0"))
public class AccountsResource {

    @Inject
    IAccountsService accountService;

    @Inject
    Configuration config;

    private ObjectMapper mapper = new ObjectMapper();

    final static Logger logger = LoggerFactory.getLogger(MethodHandles.lookup().lookupClass());

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
            Account account = this.accountService.accountDetails(accountId);
            if(account == null) {
                logger.error("Account not found: " + accountId);
                return Response.status(Response.Status.NOT_FOUND.getStatusCode(), "No account found for the provided account Identity").build();
            }
            return Response.status(Response.Status.OK).entity(mapper.writeValueAsString(account)).build();
        } catch (JsonProcessingException | SQLException e) {
            logger.error(e.getLocalizedMessage());
            return Response.status(Response.Status.INTERNAL_SERVER_ERROR).build();
        }
    }


    /**
     * API to withdraw amount from an account
     * @param accountId - The accountId from which the amount should be withdrawn
     * @param amount - The amount to withdraw
     * @return - API response
     */
    @APIResponses(value = {
            @APIResponse(responseCode = "200", description = "Amount withdrawn from the account"),
            @APIResponse(responseCode = "422", description = "Amount must be greater than zero"),
            @APIResponse(responseCode = "422", description = "Insufficient balance in the account"),
            @APIResponse(responseCode = "500", description = "Internal Server Error")
    })
    @POST
    @Path("{accountId}/withdraw")
    public Response withdraw(@PathParam("accountId") String accountId, @QueryParam("amount") double amount) {
        if(amount == 0){
            return Response.status(422,"Amount must be greater than zero").build();
        }
        try {
            if (this.accountService.getBalance(accountId) < amount) {
                return Response.status(422, "Insufficient balance in the account").build();
            }
            if(this.accountService.withdraw(accountId, amount)) {
                logger.info(amount + " withdrawn from account: " + accountId);
                int creditPointAmount = 1;
                if(this.accountService.increaseCreditPoint(accountId,creditPointAmount))
                {
                    logger.info(creditPointAmount +" Credit Point added to account: " + accountId);
                }
                else {
                    logger.info(creditPointAmount + " Credit Point failed to added for account: " + accountId);
                }

                return Response.status(Response.Status.OK.getStatusCode(),  "Amount withdrawn from the account").build();
            }
        } catch (SQLException e) {
            e.printStackTrace();
            logger.error(e.getLocalizedMessage());
            return Response.status(Response.Status.INTERNAL_SERVER_ERROR).build();
        }catch (IllegalArgumentException e){
            e.printStackTrace();
            logger.error(e.getLocalizedMessage());
            return Response.status(Response.Status.INTERNAL_SERVER_ERROR.getStatusCode(), e.getLocalizedMessage()).build();
        }
        System.out.println("Withdraw failed");
        return Response.status(Response.Status.INTERNAL_SERVER_ERROR.getStatusCode(), "Withdraw failed").build();
    }


    /**
     * API to deposit amount into an account
     * @param accountId - The accountId in which the amount should be deposited
     * @param amount - The amount to deposit
     * @return - API response
     */
    @APIResponses(value = {
            @APIResponse(responseCode = "200", description = "Amount deposited to the account"),
            @APIResponse(responseCode = "422", description = "Amount must be greater than zero"),
            @APIResponse(responseCode = "500", description = "Internal Server Error")
    })
    @POST
    @Path("{accountId}/deposit")
    public Response deposit(@PathParam("accountId") String accountId, @QueryParam("amount") double amount) {
        if(amount == 0){
            return Response.status(422,"Amount must be greater than zero").build();
        }
        try {
            if(this.accountService.deposit(accountId, amount)) {
                logger.info(amount + " deposited to account: " + accountId);
                int creditPointAmount = 1;
                if(this.accountService.increaseCreditPoint(accountId,creditPointAmount))
                {
                    logger.info(creditPointAmount + " Credit Point added to account: " + accountId);
                }
                else {
                    logger.info(creditPointAmount + " Credit Point failed to added for account: " + accountId);
                }

                return Response.status(Response.Status.OK.getStatusCode(), "Amount deposited to the account").build();
            }
        } catch (SQLException e) {
            logger.error(e.getLocalizedMessage());
            return Response.status(Response.Status.INTERNAL_SERVER_ERROR).build();
        }
        return Response.status(Response.Status.INTERNAL_SERVER_ERROR.getStatusCode(), "Deposit failed").build();
    }
}