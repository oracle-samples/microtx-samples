package com.oracle.mtm.sample.data;

import com.oracle.mtm.sample.entity.EmailDetails;
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
public class EmailService {

    /**
     * The Database Connection injected by the TMM Library. Use this connection object to execute SQLs (DMLs) within the application code.
     */
    @Inject
    @TrmSQLConnection
    private Connection connection;

    final static Logger logger = LoggerFactory.getLogger(MethodHandles.lookup().lookupClass());

    public EmailDetails emailDetails(String accountId) throws SQLException {
        EmailDetails emailDetails = null;
        PreparedStatement statement = null;
        Connection connection = null;
        try {
            if (connection == null) {
                return null;
            }
            String query = "SELECT * FROM EmailDetails where account_id=?";
            statement = connection.prepareStatement(query);
            statement.setString(1, accountId);
            ResultSet dataSet = statement.executeQuery();
            if (dataSet.next()) {
                emailDetails = new EmailDetails(dataSet.getString("account_id"), dataSet.getString("message"));
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
        return emailDetails;
    }

    public boolean updateEmail(String accountId, String operation, double amount) throws SQLException {
        PreparedStatement statement = null;
        Connection connection = null;
        try {
            if (connection == null) {
                throw new SQLException("Connection is null");
            }
            String message = String.format("amount %s$ %s from account %s at %s", amount, operation,  accountId, new java.util.Date());
            String query = "UPDATE EmailDetails SET message =? where account_id=?";
            statement = connection.prepareStatement(query);
            statement.setString(1, message);
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
