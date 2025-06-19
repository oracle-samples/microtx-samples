package com.oracle.mtm.sample.resource;

import com.oracle.mtm.sample.AllTrustingClientBuilder;
import com.oracle.mtm.sample.Configuration;
import com.oracle.mtm.sample.entity.Transfer;
import com.oracle.mtm.sample.exception.CustomCheckedException1;
import com.oracle.mtm.sample.exception.CustomUnCheckedException;
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
public class TransferHelpers {

    private static Client withdrawClient = AllTrustingClientBuilder.newClient();
    private static Client depositClient = AllTrustingClientBuilder.newClient();

    @Inject
    @ConfigProperty(name = "departmentOneEndpoint")
    private String departmentOneEndpoint;

    @Inject
    @ConfigProperty(name = "departmentTwoEndpoint")
    private String departmentTwoEndpoint;

    @Inject
    @ConfigProperty(name = "departmentThreeEndpoint")
    private String departmentThreeEndpoint;

    @Inject
    @ConfigProperty(name = "departmentFourEndpoint")
    private String departmentFourEndpoint;

    @Inject
    private Configuration config;

    @Inject
    private DepositHelper depositHelper;

    final static Logger logger = LoggerFactory.getLogger(MethodHandles.lookup().lookupClass());


    @Transactional(Transactional.TxType.REQUIRED)
    public Response withdrawRequiredIC(Transfer transferDetails) {
        return withdraw(transferDetails);
    }

    @Transactional(Transactional.TxType.REQUIRED)
    public Response depositRequiredIC(Transfer transferDetails) {
        return deposit(transferDetails);
    }

    @Transactional(Transactional.TxType.REQUIRES_NEW)
    public Response withdrawRequiresNewIC(Transfer transferDetails) {
        return withdraw(transferDetails);
    }

    @Transactional(Transactional.TxType.REQUIRES_NEW)
    public Response depositRequiresNewIC(Transfer transferDetails) {
        return deposit(transferDetails);
    }

    @Transactional(Transactional.TxType.REQUIRES_NEW)
    public Response withdrawMandatoryOC(Transfer transferDetails) {
        return withdraw(transferDetails);
    }

    @Transactional(Transactional.TxType.MANDATORY)
    public Response depositMandatoryOC(Transfer transferDetails) {
        return deposit(transferDetails);
    }

    @Transactional(Transactional.TxType.REQUIRES_NEW)
    public Response withdrawMandatoryIC(Transfer transferDetails) {
        return withdraw(transferDetails);
    }

    @Transactional(Transactional.TxType.MANDATORY)
    public Response depositMandatoryIC(Transfer transferDetails) {
        return deposit(transferDetails);
    }

    @Transactional(Transactional.TxType.SUPPORTS)
    public Response withdrawSupportsOC(Transfer transferDetails) {
        return withdraw(transferDetails);
    }

    @Transactional(Transactional.TxType.SUPPORTS)
    public Response depositSupportsOC(Transfer transferDetails) {
        return deposit(transferDetails);
    }

    @Transactional(Transactional.TxType.MANDATORY)
    public Response withdrawSupportsIC(Transfer transferDetails) {
        return withdraw(transferDetails);
    }

    @Transactional(Transactional.TxType.SUPPORTS)
    public Response depositSupportsIC(Transfer transferDetails) {
        return deposit(transferDetails);
    }

    @Transactional(Transactional.TxType.REQUIRES_NEW)
    public Response withdrawNotSupportedOC(Transfer transferDetails) {
        return withdraw(transferDetails);
    }

    @Transactional(Transactional.TxType.REQUIRES_NEW)
    public Response depositNotSupportedOC(Transfer transferDetails) {
        return deposit(transferDetails);
    }

    @Transactional(Transactional.TxType.MANDATORY)
    public Response withdrawNotSupportedIC(Transfer transferDetails) {
        return withdraw(transferDetails);
    }

    @Transactional(Transactional.TxType.SUPPORTS)
    public Response depositNotSupportedIC(Transfer transferDetails) {
        return deposit(transferDetails);
    }

