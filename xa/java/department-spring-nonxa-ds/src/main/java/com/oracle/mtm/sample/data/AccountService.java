/*

Oracle Transaction Manager for Microservices

Copyright (c) 2023, Oracle and/or its affiliates. **

The Universal Permissive License (UPL), Version 1.0 **

Subject to the condition set forth below, permission is hereby granted to any person obtaining a copy of this software, associated documentation and/or data (collectively the "Software"), free of charge and under any and all copyright rights in the Software, and any and all patent rights owned or freely licensable by each licensor hereunder covering either the unmodified Software as contributed to or provided by such licensor, or (ii) the Larger Works (as defined below), to deal in both **
(a) the Software, and (b) any piece of software and/or hardware listed in the lrgrwrks.txt file if one is included with the Software (each a "Larger Work" to which the Software is contributed by such licensors), **
without restriction, including without limitation the rights to copy, create derivative works of, display, perform, and distribute the Software and make, use, sell, offer for sale, import, export, have made, and have sold the Software and the Larger Work(s), and to sublicense the foregoing rights on either these or other terms. **

This license is subject to the following condition: The above copyright notice and either this complete permission notice or at a minimum a reference to the UPL must be included in all copies or substantial portions of the Software. **
THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

*/
package com.oracle.mtm.sample.data;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;

import com.oracle.mtm.sample.resource.AccountsResource;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.context.annotation.Lazy;
import com.oracle.mtm.sample.entity.Account;
import org.springframework.stereotype.Service;
import org.springframework.web.context.annotation.RequestScope;

import javax.sql.DataSource;


/**
 * Service that connects to the accounts database and provides methods to interact with the account
 */

//@Component
@RequestScope
@Service
public class AccountService implements IAccountService {
    private static final Logger LOG = LoggerFactory.getLogger(AccountsResource.class);


    @Autowired
    @Qualifier("microTxNonXASqlConnection")
    @Lazy
    private Connection connection;


    @Autowired
    @Qualifier("ucpDataSource")
    DataSource dataSource;


    /**
     * Get account details persisted in the database
     * @param accountId Account identity
     * @return Returns the account details associated with the account
     * @throws SQLException
     */
    @Override
    public Account accountDetails(String accountId) throws SQLException {
        Account account = null;
        Connection connection = null;
        PreparedStatement statement = null;
        try {
            connection = dataSource.getConnection();
            if (connection == null) {
                return null;
            }
            String query = "SELECT * FROM accounts where account_id=?";
            statement = connection.prepareStatement(query);
            statement.setString(1, accountId);
            ResultSet dataSet = statement.executeQuery();
            if (dataSet.next()) {
                account = new Account(dataSet.getString("account_id"), dataSet.getString("name"), dataSet.getDouble("amount"));
            }
        } catch (SQLException e) {
            LOG.error(e.getLocalizedMessage());
            throw e;
        } finally {
            if(statement!=null){
                statement.close();
            }
            if(connection != null){
                connection.close();
            }
        }
        return account;
    }

    /**
     * Withdraw amount from an account
     * @param accountId Account identity
     * @param amount The amount to be withdrawn from the account
     * @return If the withdrawal was successful
     * @throws SQLException
     */
    @Override
    public boolean withdraw(String accountId, double amount) throws SQLException {
        String query = "UPDATE accounts SET amount=amount-? where account_id=?";
        try(PreparedStatement statement = connection.prepareStatement(query);) {
            statement.setDouble(1, amount);
            statement.setString(2, accountId);
            return statement.executeUpdate() > 0;
        }
    }

    /**
     * Deposit amount to an account
     * @param accountId Account identity
     * @param amount The amount to be deposited into the account
     * @return If the deposit was successful
     * @throws SQLException
     */
    @Override
    public boolean deposit(String accountId, double amount) throws SQLException {
        String query = "UPDATE accounts SET amount=amount+? where account_id=?";
        try(PreparedStatement statement = connection.prepareStatement(query);) {
            statement.setDouble(1, amount);
            statement.setString(2, accountId);
            return statement.executeUpdate() > 0;
        }
    }

    /**
     * Get balance amount from the account
     * @param accountId Account identity
     * @return Returns the balance associated with the account
     * @throws SQLException
     */
    @Override
    public double getBalance(String accountId) throws SQLException {
        String query = "SELECT amount FROM accounts where account_id=?";
        try(PreparedStatement statement = connection.prepareStatement(query);) {
            statement.setString(1, accountId);
            ResultSet dataSet = statement.executeQuery();
            if (dataSet.next()) {
                return Double.parseDouble(dataSet.getString("amount"));
            }
        }
        throw new IllegalArgumentException("Account not found");
    }
}
