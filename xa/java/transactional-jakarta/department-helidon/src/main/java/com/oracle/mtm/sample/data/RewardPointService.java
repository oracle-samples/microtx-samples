package com.oracle.mtm.sample.data;

import com.oracle.mtm.sample.entity.RewardPointsDetails;
import jakarta.inject.Inject;
import oracle.tmm.jta.common.TrmSQLConnection;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import javax.enterprise.context.RequestScoped;
import java.lang.invoke.MethodHandles;
import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;

/**
 * @author Bharath.MC
 */
@RequestScoped
public class RewardPointService {

    /**
     * The Database Connection injected by the TMM Library. Use this connection object to execute SQLs (DMLs) within the application code.
     */
    @Inject
    @TrmSQLConnection
    private Connection connection;

    final static Logger logger = LoggerFactory.getLogger(MethodHandles.lookup().lookupClass());

    public RewardPointsDetails rewardPointsDetails(String accountId) throws SQLException {
        RewardPointsDetails rewardPointsDetails = null;
        PreparedStatement statement = null;
        try {
            if (connection == null) {
                logger.error("Connection is null");
                return null;
            }
            String query = "SELECT * FROM RewardPoints where account_id=?";
            statement = connection.prepareStatement(query);
            statement.setString(1, accountId);
            ResultSet dataSet = statement.executeQuery();
            if (dataSet.next()) {
                rewardPointsDetails = new RewardPointsDetails(dataSet.getString("account_id"), dataSet.getInt("reward_points"));
            }
        } catch (SQLException e) {
            logger.error( e.getLocalizedMessage());
            e.printStackTrace();
            throw e;
        }finally {
            if(statement!=null){
                statement.close();
            }
            if(connection != null){
                connection.close();
            }
        }
        return rewardPointsDetails;
    }

    public boolean updateRewardPoints(String accountId, Integer rewardPoints) throws SQLException {
        PreparedStatement statement = null;
        try {
            if (connection == null) {
                logger.error("Connection is null");
                throw new SQLException("Connection is null");
            }
            String query = "UPDATE RewardPoints SET reward_points=reward_points+? where account_id=?";
            statement = connection.prepareStatement(query);
            statement.setInt(1, rewardPoints);
            statement.setString(2, accountId);
            return statement.executeUpdate() > 0;
        } catch (SQLException e) {
            logger.error( e.getLocalizedMessage());
            e.printStackTrace();
            throw e;
        }finally {
            if(statement!=null){
                statement.close();
            }
            if(connection != null){
                connection.close();
            }
        }
    }

}