    @Transactional(Transactional.TxType.REQUIRES_NEW)
    public Response withdrawNeverOC(Transfer transferDetails) {
        return withdraw(transferDetails);
    }

    @Transactional(Transactional.TxType.REQUIRES_NEW)
    public Response depositNeverOC(Transfer transferDetails) {
        return deposit(transferDetails);
    }

    @Transactional(Transactional.TxType.MANDATORY)
    public Response withdrawNeverIC(Transfer transferDetails) {
        return withdraw(transferDetails);
    }

    @Transactional(Transactional.TxType.MANDATORY)
    public Response depositNeverIC(Transfer transferDetails) {
        return deposit(transferDetails);
    }


    public Response withdraw2(Transfer transferDetails) {
        logger.info("Withdraw initiated:" + transferDetails.toString());
        Response withdrawResponse = null;
        try {
            withdrawResponse = withdraw(departmentThreeEndpoint, transferDetails.getAmount(), transferDetails.getFrom());
            if (withdrawResponse.getStatus() != Response.Status.OK.getStatusCode()) {
                logger.info("Withdraw failed: " + transferDetails.toString() + "Reason: " + withdrawResponse.getStatusInfo().getReasonPhrase());
                return Response.status(Response.Status.INTERNAL_SERVER_ERROR.getStatusCode(), "Withdraw failed").build();
            }
            logger.info("Withdraw successful:" + transferDetails.toString());
            if (false) {
                throw new RuntimeException("custom runtime exception");
            }
            return Response.status(Response.Status.OK.getStatusCode(), "Withdraw completed successfully").build();
        } catch (URISyntaxException e) {
            logger.info(e.getLocalizedMessage());
            return Response.status(Response.Status.INTERNAL_SERVER_ERROR.getStatusCode(), "Withdraw failed").build();
        } finally {
            if (withdrawResponse != null) withdrawResponse.close();
        }
    }


    public Response deposit2(Transfer transferDetails) {
        logger.info("Deposit initiated:" + transferDetails.toString());
        Response depositResponse = null;
        try {
            depositResponse = deposit(departmentFourEndpoint, transferDetails.getAmount(), transferDetails.getTo());
            if (depositResponse.getStatus() != Response.Status.OK.getStatusCode()) {
                logger.info("Deposit failed: " + transferDetails.toString() + "Reason: " + depositResponse.getStatusInfo().getReasonPhrase());
                return Response.status(Response.Status.INTERNAL_SERVER_ERROR.getStatusCode(), "Deposit failed").build();
            }
            logger.info("Deposit successful:" + transferDetails.toString());
            if (false) {
                throw new RuntimeException("custom runtime exception");
            }
            return Response.status(Response.Status.OK.getStatusCode(), "Deposit completed successfully").build();
        } catch (URISyntaxException e) {
            logger.info(e.getLocalizedMessage());
            return Response.status(Response.Status.INTERNAL_SERVER_ERROR.getStatusCode(), "Deposit failed").build();
        } finally {
            if (depositResponse != null) depositResponse.close();
        }
    }

    @Transactional(Transactional.TxType.REQUIRED)
    public Response withdrawNested(Transfer transferDetails) {
        logger.info("Withdraw initiated:" + transferDetails.toString());
        Response withdrawResponse = null;
        try {
            withdrawResponse = withdraw(departmentOneEndpoint, transferDetails.getAmount(), transferDetails.getFrom());
            if (withdrawResponse.getStatus() != Response.Status.OK.getStatusCode()) {
                logger.info("Withdraw failed: " + transferDetails.toString() + "Reason: " + withdrawResponse.getStatusInfo().getReasonPhrase());
                return Response.status(Response.Status.INTERNAL_SERVER_ERROR.getStatusCode(), "Withdraw failed").build();
            }
            logger.info("Withdraw successful:" + transferDetails.toString());

            Response depositResponse = null;
            try {
                depositResponse = depositHelper.depositNested(transferDetails);
            } catch (CustomCheckedException1 e) {
                System.out.println(e.getMessage());
                e.printStackTrace();
            }

            if (withdrawResponse.getStatus() == Response.Status.OK.getStatusCode() && (depositResponse != null && depositResponse.getStatus() == Response.Status.OK.getStatusCode())) {
                return Response.status(Response.Status.OK.getStatusCode(), "Transfer completed successfully").build();
            }
            return Response.status(Response.Status.INTERNAL_SERVER_ERROR.getStatusCode(), "Transfer failed").build();
        } catch (URISyntaxException e) {
            logger.info(e.getLocalizedMessage());
            return Response.status(Response.Status.INTERNAL_SERVER_ERROR.getStatusCode(), "Withdraw failed").build();
        } finally {
            if (withdrawResponse != null) withdrawResponse.close();
        }
    }

