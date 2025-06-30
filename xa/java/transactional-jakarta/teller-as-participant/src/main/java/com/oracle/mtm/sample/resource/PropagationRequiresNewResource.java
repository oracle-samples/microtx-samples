/*

 Oracle Transaction Manager for Microservices
 
 Copyright © 2022, Oracle and/or its affiliates. All rights reserved.

 This software and related documentation are provided under a license agreement containing restrictions on use and disclosure and are protected by intellectual property laws. Except as expressly permitted in your license agreement or allowed by law, you may not use, copy, reproduce, translate, broadcast, modify, license, transmit, distribute, exhibit, perform, publish, or display any part, in any form, or by any means. Reverse engineering, disassembly, or decompilation of this software, unless required by law for interoperability, is prohibited.

 The information contained herein is subject to change without notice and is not warranted to be error-free. If you find any errors, please report them to us in writing.

 If this is software or related documentation that is delivered to the U.S. Government or anyone licensing it on behalf of the U.S. Government, then the following notice is applicable:

 U.S. GOVERNMENT END USERS: Oracle programs, including any operating system, integrated software, any programs installed on the hardware, and/or documentation, delivered to U.S. Government end users are "commercial computer software" pursuant to the applicable Federal Acquisition Regulation and agency-specific supplemental regulations. As such, use, duplication, disclosure, modification, and adaptation of the programs, including any operating system, integrated software, any programs installed on the hardware, and/or documentation, shall be subject to license terms and license restrictions applicable to the programs. No other rights are granted to the U.S. Government.

 This software or hardware is developed for general use in a variety of information management applications. It is not developed or intended for use in any inherently dangerous applications, including applications that may create a risk of personal injury. If you use this software or hardware in dangerous applications, then you shall be responsible to take all appropriate fail-safe, backup, redundancy, and other measures to ensure its safe use. Oracle Corporation and its affiliates disclaim any liability for any damages caused by use of this software or hardware in dangerous applications.
 Oracle and Java are registered trademarks of Oracle and/or its affiliates. Other names may be trademarks of their respective owners.
 Intel and Intel Xeon are trademarks or registered trademarks of Intel Corporation. All SPARC trademarks are used under license and are trademarks or registered trademarks of SPARC International, Inc. AMD, Opteron, the AMD logo, and the AMD Opteron logo are trademarks or registered trademarks of Advanced Micro Devices. UNIX is a registered trademark of The Open Group.

 This software or hardware and documentation may provide access to or information about content, products, and services from third parties. Oracle Corporation and its affiliates are not responsible for and expressly disclaim all warranties of any kind with respect to third-party content, products, and services unless otherwise set forth in an applicable agreement between you and Oracle. Oracle Corporation and its affiliates will not be responsible for any loss, costs, or damages incurred due to your access to or use of third-party content, products, or services, except as set forth in an applicable agreement between you and Oracle.

*/
package com.oracle.mtm.sample.resource;

import com.oracle.mtm.sample.AllTrustingClientBuilder;
import com.oracle.mtm.sample.entity.Transfer;
import com.oracle.mtm.sample.exception.CustomCheckedException1;
import com.oracle.mtm.sample.helpers.FeeHelpers;
import com.oracle.mtm.sample.helpers.NotificationHelpers;
import com.oracle.mtm.sample.helpers.TransferHelpers;
import jakarta.inject.Inject;
import jakarta.transaction.*;
import jakarta.ws.rs.Consumes;
import jakarta.ws.rs.POST;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.QueryParam;
import jakarta.ws.rs.client.Client;
import jakarta.ws.rs.client.Entity;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import jakarta.ws.rs.core.UriBuilder;
import org.eclipse.microprofile.config.inject.ConfigProperty;
import org.eclipse.microprofile.openapi.annotations.OpenAPIDefinition;
import org.eclipse.microprofile.openapi.annotations.info.Info;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.lang.invoke.MethodHandles;
import java.net.URI;
import java.net.URISyntaxException;
import java.sql.SQLException;

@Path("/containermanagedtxn")
@OpenAPIDefinition(info = @Info(title = "Amount Transfer endpoint", version = "1.0"))
public class PropagationRequiresNewResource {

    private static Client withdrawClient = AllTrustingClientBuilder.newClient();
    private static Client depositClient = AllTrustingClientBuilder.newClient();

    @Inject
    @ConfigProperty(name = "departmentOneEndpoint")
    private String departmentOneEndpoint;

    @Inject
    @ConfigProperty(name = "departmentTwoEndpoint")
    private String departmentTwoEndpoint;

    @Inject
    TransferHelpers transferHelpers;

    @Inject
    NotificationHelpers notificationHelpers;

