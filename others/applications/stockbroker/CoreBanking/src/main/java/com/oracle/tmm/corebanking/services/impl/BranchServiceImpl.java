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

import com.oracle.tmm.corebanking.domain.AccountBranchDetails;
import com.oracle.tmm.corebanking.domain.Branch;
import com.oracle.tmm.corebanking.domain.Branches;
import com.oracle.tmm.corebanking.domain.chart.BranchStats;
import com.oracle.tmm.corebanking.services.IBranchService;
import lombok.extern.slf4j.Slf4j;
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
@Slf4j
public class BranchServiceImpl implements IBranchService {

    @Autowired
    @Qualifier("PoolDataSource")
    private PoolDataSource poolDataSource;

    @Autowired
    @Qualifier("microTxSqlConnection")
    @Lazy
    private Connection connection;


    @Override
    public Branches branchDetails() throws SQLException {
        String query = "SELECT * FROM BRANCH";
        Branches branches = new Branches();
        List<Branch> branchList = new ArrayList<>();

        try (Connection connection = poolDataSource.getConnection();
             PreparedStatement statement = connection.prepareStatement(query);) {
            ResultSet dataSet = statement.executeQuery();
            while (dataSet.next()) {
                branchList.add(new Branch(dataSet.getInt("BRANCH_ID"),
                        dataSet.getString("BRANCH_NAME"),
                        dataSet.getString("PHONE"),
                        dataSet.getString("ADDRESS"),
                        dataSet.getString("SERVICE_URL"),
                        dataSet.getInt("LAST_ACCT")));
            }
            branches.setBranches(branchList);
        }
        return branches;
    }

    @Override
    public Branch branchDetails(Integer branchId) throws SQLException {
        String query = "SELECT * FROM BRANCH WHERE BRANCH_ID=?";
        Branch branch = null;

        try (Connection connection = poolDataSource.getConnection();
             PreparedStatement statement = connection.prepareStatement(query);) {
            statement.setInt(1, branchId);
            ResultSet dataSet = statement.executeQuery();
            if (dataSet.next()) {
                branch = new Branch(dataSet.getInt("BRANCH_ID"),
                        dataSet.getString("BRANCH_NAME"),
                        dataSet.getString("PHONE"),
                        dataSet.getString("ADDRESS"),
                        dataSet.getString("SERVICE_URL"),
                        dataSet.getInt("LAST_ACCT"));
            }
        }
        return branch;
    }

    @Override
    public AccountBranchDetails getBranchDetailsByUserAccount(Integer accountId) throws SQLException {
        String query =
                "SELECT AC.ACCOUNT_ID , AC.BRANCH_ID , BR.SERVICE_URL " +
                        "FROM ACCOUNT AC " +
                        "INNER JOIN BRANCH BR ON AC.BRANCH_ID = BR.BRANCH_ID " +
                        "WHERE AC.ACCOUNT_ID = ?";
        AccountBranchDetails userBranchDetails = null;

        try (Connection connection = poolDataSource.getConnection();
             PreparedStatement statement = connection.prepareStatement(query);) {
            statement.setInt(1, accountId);
            ResultSet dataSet = statement.executeQuery();
            if (dataSet.next()) {
                userBranchDetails = new AccountBranchDetails(
                        dataSet.getInt("ACCOUNT_ID"),
                        dataSet.getInt("BRANCH_ID"),
                        dataSet.getString("SERVICE_URL"));
            }
        }
        return userBranchDetails;
    }

    @Override
    public boolean updateBranchLastAccountNumber(Integer branchId, Integer lastAccountNumber) throws SQLException {
        String query = "UPDATE BRANCH SET LAST_ACCT = ? WHERE BRANCH_ID = ?";
        PreparedStatement statement = connection.prepareStatement(query);
        statement.setInt(1, lastAccountNumber);
        statement.setInt(2, branchId);
        return statement.executeUpdate() > 0;
    }

    @Override
    public List<BranchStats> getBranchStats() throws SQLException {
        String query = "SELECT BR.BRANCH_ID, BR.BRANCH_NAME, TOTAL_ACCOUNTS " +
                "FROM BRANCH BR " +
                "INNER JOIN ( " +
                "SELECT BRANCH_ID, COUNT(*) AS TOTAL_ACCOUNTS " +
                "FROM ACCOUNT " +
                "GROUP BY BRANCH_ID) AC " +
                "ON BR.BRANCH_ID = AC.BRANCH_ID";
        List<BranchStats> branchStats = new ArrayList<>();
        try (Connection connection = poolDataSource.getConnection();
             PreparedStatement statement = connection.prepareStatement(query);) {
            ResultSet dataSet = statement.executeQuery();
            while (dataSet.next()) {
                branchStats.add(BranchStats.builder().id(dataSet.getInt("BRANCH_ID"))
                        .branch(dataSet.getString("BRANCH_NAME"))
                        .totalAccounts(dataSet.getInt("TOTAL_ACCOUNTS"))
                        .build());
            }
        }
        return branchStats;
    }
}