    @Transactional(Transactional.TxType.REQUIRED)
    public Response withdrawRequiredNestedIC(Transfer transferDetails) {
        logger.info("Withdraw initiated:" + transferDetails.toString());
        Response withdrawResponse = null;
        try {
            withdrawResponse = withdraw(departmentOneEndpoint, transferDetails.getAmount(), transferDetails.getFrom());
            if (withdrawResponse.getStatus() != Response.Status.OK.getStatusCode()) {
                logger.info("Withdraw failed: " + transferDetails.toString() + "Reason: " + withdrawResponse.getStatusInfo().getReasonPhrase());
                return Response.status(Response.Status.INTERNAL_SERVER_ERROR.getStatusCode(), "Withdraw failed").build();
            }
            logger.info("Withdraw successful:" + transferDetails.toString());

            Response depositResponse = null;
            try {
                depositResponse = depositHelper.depositRequiredNestedIC(transferDetails);
            } catch (CustomCheckedException1 e) {
                System.out.println(e.getMessage());
                e.printStackTrace();
            }

            if (withdrawResponse.getStatus() == Response.Status.OK.getStatusCode() && (depositResponse != null && depositResponse.getStatus() == Response.Status.OK.getStatusCode())) {
                return Response.status(Response.Status.OK.getStatusCode(), "Transfer completed successfully").build();
            }
            return Response.status(Response.Status.INTERNAL_SERVER_ERROR.getStatusCode(), "Transfer failed").build();
        } catch (URISyntaxException e) {
            logger.info(e.getLocalizedMessage());
            return Response.status(Response.Status.INTERNAL_SERVER_ERROR.getStatusCode(), "Withdraw failed").build();
        } finally {
            if (withdrawResponse != null) withdrawResponse.close();
        }
    }

    @Transactional(Transactional.TxType.REQUIRED)
    public Response withdrawMandatoryNestedIC(Transfer transferDetails) {
        logger.info("Withdraw initiated:" + transferDetails.toString());
        Response withdrawResponse = null;
        try {
            withdrawResponse = withdraw(departmentOneEndpoint, transferDetails.getAmount(), transferDetails.getFrom());
            if (withdrawResponse.getStatus() != Response.Status.OK.getStatusCode()) {
                logger.info("Withdraw failed: " + transferDetails.toString() + "Reason: " + withdrawResponse.getStatusInfo().getReasonPhrase());
                return Response.status(Response.Status.INTERNAL_SERVER_ERROR.getStatusCode(), "Withdraw failed").build();
            }
            logger.info("Withdraw successful:" + transferDetails.toString());
            Response depositResponse = depositHelper.depositMandatoryNestedIC(transferDetails);
            if (withdrawResponse.getStatus() == Response.Status.OK.getStatusCode() && (depositResponse != null && depositResponse.getStatus() == Response.Status.OK.getStatusCode())) {
                return Response.status(Response.Status.OK.getStatusCode(), "Transfer completed successfully").build();
            }
            return Response.status(Response.Status.INTERNAL_SERVER_ERROR.getStatusCode(), "Transfer failed").build();
        } catch (URISyntaxException e) {
            logger.info(e.getLocalizedMessage());
            return Response.status(Response.Status.INTERNAL_SERVER_ERROR.getStatusCode(), "Withdraw failed").build();
        } finally {
            if (withdrawResponse != null) withdrawResponse.close();
        }
    }