    @Inject
    FeeHelpers feeHelpers;

    final static Logger logger = LoggerFactory.getLogger(MethodHandles.lookup().lookupClass());


    @POST
    @Path("REQUIRES_NEW/outsideContext")
    @Consumes(MediaType.APPLICATION_JSON)
    @Transactional(value = Transactional.TxType.REQUIRES_NEW)
    public Response transferTransactionalRequiresNewOC(Transfer transferDetails, @QueryParam("throwException") boolean throwException) throws CustomCheckedException1, SQLException {
        logger.info( "Transfer initiated:" + transferDetails.toString());
        Response withdrawResponse = null;
        Response depositResponse = null;
        try {
            withdrawResponse = withdraw(departmentOneEndpoint, transferDetails.getAmount(), transferDetails.getFrom());
            if (withdrawResponse.getStatus() != Response.Status.OK.getStatusCode()) {
                logger.error("Withdraw failed: " + transferDetails.toString() + "Reason: " + withdrawResponse.getStatusInfo().getReasonPhrase());
                throw new RuntimeException("Withdraw failed: " + transferDetails.toString() + "Reason: " + withdrawResponse.getStatusInfo().getReasonPhrase());
            }
            depositResponse = deposit(departmentTwoEndpoint, transferDetails.getAmount(), transferDetails.getTo());
            if (depositResponse.getStatus() != Response.Status.OK.getStatusCode()) {
                logger.error("Deposit failed: " + transferDetails.toString() + "Reason: " + depositResponse.getStatusInfo().getReasonPhrase());
                throw new RuntimeException("Deposit failed: " + transferDetails.toString() + "Reason: " + depositResponse.getStatusInfo().getReasonPhrase());
            }
            logger.info( "Transfer successful:" + transferDetails.toString());

            if (throwException) {
                throw new RuntimeException("this is runtime exception");
            }
            return Response.status(Response.Status.OK.getStatusCode(), "Transfer completed successfully").build();
        } catch (URISyntaxException e) {
            logger.error(e.getLocalizedMessage());
            throw new RuntimeException("Transfer failed " + e.getLocalizedMessage());
        } finally {
            if (withdrawResponse != null) withdrawResponse.close();
            if (depositResponse != null) depositResponse.close();
        }
    }

    // This is failing with error : TrmTransactionalInterceptor exception: class java.lang.IllegalStateException : There is already a transaction associated with the thread
    @POST
    @Path("REQUIRES_NEW/insideContext")
    @Consumes(MediaType.APPLICATION_JSON)
    @Transactional(Transactional.TxType.REQUIRED)
    public Response transferTransactionalRequiresNewIC(Transfer transferDetails) {
        Response withdrawResponse = transferHelpers.withdrawRequiresNewIC_AnnotatedRequiresNew(transferDetails);
        Response depositResponse = transferHelpers.depositRequiresNewIC_AnnotatedRequiresNew(transferDetails);
        //Response depositResponse = transferHelpers.depositRequiresNewIC_AnnotatedRequiresNew_Exception(transferDetails);
        Response deposit2Response = transferHelpers.withdraw2(transferDetails);
        //Response deposit2Response = transferHelpers.withdraw_NoAnnotation_Exception(transferDetails);

        if (withdrawResponse.getStatus() == Response.Status.OK.getStatusCode()
                //&& depositResponse.getStatus() == Response.Status.OK.getStatusCode()
            //&& deposit2Response.getStatus() == Response.Status.OK.getStatusCode()
        ) {
            return Response.status(Response.Status.OK.getStatusCode(), "Transfer completed successfully").build();
        }
        throw new RuntimeException("Transfer failed ");
    }

    /**
     * Multiple nesting Scenario
     *
     * @Transactional(REQUIRED) -- Tx1(ACTIVE)
     * transfer() {
     *     withdraw();
     *     deposit();
     * }
     *
     * @Transactional(REQUIRES_NEW) -- Tx1(SUSPEND).Tx2(ACTIVE)
     * withdraw(){
     *    - external participant call
     * }
     *
     * @Transactional(REQUIRES_NEW) -- Tx1(SUSPEND).Tx3(ACTIVE)
     * deposit(){
     *   - external participant call
     *   doSomething();
     * }
     *
     * @Transactional(REQUIRES_NEW) -- Tx1(SUSPEND).Tx3(SUSPEND).Tx4(ACTIVE)
     * doSomething(){
     *    -- external participant call
     * }
     *
     */
    // Fails
    @POST
    @Path("REQUIRES_NEW/nested/insideContext")
    @Consumes(MediaType.APPLICATION_JSON)
    @Transactional(Transactional.TxType.REQUIRED)
    public Response transferTransactionalRequiresNewIC_Nested(Transfer transferDetails) {
        Response withdrawResponse = transferHelpers.withdrawRequiresNewIC_AnnotatedRequiresNew(transferDetails);
        Response depositResponse = transferHelpers.depositRequiresNewIC_Nested_AnnotatedRequiresNew(transferDetails);

        if (withdrawResponse.getStatus() == Response.Status.OK.getStatusCode()
            && depositResponse.getStatus() == Response.Status.OK.getStatusCode()
        ) {
            return Response.status(Response.Status.OK.getStatusCode(), "Transfer completed successfully").build();
        }
        throw new RuntimeException("Transfer failed ");
    }

