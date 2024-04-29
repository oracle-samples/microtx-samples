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

package com.oracle.tmm.example.lra;

import oracle.tmm.jta.TrmUserTransaction;
import org.eclipse.microprofile.config.inject.ConfigProperty;
import org.eclipse.microprofile.lra.annotation.AfterLRA;
import org.eclipse.microprofile.lra.annotation.LRAStatus;
import org.eclipse.microprofile.lra.annotation.ws.rs.LRA;

import javax.inject.Inject;
import javax.json.Json;
import javax.json.JsonBuilderFactory;
import javax.transaction.HeuristicMixedException;
import javax.transaction.HeuristicRollbackException;
import javax.transaction.RollbackException;
import javax.transaction.SystemException;
import javax.ws.rs.Consumes;
import javax.ws.rs.HeaderParam;
import javax.ws.rs.POST;
import javax.ws.rs.Path;
import javax.ws.rs.Produces;
import javax.ws.rs.client.Client;
import javax.ws.rs.client.ClientBuilder;
import javax.ws.rs.client.Entity;
import javax.ws.rs.core.MediaType;
import javax.ws.rs.core.Response;
import javax.ws.rs.core.UriBuilder;
import java.net.URI;
import java.net.URISyntaxException;
import java.util.Collections;
import java.util.logging.Level;
import java.util.logging.Logger;

@Path("/paymentService/api")
public class PaymentResource {

    private static final Logger LOG = Logger.getLogger(PaymentResource.class.getName());
    private static final JsonBuilderFactory JSON = Json.createBuilderFactory(Collections.emptyMap());

    private static Client withdrawClient = ClientBuilder.newClient();
    private static Client depositClient = ClientBuilder.newClient();

    @Inject
    @ConfigProperty(name = "customerbank.service.url")
    private String customerBankSvcEndpoint;

    @Inject
    @ConfigProperty(name = "companybank.service.url")
    private String companyBankSvcEndpoint;

    @Inject
    @ConfigProperty(name = "companybank.accountnumber")
    private String companyBankAccNumber;

    @Inject
    private Configuration config;

    @POST
    @Path("/payment")
    @LRA(value = LRA.Type.MANDATORY, end = false)
    @Produces(MediaType.APPLICATION_JSON)
    @Consumes(MediaType.APPLICATION_JSON)
    public Response makePayment(@HeaderParam(LRA.LRA_HTTP_CONTEXT_HEADER) String lraId,
                                PaymentRequest request) {
        LOG.info("Payment initiated from customer account number " + request.accountNumber + " " + lraId);
        config.getLogger().log(Level.INFO, "Transfer initiated:" + request.toString());

        Response withdrawResponse = null;
        Response depositResponse = null;
        TrmUserTransaction transaction = new TrmUserTransaction();

        try {
            transaction.begin();
            withdrawResponse= withdraw(customerBankSvcEndpoint, request.getAmount(), request.getAccountNumber());
            if (withdrawResponse.getStatus() != Response.Status.OK.getStatusCode()) {
                transaction.rollback();
                config.getLogger().log(Level.SEVERE, "Withdraw failed: "+ request.toString() + "Reason: " + withdrawResponse.getStatusInfo().getReasonPhrase());
                return Response.status(Response.Status.INTERNAL_SERVER_ERROR.getStatusCode(), "Withdraw failed").build();
            }
            depositResponse = deposit(companyBankSvcEndpoint, request.getAmount(), companyBankAccNumber);
            if (depositResponse.getStatus() != Response.Status.OK.getStatusCode()) {
                transaction.rollback();
                config.getLogger().log(Level.SEVERE, "Deposit failed: "+ request.toString() + "Reason: " + depositResponse.getStatusInfo().getReasonPhrase());
                return Response.status(Response.Status.INTERNAL_SERVER_ERROR.getStatusCode(), "Deposit failed").build();
            }

            transaction.commit();
            config.getLogger().log(Level.INFO, "Transfer successful:" + request.toString());

            return Response.status(Response.Status.OK.getStatusCode(), "Transfer completed successfully").build();

        } catch (SystemException | URISyntaxException e) {
            config.getLogger().log(Level.SEVERE, e.getLocalizedMessage());
            return Response.status(Response.Status.INTERNAL_SERVER_ERROR).build();

        } catch(RollbackException | HeuristicMixedException | HeuristicRollbackException e){
            config.getLogger().log(Level.SEVERE, e.getLocalizedMessage());
            return Response.status(Response.Status.INTERNAL_SERVER_ERROR.getStatusCode(), "Transfer failed").build();
        } finally {
            if(withdrawResponse != null) {
                withdrawResponse.close();
            }
            if(depositResponse != null) {
                depositResponse.close();
            }
        }
    }

    @AfterLRA
    public void afterLra(URI lraId, LRAStatus lraStatus) {
        LOG.info("LRA finished " + lraId.toASCIIString() + " " + lraStatus.name());
    }

    private Response withdraw(String serviceEndpoint, double amount, String accountId) throws URISyntaxException {
        String withDrawEndpoint = UriBuilder.fromUri(new URI(serviceEndpoint)).path("accounts").path(accountId).path("withdraw").queryParam("amount", amount).toString();
        Response response = withdrawClient.target(withDrawEndpoint).request().post(Entity.text(""));
        config.getLogger().log(Level.INFO, "Withdraw Response: \n" + response.toString());
        return response;
    }

    private Response deposit(String serviceEndpoint, double amount, String accountId) throws URISyntaxException {
        String depositEndpoint = UriBuilder.fromUri(new URI(serviceEndpoint)).path("accounts").path(accountId).path("deposit").queryParam("amount", amount).toString();
        Response response = depositClient.target(depositEndpoint).request().post(Entity.text(""));
        config.getLogger().log(Level.INFO, "Deposit Response: \n" + response.toString());
        return response;
    }
}
