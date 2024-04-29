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
package com.oracle.tmm.stockbroker.service.impl;

import com.oracle.tmm.stockbroker.domain.TransactionHistoryEntry;
import com.oracle.tmm.stockbroker.domain.enums.StockOperation;
import com.oracle.tmm.stockbroker.domain.response.TransactionHistories;
import com.oracle.tmm.stockbroker.service.IHistoryService;
import lombok.extern.slf4j.Slf4j;
import oracle.ucp.jdbc.PoolDataSource;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.stereotype.Component;
import org.springframework.stereotype.Service;
import org.springframework.web.context.annotation.RequestScope;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.List;

@Slf4j
@Service
@RequestScope
public class HistoryServiceImpl implements IHistoryService {

    @Autowired
    @Qualifier("PoolDataSource")
    PoolDataSource poolDataSource;

    @Override
    public boolean logTransaction(TransactionHistoryEntry transactionEntry) throws SQLException {
        String query = "INSERT INTO HISTORY(ACCOUNT_ID, STOCK_OPERATION, STOCK_UNITS, STOCK_SYMBOL, DESCRIPTION)" +
                "VALUES (?, ?, ?, ?, ?)";

        try (Connection connection = poolDataSource.getConnection();
             PreparedStatement statement = connection.prepareStatement(query);) {
            statement.setInt(1, transactionEntry.getAccountId());
            statement.setString(2, transactionEntry.getStockOperation().name());
            statement.setInt(3, transactionEntry.getStockUnits());
            statement.setString(4, transactionEntry.getStockSymbol());
            statement.setString(5, transactionEntry.getDescription());
            return statement.executeUpdate() > 0;
        }
    }

    @Override
    public TransactionHistories getTransactions(Integer accountId) throws SQLException {
        String query = "SELECT * FROM HISTORY WHERE ACCOUNT_ID = ?";
        TransactionHistories transactionHistories = new TransactionHistories();
        List<TransactionHistoryEntry> transactionHistoryList = new ArrayList<>();

        try (Connection connection = poolDataSource.getConnection();
             PreparedStatement statement = connection.prepareStatement(query);) {
            statement.setInt(1, accountId);
            ResultSet dataSet = statement.executeQuery();
            while (dataSet.next()) {
                transactionHistoryList.add(new TransactionHistoryEntry(
                        dataSet.getTimestamp("TRANSACTION_TIME"),
                        dataSet.getInt("ACCOUNT_ID"),
                        StockOperation.valueOf(dataSet.getString("STOCK_OPERATION")),
                        dataSet.getInt("STOCK_UNITS"),
                        dataSet.getString("STOCK_SYMBOL"),
                        dataSet.getString("DESCRIPTION")
                ));
            }
            transactionHistories.setTransactionHistories(transactionHistoryList);
        }
        return transactionHistories;
    }

    @Override
    public TransactionHistories getAllTransactions() throws SQLException {
        String query = "SELECT * FROM HISTORY";
        TransactionHistories transactionHistories = new TransactionHistories();
        List<TransactionHistoryEntry> transactionHistoryList = new ArrayList<>();

        try (Connection connection = poolDataSource.getConnection();
             PreparedStatement statement = connection.prepareStatement(query);) {
            ResultSet dataSet = statement.executeQuery();
            while (dataSet.next()) {
                transactionHistoryList.add(new TransactionHistoryEntry(
                        dataSet.getTimestamp("TRANSACTION_TIME"),
                        dataSet.getInt("ACCOUNT_ID"),
                        StockOperation.valueOf(dataSet.getString("STOCK_OPERATION")),
                        dataSet.getInt("STOCK_UNITS"),
                        dataSet.getString("STOCK_SYMBOL"),
                        dataSet.getString("DESCRIPTION")
                ));
            }
            transactionHistories.setTransactionHistories(transactionHistoryList);
        }
        return transactionHistories;
    }
}
