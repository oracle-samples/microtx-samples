package com.oracle.mtm.sample.helpers;

import com.oracle.mtm.sample.entity.Transfer;
import com.oracle.mtm.sample.service.TransferFeeService;
import jakarta.inject.Inject;
import jakarta.ws.rs.core.Response;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.lang.invoke.MethodHandles;
import java.sql.SQLException;

/**
 * @author Bharath.MC
 */
public class FeeHelpers {

    @Inject
    TransferFeeService transferFeeService;

    final static Logger logger = LoggerFactory.getLogger(MethodHandles.lookup().lookupClass());

    public Response feeDeposit(Transfer transferDetails) {
        try {
            if (transferFeeService.depositFee(transferDetails.getFrom(), transferDetails.getTransferFee())) {
                logger.info("Fee deposited successful. {}", transferDetails);
                return Response.ok().build();
            } else {
                throw new RuntimeException("this is runtime exception");
            }
        } catch (SQLException e) {
            throw new RuntimeException(e);
        }
    }
}
