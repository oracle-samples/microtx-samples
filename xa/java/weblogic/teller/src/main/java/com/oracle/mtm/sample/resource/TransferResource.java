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

import com.oracle.mtm.sample.AllTrustingClientBuilder;
import com.oracle.mtm.sample.Configuration;
import com.oracle.mtm.sample.entity.Transfer;
import org.eclipse.microprofile.config.inject.ConfigProperty;
import org.eclipse.microprofile.openapi.annotations.OpenAPIDefinition;
import org.eclipse.microprofile.openapi.annotations.info.Info;
import org.eclipse.microprofile.openapi.annotations.responses.APIResponse;
import org.eclipse.microprofile.openapi.annotations.responses.APIResponses;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import javax.inject.Inject;
import javax.transaction.*;
import javax.ws.rs.Consumes;
import javax.ws.rs.POST;
import javax.ws.rs.Path;
import javax.ws.rs.client.Client;
import javax.ws.rs.client.Entity;
import javax.ws.rs.core.HttpHeaders;
import javax.ws.rs.core.MediaType;
import javax.ws.rs.core.Response;
import javax.ws.rs.core.UriBuilder;
import java.lang.invoke.MethodHandles;
import java.net.URI;
import java.net.URISyntaxException;
import java.nio.charset.StandardCharsets;
import java.util.Base64;
import java.util.logging.Level;

@Path("/transfers")
@OpenAPIDefinition(info = @Info(title = "Amount Transfer endpoint", version = "1.0"))
public class TransferResource {

    private static Client withdrawClient = AllTrustingClientBuilder.newClient();
    private static Client depositClient = AllTrustingClientBuilder.newClient();

    final static Logger logger = LoggerFactory.getLogger(MethodHandles.lookup().lookupClass());

    @Inject
    @ConfigProperty(name = "departmentOneEndpoint")
    private String departmentOneEndpoint;

    @Inject
    @ConfigProperty(name = "departmentTwoEndpoint")
    private String departmentTwoEndpoint;

    @Inject
    @ConfigProperty(name = "Weblogic.BasicAuth.UserName")
    private String weblogicBasicAuthUserName;

    @Inject
    @ConfigProperty(name = "Weblogic.BasicAuth.Password")
    private String weblogicBasicAuthPassword;

    @Inject
    private Configuration config;

    /**
     * API to get initiate a transfer using TMM XA coordinator
     * @param transferDetails transfer entity with transfer details
     * @return HTTP response
     */

    @APIResponses(value = {
            @APIResponse(responseCode = "200", description = "Transfer completed successfully"),
            @APIResponse(responseCode = "500", description = "Withdraw failed"),
            @APIResponse(responseCode = "500", description = "Deposit failed"),
            @APIResponse(responseCode = "500", description = "Transfer failed"),
            @APIResponse(responseCode = "500", description = "Internal Server Error")
    })
    @POST
    @Consumes(MediaType.APPLICATION_JSON)
    @Transactional(Transactional.TxType.REQUIRED)
    public Response transfer(Transfer transferDetails){
        logger.info("Transfer initiated:" + transferDetails.toString());
        Response withdrawResponse = null;
        Response depositResponse = null;
        try {
            withdrawResponse= withdraw(departmentOneEndpoint, transferDetails.getAmount(), transferDetails.getFrom());
            if (withdrawResponse.getStatus() != Response.Status.OK.getStatusCode()) {
                logger.error("Withdraw failed: "+ transferDetails.toString() + "Reason: " + withdrawResponse.getStatusInfo().getReasonPhrase());
                throw new RuntimeException("Withdraw failed. " + withdrawResponse.getStatusInfo().getReasonPhrase());
            }
            depositResponse = deposit(departmentTwoEndpoint, transferDetails.getAmount(), transferDetails.getTo());
            if (depositResponse.getStatus() != Response.Status.OK.getStatusCode()) {
                logger.error("Deposit failed: "+ transferDetails.toString() + "Reason: " + depositResponse.getStatusInfo().getReasonPhrase());
                throw new RuntimeException("Deposit failed. " + depositResponse.getStatusInfo().getReasonPhrase());
            }
            logger.info("Transfer successful:" + transferDetails.toString());
            return Response.status(Response.Status.OK.getStatusCode(), "Transfer completed successfully").build();
        } catch (URISyntaxException e) {
            logger.error(e.getLocalizedMessage());
            return Response.status(Response.Status.INTERNAL_SERVER_ERROR).build();
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
        logger.info("Withdraw Response: \n" + response.toString());
        logger.info("Withdraw Response Body: \n" + response.readEntity(String.class));
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
        byte[] basicAuth = (weblogicBasicAuthUserName + ":" + weblogicBasicAuthPassword).getBytes(StandardCharsets.UTF_8);
        Response response = depositClient.target(depositEndpoint)
                .request()
                .header(HttpHeaders.AUTHORIZATION, "Basic " + Base64.getEncoder().encodeToString(basicAuth))
                .post(Entity.text(""));
        logger.info("Deposit Response: \n" + response.toString());
        logger.info("Deposit Response Body: \n" + response.readEntity(String.class));
        return response;
    }
}
