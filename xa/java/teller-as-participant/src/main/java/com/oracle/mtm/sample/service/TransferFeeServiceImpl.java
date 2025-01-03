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
package com.oracle.mtm.sample.service;


import com.oracle.mtm.sample.entity.Fee;
import oracle.tmm.jta.common.TrmSQLConnection;

import jakarta.enterprise.context.RequestScoped;
import jakarta.inject.Inject;

import javax.sql.XAConnection;
import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;

@RequestScoped
public class TransferFeeServiceImpl implements TransferFeeService {

    @Inject
    @TrmSQLConnection
    private Connection connection;

    @Override
    public boolean depositFee(String accountId, double amount) throws SQLException {
        String query = "UPDATE fee SET amount=amount+? WHERE account_id=?";
        System.out.println("query "+ query + accountId+ " "+ amount);
        try (PreparedStatement statement = connection.prepareStatement(query);) {
            statement.setDouble(1, amount);
            statement.setString(2, accountId);
            return statement.executeUpdate() > 0;
        }
    }

    @Override
    public Fee getFeeDetails(String accountId) throws SQLException {
        Fee fee = null;
        try {
            if (connection == null) {
                return null;
            }
            String query = "SELECT * FROM fee where account_id=?";
            try (PreparedStatement statement = connection.prepareStatement(query);) {
                statement.setString(1, accountId);
                ResultSet dataSet = statement.executeQuery();
                if (dataSet.next()) {
                    fee = new Fee(dataSet.getString("account_id"), dataSet.getDouble("amount"));
                }
            }
        } catch (SQLException e) {
            throw e;
        }
        return fee;
    }
}

