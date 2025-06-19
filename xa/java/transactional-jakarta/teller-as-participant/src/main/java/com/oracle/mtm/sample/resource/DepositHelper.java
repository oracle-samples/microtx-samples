package com.oracle.mtm.sample.resource;

import com.oracle.mtm.sample.AllTrustingClientBuilder;
import com.oracle.mtm.sample.entity.Transfer;
import com.oracle.mtm.sample.exception.CustomCheckedException1;
import org.eclipse.microprofile.config.inject.ConfigProperty;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import jakarta.inject.Inject;
import jakarta.transaction.Transactional;
import jakarta.ws.rs.client.Client;
import jakarta.ws.rs.client.Entity;
import jakarta.ws.rs.core.Response;
import jakarta.ws.rs.core.UriBuilder;
import java.lang.invoke.MethodHandles;
import java.net.URI;
import java.net.URISyntaxException;

/**
 * @author Bharath.MC
 */
public class DepositHelper {

    private static Client withdrawClient = AllTrustingClientBuilder.newClient();
    private static Client depositClient = AllTrustingClientBuilder.newClient();

    @Inject
    @ConfigProperty(name = "departmentOneEndpoint")
    private String departmentOneEndpoint;

    @Inject
    @ConfigProperty(name = "departmentTwoEndpoint")
    private String departmentTwoEndpoint;

    final static Logger logger = LoggerFactory.getLogger(MethodHandles.lookup().lookupClass());

    @Transactional(Transactional.TxType.REQUIRED)
    public Response depositNested(Transfer transferDetails) throws CustomCheckedException1 {
        logger.error("Deposit initiated:" + transferDetails.toString());
        Response depositResponse = null;
        try {
            depositResponse = deposit(departmentTwoEndpoint, transferDetails.getAmount(), transferDetails.getTo());
            if (depositResponse.getStatus() != Response.Status.OK.getStatusCode()) {
                logger.error("Deposit failed: "+ transferDetails.toString() + "Reason: " + depositResponse.getStatusInfo().getReasonPhrase());
                return Response.status(Response.Status.INTERNAL_SERVER_ERROR.getStatusCode(), "Deposit failed").build();
            }
            logger.error("Deposit successful:" + transferDetails.toString());
            if(false){
                throw new CustomCheckedException1("runtime exception");
            }
            return Response.status(Response.Status.OK.getStatusCode(), "Deposit completed successfully").build();
        } catch(URISyntaxException e){
            logger.error(e.getLocalizedMessage());
            return Response.status(Response.Status.INTERNAL_SERVER_ERROR.getStatusCode(), "Deposit failed").build();
        } finally {
            if(depositResponse != null) depositResponse.close();
        }
    }

    @Transactional(Transactional.TxType.REQUIRED)
    public Response depositRequiredNestedIC(Transfer transferDetails) throws CustomCheckedException1 {
        logger.error("Deposit initiated:" + transferDetails.toString());
        Response depositResponse = null;
        try {
            depositResponse = deposit(departmentTwoEndpoint, transferDetails.getAmount(), transferDetails.getTo());
            if (depositResponse.getStatus() != Response.Status.OK.getStatusCode()) {
                logger.error("Deposit failed: "+ transferDetails.toString() + "Reason: " + depositResponse.getStatusInfo().getReasonPhrase());
                return Response.status(Response.Status.INTERNAL_SERVER_ERROR.getStatusCode(), "Deposit failed").build();
            }
            logger.error("Deposit successful:" + transferDetails.toString());
            if(false){
                throw new CustomCheckedException1("runtime exception");
            }
            return Response.status(Response.Status.OK.getStatusCode(), "Deposit completed successfully").build();
        } catch(URISyntaxException e){
            logger.error(e.getLocalizedMessage());
            return Response.status(Response.Status.INTERNAL_SERVER_ERROR.getStatusCode(), "Deposit failed").build();
        } finally {
            if(depositResponse != null) depositResponse.close();
        }
    }

    @Transactional(Transactional.TxType.MANDATORY)
    public Response depositMandatoryNestedIC(Transfer transferDetails) {
        logger.error("Deposit initiated:" + transferDetails.toString());
        Response depositResponse = null;
        try {
            depositResponse = deposit(departmentTwoEndpoint, transferDetails.getAmount(), transferDetails.getTo());
            if (depositResponse.getStatus() != Response.Status.OK.getStatusCode()) {
                logger.error("Deposit failed: "+ transferDetails.toString() + "Reason: " + depositResponse.getStatusInfo().getReasonPhrase());
                return Response.status(Response.Status.INTERNAL_SERVER_ERROR.getStatusCode(), "Deposit failed").build();
            }
            logger.error("Deposit successful:" + transferDetails.toString());
            return Response.status(Response.Status.OK.getStatusCode(), "Deposit completed successfully").build();
        } catch(URISyntaxException e){
            logger.error(e.getLocalizedMessage());
            return Response.status(Response.Status.INTERNAL_SERVER_ERROR.getStatusCode(), "Deposit failed").build();
        } finally {
            if(depositResponse != null) depositResponse.close();
        }
    }

    @Transactional(Transactional.TxType.SUPPORTS)
    public Response depositSupportsNestedIC(Transfer transferDetails) {
        logger.error("Deposit initiated:" + transferDetails.toString());
        Response depositResponse = null;
        try {
            depositResponse = deposit(departmentTwoEndpoint, transferDetails.getAmount(), transferDetails.getTo());
            if (depositResponse.getStatus() != Response.Status.OK.getStatusCode()) {
                logger.error("Deposit failed: "+ transferDetails.toString() + "Reason: " + depositResponse.getStatusInfo().getReasonPhrase());
                return Response.status(Response.Status.INTERNAL_SERVER_ERROR.getStatusCode(), "Deposit failed").build();
            }
            logger.error("Deposit successful:" + transferDetails.toString());
            return Response.status(Response.Status.OK.getStatusCode(), "Deposit completed successfully").build();
        } catch(URISyntaxException e){
            logger.error(e.getLocalizedMessage());
            return Response.status(Response.Status.INTERNAL_SERVER_ERROR.getStatusCode(), "Deposit failed").build();
        } finally {
            if(depositResponse != null) depositResponse.close();
        }
    }

    private Response deposit(String serviceEndpoint, double amount, String accountId) throws URISyntaxException {
        String depositEndpoint = UriBuilder.fromUri(new URI(serviceEndpoint)).path("accounts").path(accountId).path("/deposit").queryParam("amount", amount).toString();
        Response response = depositClient.target(depositEndpoint).request().post(Entity.text(""));
        logger.error("Deposit Response: \n" + response.toString());
        logger.error("Deposit Response Body: \n" + response.readEntity(String.class));
        return response;
    }
}
