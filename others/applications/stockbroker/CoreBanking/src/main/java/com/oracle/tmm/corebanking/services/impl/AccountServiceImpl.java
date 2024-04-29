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
package com.oracle.tmm.corebanking.services.impl;

import com.oracle.tmm.corebanking.domain.AccountEntry;
import com.oracle.tmm.corebanking.domain.Accounts;
import com.oracle.tmm.corebanking.services.IAccountService;
import oracle.ucp.jdbc.PoolDataSource;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.context.annotation.Lazy;
import org.springframework.stereotype.Service;
import org.springframework.web.context.annotation.RequestScope;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.List;

@Service
@RequestScope
public class AccountServiceImpl implements IAccountService {

    @Autowired
    @Qualifier("microTxSqlConnection")
    @Lazy
    private Connection connection;

    @Autowired
    @Qualifier("PoolDataSource")
    private PoolDataSource poolDataSource;

    @Override
    public boolean createAccount(AccountEntry accountEntry) throws SQLException {
        String query = "INSERT INTO ACCOUNT (ACCOUNT_ID, BRANCH_ID, SSN, FIRST_NAME, LAST_NAME, MID_NAME, PHONE, ADDRESS) " +
                "VALUES (?, ?, ?, ?, ?, ?, ?, ?)";
        try(PreparedStatement statement = connection.prepareStatement(query);) {
            statement.setInt(1, accountEntry.getAccountNumber());
            statement.setInt(2, accountEntry.getBranchId());
            statement.setString(3, accountEntry.getSsn());
            statement.setString(4, accountEntry.getFirstName());
            statement.setString(5, accountEntry.getLastName());
            statement.setString(6, accountEntry.getMiddleName());
            statement.setString(7, accountEntry.getPhoneNumber());
            statement.setString(8, accountEntry.getAddress());
            return statement.executeUpdate() > 0;
        }
    }

    @Override
    public boolean deleteAccount(Integer accountId) throws SQLException {
        String query = "DELETE FROM ACCOUNT " +
                "WHERE ACCOUNT_ID= ?";
        try(PreparedStatement statement = connection.prepareStatement(query);) {
            statement.setInt(1, accountId);
            return statement.executeUpdate() > 0;
        }
    }

    @Override
    public Accounts accountDetails() throws SQLException {
        String query = "SELECT AC.*, BR.BRANCH_NAME BRANCH " +
                "FROM ACCOUNT AC " +
                "INNER JOIN BRANCH BR " +
                "ON AC.BRANCH_ID = BR.BRANCH_ID";
        Accounts accounts = new Accounts();
        List<AccountEntry> accountsList = new ArrayList<>();
        try (Connection connection = poolDataSource.getConnection();
             PreparedStatement statement = connection.prepareStatement(query);) {
            ResultSet dataSet = statement.executeQuery();
            while (dataSet.next()) {
                accountsList.add(new AccountEntry(
                        dataSet.getInt("ACCOUNT_ID"),
                        dataSet.getInt("BRANCH_ID"),
                        dataSet.getString("BRANCH"),
                        dataSet.getString("SSN"),
                        dataSet.getString("FIRST_NAME"),
                        dataSet.getString("LAST_NAME"),
                        dataSet.getString("MID_NAME"),
                        dataSet.getString("PHONE"),
                        dataSet.getString("ADDRESS")
                ));
            }
            accounts.setAccounts(accountsList);
        }
        return accounts;
    }

    @Override
    public AccountEntry accountDetails(Integer accountId) throws SQLException {
        String query = "SELECT AC.*, BR.BRANCH_NAME BRANCH " +
                "FROM ACCOUNT AC " +
                "INNER JOIN BRANCH BR " +
                "ON AC.BRANCH_ID = BR.BRANCH_ID " +
                "WHERE ACCOUNT_ID = ?";
        AccountEntry accountEntry = null;

        try (Connection connection = poolDataSource.getConnection();
             PreparedStatement statement = connection.prepareStatement(query);) {
            statement.setInt(1, accountId);
            ResultSet dataSet = statement.executeQuery();
            if (dataSet.next()) {
                accountEntry = new AccountEntry(
                        dataSet.getInt("ACCOUNT_ID"),
                        dataSet.getInt("BRANCH_ID"),
                        dataSet.getString("BRANCH"),
                        dataSet.getString("SSN"),
                        dataSet.getString("FIRST_NAME"),
                        dataSet.getString("LAST_NAME"),
                        dataSet.getString("MID_NAME"),
                        dataSet.getString("PHONE"),
                        dataSet.getString("ADDRESS")
                );
            }
        }
        return accountEntry;
    }
}