    @Transactional(Transactional.TxType.REQUIRED)
    public Response withdrawSupportsNestedIC(Transfer transferDetails) {
        logger.info("Withdraw initiated:" + transferDetails.toString());
        Response withdrawResponse = null;
        try {
            withdrawResponse = withdraw(departmentOneEndpoint, transferDetails.getAmount(), transferDetails.getFrom());
            if (withdrawResponse.getStatus() != Response.Status.OK.getStatusCode()) {
                logger.info("Withdraw failed: " + transferDetails.toString() + "Reason: " + withdrawResponse.getStatusInfo().getReasonPhrase());
                return Response.status(Response.Status.INTERNAL_SERVER_ERROR.getStatusCode(), "Withdraw failed").build();
            }
            logger.info("Withdraw successful:" + transferDetails.toString());
            Response depositResponse = depositHelper.depositSupportsNestedIC(transferDetails);
            if (withdrawResponse.getStatus() == Response.Status.OK.getStatusCode() && (depositResponse != null && depositResponse.getStatus() == Response.Status.OK.getStatusCode())) {
                return Response.status(Response.Status.OK.getStatusCode(), "Transfer completed successfully").build();
            }
            return Response.status(Response.Status.INTERNAL_SERVER_ERROR.getStatusCode(), "Transfer failed").build();
        } catch (URISyntaxException e) {
            logger.info(e.getLocalizedMessage());
            return Response.status(Response.Status.INTERNAL_SERVER_ERROR.getStatusCode(), "Withdraw failed").build();
        } finally {
            if (withdrawResponse != null) withdrawResponse.close();
        }
    }


    public Response transferAB(Transfer transferDetails) {
        logger.info("Transfer initiated:" + transferDetails.toString());
        Response withdrawResponse = null;
        Response depositResponse = null;
        try {
            withdrawResponse = withdraw(departmentOneEndpoint, transferDetails.getAmount(), transferDetails.getFrom());
            if (withdrawResponse.getStatus() != Response.Status.OK.getStatusCode()) {
                logger.info("Withdraw failed: " + transferDetails.toString() + "Reason: " + withdrawResponse.getStatusInfo().getReasonPhrase());
                return Response.status(Response.Status.INTERNAL_SERVER_ERROR.getStatusCode(), "Withdraw failed").build();
            }
            depositResponse = deposit(departmentTwoEndpoint, transferDetails.getAmount(), transferDetails.getTo());
            if (depositResponse.getStatus() != Response.Status.OK.getStatusCode()) {
                logger.info("Deposit failed: " + transferDetails.toString() + "Reason: " + depositResponse.getStatusInfo().getReasonPhrase());
                return Response.status(Response.Status.INTERNAL_SERVER_ERROR.getStatusCode(), "Deposit failed").build();
            }
            logger.info("Transfer successful:" + transferDetails.toString());
            return Response.status(Response.Status.OK.getStatusCode(), "Transfer completed successfully").build();
        } catch (URISyntaxException e) {
            logger.info(e.getLocalizedMessage());
            return Response.status(Response.Status.INTERNAL_SERVER_ERROR.getStatusCode(), "Transfer failed").build();
        } finally {
            if (withdrawResponse != null) withdrawResponse.close();
            if (depositResponse != null) depositResponse.close();
        }
    }

    public Response transferCD(Transfer transferDetails) {
        logger.info("Transfer initiated:" + transferDetails.toString());
        Response withdrawResponse = null;
        Response depositResponse = null;
        try {
            withdrawResponse = withdraw(departmentThreeEndpoint, transferDetails.getAmount(), transferDetails.getFrom());
            if (withdrawResponse.getStatus() != Response.Status.OK.getStatusCode()) {
                logger.info("Withdraw failed: " + transferDetails.toString() + "Reason: " + withdrawResponse.getStatusInfo().getReasonPhrase());
                return Response.status(Response.Status.INTERNAL_SERVER_ERROR.getStatusCode(), "Withdraw failed").build();
            }
            depositResponse = deposit(departmentFourEndpoint, transferDetails.getAmount(), transferDetails.getTo());
            if (depositResponse.getStatus() != Response.Status.OK.getStatusCode()) {
                logger.info("Deposit failed: " + transferDetails.toString() + "Reason: " + depositResponse.getStatusInfo().getReasonPhrase());
                return Response.status(Response.Status.INTERNAL_SERVER_ERROR.getStatusCode(), "Deposit failed").build();
            }
            logger.info("Transfer successful:" + transferDetails.toString());
            return Response.status(Response.Status.OK.getStatusCode(), "Transfer completed successfully").build();
        } catch (URISyntaxException e) {
            logger.info(e.getLocalizedMessage());
            return Response.status(Response.Status.INTERNAL_SERVER_ERROR.getStatusCode(), "Transfer failed").build();
        } finally {
            if (withdrawResponse != null) withdrawResponse.close();
            if (depositResponse != null) depositResponse.close();
        }
    }

