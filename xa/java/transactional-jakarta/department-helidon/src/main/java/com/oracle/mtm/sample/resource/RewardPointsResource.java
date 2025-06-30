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
import com.oracle.mtm.sample.data.RewardPointService;
import com.oracle.mtm.sample.entity.RewardPointsDetails;
import jakarta.inject.Inject;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import org.eclipse.microprofile.openapi.annotations.OpenAPIDefinition;
import org.eclipse.microprofile.openapi.annotations.info.Info;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.lang.invoke.MethodHandles;
import java.sql.SQLException;


@Path("/rewardPoints")
@OpenAPIDefinition(info = @Info(title = "Accounts endpoint", version = "1.0"))
public class RewardPointsResource {

    @Inject
    RewardPointService rewardPointService;

    private ObjectMapper mapper = new ObjectMapper();

    final static Logger logger = LoggerFactory.getLogger(MethodHandles.lookup().lookupClass());

    @GET
    @Path("{accountId}")
    @Produces(MediaType.APPLICATION_JSON)
    public Response getRewardPointDetails(@PathParam("accountId") String accountId) {
        try {
            RewardPointsDetails rewardPointsDetails = this.rewardPointService.rewardPointsDetails(accountId);
            if(rewardPointsDetails == null) {
                logger.error("Account not found: {}", accountId);
                return Response.status(Response.Status.NOT_FOUND.getStatusCode()).entity("No account found for the provided account Identity").build();
            }
            return Response.status(Response.Status.OK).entity(mapper.writeValueAsString(rewardPointsDetails)).build();
        } catch (JsonProcessingException | SQLException e) {
            logger.error(e.getLocalizedMessage());
            return Response.status(Response.Status.INTERNAL_SERVER_ERROR).build();
        }
    }

    @POST
    @Path("{accountId}/update")
    public Response updateRewardPoints(@PathParam("accountId") String accountId, @QueryParam("rewardPoints") Integer rewardPoints) {
        try {
            if(this.rewardPointService.updateRewardPoints(accountId, rewardPoints)) {
                logger.info( "Successfully updated reward points {} on account: {}", rewardPoints, accountId);
                return Response.status(Response.Status.OK.getStatusCode()).entity("Successfully updated reward points "+rewardPoints+"on account "+accountId).build();
            }
        } catch (SQLException e) {
            logger.error(e.getLocalizedMessage());
            return Response.status(Response.Status.INTERNAL_SERVER_ERROR).build();
        }catch (IllegalArgumentException e){
            logger.error(e.getLocalizedMessage());
            return Response.status(Response.Status.INTERNAL_SERVER_ERROR.getStatusCode()).entity(e.getLocalizedMessage()).build();
        }
        return Response.status(Response.Status.INTERNAL_SERVER_ERROR.getStatusCode()).entity("Withdraw failed").build();
    }

}