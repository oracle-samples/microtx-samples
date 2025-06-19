package com.oracle.mtm.sample.resource;

import com.oracle.mtm.sample.AllTrustingClientBuilder;
import com.oracle.mtm.sample.Configuration;
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
import java.util.logging.Level;

/**
 * @author Bharath.MC
 */
public class NotificationHelpers {

    private static Client emailClient = AllTrustingClientBuilder.newClient();

    @Inject
    @ConfigProperty(name = "departmentOneEndpoint")
    private String departmentOneEndpoint;

    final static Logger logger = LoggerFactory.getLogger(MethodHandles.lookup().lookupClass());

    @Transactional(Transactional.TxType.NEVER)
    public Response emailNotification(Transfer transferDetails) {
        logger.info("Email notification initiated:" + transferDetails.toString());
        Response emailResponse = null;
        try {
            emailResponse = emailNotification(departmentOneEndpoint, transferDetails.getAmount(), transferDetails.getFrom());
            if (emailResponse.getStatus() != Response.Status.OK.getStatusCode()) {
                logger.error("Email notification failed: "+ transferDetails.toString() + "Reason: " + emailResponse.getStatusInfo().getReasonPhrase());
                return Response.status(Response.Status.INTERNAL_SERVER_ERROR.getStatusCode(), "Email notification failed").build();
            }
            logger.info("Email notification successful:" + transferDetails.toString());
            return Response.status(Response.Status.OK.getStatusCode(), "Email notification completed successfully").build();
        } catch(URISyntaxException e){
            logger.error(e.getLocalizedMessage());
            return Response.status(Response.Status.INTERNAL_SERVER_ERROR.getStatusCode(), "Email notification failed").build();
        } finally {
            if(emailResponse != null) emailResponse.close();
        }
    }

    @Transactional(Transactional.TxType.NOT_SUPPORTED)
    public Response emailNotifyNotSupportedOC(Transfer transferDetails) {
        return emailNotify(transferDetails);
    }

    @Transactional(Transactional.TxType.NOT_SUPPORTED)
    public Response emailNotifyNotSupportedIC(Transfer transferDetails) {
        return emailNotify(transferDetails);
    }

    @Transactional(Transactional.TxType.NEVER)
    public Response emailNotifyNeverOC(Transfer transferDetails) {
        return emailNotify(transferDetails);
    }

    @Transactional(Transactional.TxType.NEVER)
    public Response emailNotifyNeverIC(Transfer transferDetails) {
        return emailNotify(transferDetails);
    }

    public Response emailNotify(Transfer transferDetails) {
        logger.info("Email notification initiated:" + transferDetails.toString());
        Response emailResponse = null;
        try {
            emailResponse = emailNotification(departmentOneEndpoint, transferDetails.getAmount(), transferDetails.getFrom());
            if (emailResponse.getStatus() != Response.Status.OK.getStatusCode()) {
                logger.error("Email notification failed: "+ transferDetails.toString() + "Reason: " + emailResponse.getStatusInfo().getReasonPhrase());
                return Response.status(Response.Status.INTERNAL_SERVER_ERROR.getStatusCode(), "Email notification failed").build();
            }
            logger.info("Email notification successful:" + transferDetails.toString());
            return Response.status(Response.Status.OK.getStatusCode(), "Email notification completed successfully").build();
        } catch(URISyntaxException e){
            logger.error(e.getLocalizedMessage());
            return Response.status(Response.Status.INTERNAL_SERVER_ERROR.getStatusCode(), "Email notification failed").build();
        } finally {
            if(emailResponse != null) emailResponse.close();
        }
    }

    private Response emailNotification(String serviceEndpoint, double amount, String accountId) throws URISyntaxException {
        String emailEndpoint = UriBuilder.fromUri(new URI(serviceEndpoint)).path("accounts").path(accountId).path("/emailNotify").queryParam("amount", amount).toString();
        Response response = emailClient.target(emailEndpoint).request().post(Entity.text(""));
        logger.info("email Response: \n" + response.toString());
        logger.info("email Response Body: \n" + response.readEntity(String.class));
        return response;
    }

}