    public Response withdraw(Transfer transferDetails) {
        logger.info("Withdraw initiated:" + transferDetails.toString());
        Response withdrawResponse = null;
        try {
            withdrawResponse = withdraw(departmentOneEndpoint, transferDetails.getAmount(), transferDetails.getFrom());
            if (withdrawResponse.getStatus() != Response.Status.OK.getStatusCode()) {
                logger.info("Withdraw failed: " + transferDetails.toString() + "Reason: " + withdrawResponse.getStatusInfo().getReasonPhrase());
                return Response.status(Response.Status.INTERNAL_SERVER_ERROR.getStatusCode(), "Withdraw failed").build();
            }
            logger.info("Withdraw successful:" + transferDetails.toString());
            return Response.status(Response.Status.OK.getStatusCode(), "Withdraw completed successfully").build();
        } catch (URISyntaxException e) {
            logger.info(e.getLocalizedMessage());
            return Response.status(Response.Status.INTERNAL_SERVER_ERROR.getStatusCode(), "Withdraw failed").build();
        } finally {
            if (withdrawResponse != null) withdrawResponse.close();
        }
    }


    public Response deposit(Transfer transferDetails) {
        logger.info("Deposit initiated:" + transferDetails.toString());
        Response depositResponse = null;
        try {
            depositResponse = deposit(departmentTwoEndpoint, transferDetails.getAmount(), transferDetails.getTo());
            if (depositResponse.getStatus() != Response.Status.OK.getStatusCode()) {
                logger.info("Deposit failed: " + transferDetails.toString() + "Reason: " + depositResponse.getStatusInfo().getReasonPhrase());
                return Response.status(Response.Status.INTERNAL_SERVER_ERROR.getStatusCode(), "Deposit failed").build();
            }
            logger.info("Deposit successful:" + transferDetails.toString());
            return Response.status(Response.Status.OK.getStatusCode(), "Deposit completed successfully").build();
        } catch (URISyntaxException e) {
            logger.info(e.getLocalizedMessage());
            return Response.status(Response.Status.INTERNAL_SERVER_ERROR.getStatusCode(), "Deposit failed").build();
        } finally {
            if (depositResponse != null) depositResponse.close();
        }
    }

    private Response withdraw(String serviceEndpoint, double amount, String accountId) throws URISyntaxException {
        String withDrawEndpoint = UriBuilder.fromUri(new URI(serviceEndpoint)).path("accounts").path(accountId).path("withdraw").queryParam("amount", amount).toString();
        Response response = withdrawClient.target(withDrawEndpoint).request().post(Entity.text(""));
        logger.info("Withdraw Response: \n" + response.toString());
        logger.info("Withdraw Response Body: \n" + response.readEntity(String.class));
        return response;
    }

    private Response deposit(String serviceEndpoint, double amount, String accountId) throws URISyntaxException {
        String depositEndpoint = UriBuilder.fromUri(new URI(serviceEndpoint)).path("accounts").path(accountId).path("/deposit").queryParam("amount", amount).toString();
        Response response = depositClient.target(depositEndpoint).request().post(Entity.text(""));
        logger.info("Deposit Response: \n" + response.toString());
        logger.info("Deposit Response Body: \n" + response.readEntity(String.class));
        return response;
    }
}
