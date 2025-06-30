package com.oracle.mtm.sample.helpers;

import com.oracle.mtm.sample.AllTrustingClientBuilder;
import com.oracle.mtm.sample.entity.Transfer;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;
import jakarta.ws.rs.client.Client;
import jakarta.ws.rs.client.Entity;
import jakarta.ws.rs.core.Response;
import jakarta.ws.rs.core.UriBuilder;
import org.eclipse.microprofile.config.inject.ConfigProperty;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.lang.invoke.MethodHandles;
import java.net.URI;
import java.net.URISyntaxException;

/**
 * @author Bharath.MC
 */
public class RewardPointsHelpers {

    private static Client rewardPointClient = AllTrustingClientBuilder.newClient();

    @Inject
    @ConfigProperty(name = "departmentOneEndpoint")
    private String departmentOneEndpoint;

    final static Logger logger = LoggerFactory.getLogger(MethodHandles.lookup().lookupClass());

    @Transactional(Transactional.TxType.REQUIRED)
    public Response updateRewardPoint_AnnotatedRequired(Transfer transferDetails) {
        return updateRewardPoint(transferDetails);
    }

    @Transactional(Transactional.TxType.REQUIRES_NEW)
    public Response updateRewardPoint_AnnotatedRequiresNew(Transfer transferDetails) {
        return updateRewardPoint(transferDetails);
    }

    public Response updateRewardPoint(Transfer transferDetails) {
        logger.info("Reward point update initiated:" + transferDetails.toString());
        Response rewardPointUpdateResponse = null;
        try {
            rewardPointUpdateResponse = updateRewardPoint(departmentOneEndpoint, transferDetails.getAmount(), transferDetails.getFrom());
            if (rewardPointUpdateResponse.getStatus() != Response.Status.OK.getStatusCode()) {
                logger.error("Reward point update failed: "+ transferDetails.toString() + "Reason: " + rewardPointUpdateResponse.getStatusInfo().getReasonPhrase());
                return Response.status(Response.Status.INTERNAL_SERVER_ERROR.getStatusCode(), "Reward point update failed").build();
            }
            logger.info("Reward point update successful:" + transferDetails.toString());
            return Response.status(Response.Status.OK.getStatusCode(), "Reward point update completed successfully").build();
        } catch(URISyntaxException e){
            logger.error(e.getLocalizedMessage());
            return Response.status(Response.Status.INTERNAL_SERVER_ERROR.getStatusCode(), "Reward point update failed").build();
        } finally {
            if(rewardPointUpdateResponse != null) rewardPointUpdateResponse.close();
        }
    }

    private Response updateRewardPoint(String serviceEndpoint, double amount, String accountId) throws URISyntaxException {
        int rewardPoints = (int) (amount * 1);
        String rewardPointEndpoint = UriBuilder.fromUri(new URI(serviceEndpoint)).path("rewardPoints").path(accountId).path("/update").queryParam("rewardPoints", rewardPoints).toString();
        Response response = rewardPointClient.target(rewardPointEndpoint).request().post(Entity.text(""));
        logger.info("rewardPoint update Response: \n" + response.toString());
        logger.info("rewardPoint Response Body: \n" + response.readEntity(String.class));
        return response;
    }


}
