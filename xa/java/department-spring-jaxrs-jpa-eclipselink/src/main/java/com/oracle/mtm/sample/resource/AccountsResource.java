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

import com.oracle.mtm.sample.data.IAccountService;
import com.oracle.mtm.sample.entity.Account;

import jakarta.ws.rs.*;
import jakarta.ws.rs.core.Response;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;


import org.springframework.stereotype.Component;


import java.sql.SQLException;

@Component
@Path("/accounts")

public class AccountsResource {

    private static final Logger LOG = LoggerFactory.getLogger(AccountsResource.class);

    @Autowired
    IAccountService accountService;


    @GET
    @Path("{accountId}")
    @Produces(jakarta.ws.rs.core.MediaType.APPLICATION_JSON)
    public Response getAccountDetails(@PathParam("accountId") String accountId) {
        try {
            Account account = this.accountService.accountDetails(accountId);
            if(account == null) {
                LOG.error("Account not found: " + accountId);
                return Response.status(Response.Status.NOT_FOUND.getStatusCode()).entity("No account found for the provided account Identity").build();
            }
            return Response.ok(account).build();
        } catch (SQLException e) {
            LOG.error(e.getLocalizedMessage());
            return Response.serverError().entity(e.getLocalizedMessage()).build();
        }
    }


    @POST
    @Path("{accountId}/withdraw")
    public Response withdraw(@PathParam("accountId") String accountId, @QueryParam("amount") double amount) {
        if(amount == 0){
            return Response.status(422).entity("Amount must be greater than zero").build();
        }
        try {
            if (this.accountService.getBalance(accountId) < amount) {
                return Response.status(422).entity("Insufficient balance in the account").build();
            }
            if(this.accountService.withdraw(accountId, amount)) {
                LOG.info(amount + " withdrawn from account: " + accountId);
                return Response.ok("Amount withdrawn from the account").build();
            }
        } catch (SQLException | IllegalArgumentException e) {
            LOG.error(e.getLocalizedMessage());
            return Response.status(Response.Status.INTERNAL_SERVER_ERROR).build();
        }
        return Response.serverError().entity("Withdraw failed").build();
    }


    @POST
    @Path("{accountId}/deposit")
    public Response deposit(@PathParam("accountId") String accountId, @QueryParam("amount") double amount) {
        if(amount == 0){
            return Response.status(422).entity("Amount must be greater than zero").build();
        }
        try {
            if(this.accountService.deposit(accountId, amount)) {
                LOG.info(amount + " deposited to account: " + accountId);
                return Response.ok("Amount deposited to the account").build();
            }
        } catch (SQLException e) {
            LOG.error(e.getLocalizedMessage());
            return Response.serverError().entity(e.getLocalizedMessage()).build();
        }
        return Response.serverError().entity("Deposit failed").build();
    }
}