    /**
     * @Transactional(REQUIRED)
     * transfer() {
     *     withdraw(); // external participant
     *     deposit();  // external participant
     *     feeDeposit(); // internal RM
     * }
     *
     * @Transactional(REQUIRES_NEW)
     * withdraw(){
     *    - creditfees(); // internal RM
     *    - external participant call
     * }
     *
     * @Transactional(REQUIRES_NEW)
     * deposit(){
     *   // external call
     * }
     *
     * feeDeposit(){
     *    // internal call to internal RM
     * }
     *
     */
    @POST
    @Path("REQUIRES_NEW/IAP/insideContext") //IAP = Initiator as partitipant
    @Consumes(MediaType.APPLICATION_JSON)
    @Transactional(Transactional.TxType.REQUIRED)
    public Response transferIAPTransactionalRequiresNewIC(Transfer transferDetails) {
        Response withdrawResponse = transferHelpers.withdrawRequiresNewIC_AnnotatedRequiresNew(transferDetails);
        Response depositResponse = transferHelpers.depositRequiresNewIC_AnnotatedRequiresNew(transferDetails);
        feeHelpers.feeDeposit(transferDetails);

        if ( true
            //&& withdrawResponse.getStatus() == Response.Status.OK.getStatusCode()
            //&& depositResponse.getStatus() == Response.Status.OK.getStatusCode()
            //&& deposit2Response.getStatus() == Response.Status.OK.getStatusCode()
        ) {
            return Response.status(Response.Status.OK.getStatusCode(), "Transfer completed successfully").build();
        }
        throw new RuntimeException("Transfer failed ");
    }


    // scenario 2

    /**
     * @Transactional(REQUIRED)
     * transfer() {
     *     withdraw(); // external participant
     *     deposit();  // external participant
     *     feeDeposit(); // internal RM1
     *     taxDeposit(); // internal RM2
     * }
     *
     * @Transactional(REQUIRES_NEW)
     * withdraw(){
     *    - creditfees(); // internal RM1
     *    - external participant call
     * }
     *
     * @Transactional(REQUIRES_NEW)
     * deposit(){
     *   taxDeposit(); // internal RM2
     *   // external call
     * }
     *
     * feeDeposit(){
     *    // internall call to internal RM1
     * }
     *
     * feeDeposit(){
     *    taxDeposit(); // internal RM2
     * }
     *
     */



    /**
     * Send an HTTP request to the service to withdraw amount from the provided account identity
     *
     * @param serviceEndpoint The service endpoint which is called to withdraw
     * @param amount          The amount to be withdrawn
     * @param accountId       The account Identity
     * @return HTTP Response from the service
     */
    private Response withdraw(String serviceEndpoint, double amount, String accountId) throws URISyntaxException {
        String withDrawEndpoint = UriBuilder.fromUri(new URI(serviceEndpoint)).path("accounts").path(accountId).path("withdraw").queryParam("amount", amount).toString();
        Response response = withdrawClient.target(withDrawEndpoint).request().post(Entity.text(""));
        logger.info( "Withdraw Response: \n" + response.toString());
        logger.info( "Withdraw Response Body: \n" + response.readEntity(String.class));
        return response;
    }

    /**
     * Send an HTTP request to the service to deposit amount into the provided account identity
     *
     * @param serviceEndpoint The service endpoint which is called to deposit
     * @param amount          The amount to be deposited
     * @param accountId       The account Identity
     * @return HTTP Response from the service
     */
    private Response deposit(String serviceEndpoint, double amount, String accountId) throws URISyntaxException {
        String depositEndpoint = UriBuilder.fromUri(new URI(serviceEndpoint)).path("accounts").path(accountId).path("/deposit").queryParam("amount", amount).toString();
        Response response = depositClient.target(depositEndpoint).request().post(Entity.text(""));
        logger.info( "Deposit Response: \n" + response.toString());
        logger.info( "Deposit Response Body: \n" + response.readEntity(String.class));
        return response;
    }
}
