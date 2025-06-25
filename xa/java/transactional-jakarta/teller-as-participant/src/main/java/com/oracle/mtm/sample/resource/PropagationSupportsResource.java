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
import com.oracle.mtm.sample.helpers.NotificationHelpers;
import com.oracle.mtm.sample.helpers.TransferHelpers;
import jakarta.inject.Inject;
import jakarta.transaction.*;
import jakarta.ws.rs.Consumes;
import jakarta.ws.rs.POST;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.client.Client;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import org.eclipse.microprofile.config.inject.ConfigProperty;
import org.eclipse.microprofile.openapi.annotations.OpenAPIDefinition;
import org.eclipse.microprofile.openapi.annotations.info.Info;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.lang.invoke.MethodHandles;

@Path("/containermanagedtxn")
@OpenAPIDefinition(info = @Info(title = "Amount Transfer endpoint", version = "1.0"))
public class PropagationSupportsResource {

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

    final static Logger logger = LoggerFactory.getLogger(MethodHandles.lookup().lookupClass());

    // failing fix this bug
    // Add flag to rollback to verify supports scenario, in this case txn is not created, rollback won't happen
    @POST
    @Path("SUPPORTS/outsideContext")
    @Consumes(MediaType.APPLICATION_JSON)
    public Response transferTransactionalSupportsOC(Transfer transferDetails) throws SystemException, HeuristicRollbackException, HeuristicMixedException, RollbackException {
        Response withdrawResponse = transferHelpers.withdrawSupportsOC_AnnotatedSupports(transferDetails);
        Response depositResponse = transferHelpers.depositSupportsOC_AnnotatedSupports(transferDetails);
        if (withdrawResponse.getStatus() == Response.Status.OK.getStatusCode() && depositResponse.getStatus() == Response.Status.OK.getStatusCode()) {
            return Response.status(Response.Status.OK.getStatusCode(), "Transfer completed successfully").build();
        }
        throw new RuntimeException("Transfer failed ");
    }

    // failing
    @POST
    @Path("SUPPORTS/nested/insideContext")
    @Consumes(MediaType.APPLICATION_JSON)
    public Response transferTransactionalSupportsTxnIC(Transfer transferDetails) {
        Response withdrawResponse = transferHelpers.withdrawSupportsNestedIC_AnnotatedRequired(transferDetails);
        if (withdrawResponse.getStatus() == Response.Status.OK.getStatusCode()) {
            return Response.status(Response.Status.OK.getStatusCode(), "Transfer completed successfully").build();
        }
        throw new RuntimeException("Transfer failed ");
    }

    // Failing, need to debug

    /**
     * TrmTransactionalInterceptor exception: class jakarta.transaction.SystemException : {"txid":"http://localhost:9000/api/v1/xa-transaction/fa2c45a2-7006-4bac-b5d9-82415a2e15e9","status":"TX_FAIL","error":"transaction in wrong state: Committed"}
     * TrmTransactionalInterceptor detected checked exception not marked for rollback. By default transaction will be committed: class jakarta.transaction.SystemException. Transaction will be marked for commit
     */
    @POST
    @Path("SUPPORTS/insideContext")
    @Consumes(MediaType.APPLICATION_JSON)
    @Transactional(Transactional.TxType.REQUIRED)
    public Response transferTransactionalSupportsTxnIC2(Transfer transferDetails) throws CustomCheckedException1 {
        Response withdrawResponse = transferHelpers.withdrawSupportsIC_AnnotatedMandatory(transferDetails);
        Response depositResponse = transferHelpers.depositSupportsIC_AnnotatedSupports(transferDetails);
        if (withdrawResponse.getStatus() == Response.Status.OK.getStatusCode() && depositResponse.getStatus() == Response.Status.OK.getStatusCode()) {
            return Response.status(Response.Status.OK.getStatusCode(), "Transfer completed successfully").build();
        }
        throw new RuntimeException("Transfer failed ");
    }
}
