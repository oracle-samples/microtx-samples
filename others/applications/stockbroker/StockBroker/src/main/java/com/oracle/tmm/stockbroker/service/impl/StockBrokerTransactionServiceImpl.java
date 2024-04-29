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

import com.oracle.tmm.stockbroker.domain.StockBrokerStockEntry;
import com.oracle.tmm.stockbroker.domain.StockBrokerStocks;
import com.oracle.tmm.stockbroker.domain.UserStockEntry;
import com.oracle.tmm.stockbroker.domain.UserStocks;
import com.oracle.tmm.stockbroker.service.StockBrokerTransactionService;
import oracle.ucp.jdbc.PoolDataSource;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.beans.factory.annotation.Value;
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
public class StockBrokerTransactionServiceImpl implements StockBrokerTransactionService {

    @Autowired
    @Qualifier("microTxSqlConnection")
    @Lazy
    private Connection connection;

    @Autowired
    @Qualifier("PoolDataSource")
    PoolDataSource poolDataSource;

    @Value("${stockBrokerCashAccount}")
    Integer stockBrokerCashAccount;

    @Override
    public boolean creditMoneyToStockBroker(Double amount) throws SQLException {
        String query = "UPDATE CASH_ACCOUNT SET BALANCE=BALANCE+? where ACCOUNT_ID=?";
        try(PreparedStatement statement = connection.prepareStatement(query);) {
            statement.setDouble(1, amount);
            statement.setInt(2, stockBrokerCashAccount);
            return statement.executeUpdate() > 0;
        }
    }

    @Override
    public boolean debitMoneyFromStockBroker(Double amount) throws SQLException {
        String query = "UPDATE CASH_ACCOUNT SET BALANCE=BALANCE-? where ACCOUNT_ID=?";
        try(PreparedStatement statement = connection.prepareStatement(query);) {
            statement.setDouble(1, amount);
            statement.setInt(2, stockBrokerCashAccount);
            return statement.executeUpdate() > 0;
        }
    }

    @Override
    public boolean creditStocksToStockBroker(String stockSymbol, Integer stockUnits) throws SQLException {
        String query = "UPDATE STOCK_BROKER_STOCKS SET STOCK_UNITS=STOCK_UNITS+? " +
                "WHERE STOCK_SYMBOL=? AND ACCOUNT_ID=?";
        try(PreparedStatement statement = connection.prepareStatement(query);) {
            statement.setDouble(1, stockUnits);
            statement.setString(2, stockSymbol);
            statement.setInt(3, stockBrokerCashAccount);
            return statement.executeUpdate() > 0;
        }
    }

    @Override
    public boolean debitStocksFromStockBroker(String stockSymbol, Integer stockUnits) throws SQLException {
        String query = "UPDATE STOCK_BROKER_STOCKS SET STOCK_UNITS=STOCK_UNITS-? " +
                "WHERE STOCK_SYMBOL=? AND ACCOUNT_ID=?";
        try(PreparedStatement statement = connection.prepareStatement(query);) {
            statement.setDouble(1, stockUnits);
            statement.setString(2, stockSymbol);
            statement.setInt(3, stockBrokerCashAccount);
            return statement.executeUpdate() > 0;
        }
    }

    @Override
    public boolean creditStocksToUser(Integer userAccountId, String stockSymbol, Integer stockUnits) throws SQLException {
        String query =
                "MERGE INTO USER_STOCKS s " +
                        "    USING DUAL " +
                        "    ON (s.ACCOUNT_ID= ? AND STOCK_SYMBOL=?) " +
                        "WHEN MATCHED THEN " +
                        "    UPDATE SET STOCK_UNITS = STOCK_UNITS+? " +
                        "    WHERE (ACCOUNT_ID=? AND STOCK_SYMBOL=?) " +
                        "WHEN NOT MATCHED THEN " +
                        "    INSERT(ACCOUNT_ID, STOCK_SYMBOL, STOCK_UNITS) " +
                        "    VALUES (?, ?, ?)";
        try(PreparedStatement statement = connection.prepareStatement(query);) {
            statement.setInt(1, userAccountId);
            statement.setString(2, stockSymbol);
            statement.setInt(3, stockUnits);
            statement.setInt(4, userAccountId);
            statement.setString(5, stockSymbol);
            statement.setInt(6, userAccountId);
            statement.setString(7, stockSymbol);
            statement.setInt(8, stockUnits);
            return statement.executeUpdate() > 0;
        }
    }

    @Override
    public boolean debitStocksFromUser(Integer userAccountId, String stockSymbol, Integer stockUnits) throws SQLException {
        String query =
                "MERGE INTO USER_STOCKS s " +
                        "    USING DUAL " +
                        "    ON (s.ACCOUNT_ID= ? AND STOCK_SYMBOL=?) " +
                        "WHEN MATCHED THEN " +
                        "    UPDATE SET STOCK_UNITS = STOCK_UNITS-? " +
                        "    WHERE (ACCOUNT_ID=? AND STOCK_SYMBOL=?) " +
                        "WHEN NOT MATCHED THEN " +
                        "    INSERT(ACCOUNT_ID, STOCK_SYMBOL, STOCK_UNITS) " +
                        "    VALUES (?, ?, ?)";
        try(PreparedStatement statement = connection.prepareStatement(query);) {
            statement.setInt(1, userAccountId);
            statement.setString(2, stockSymbol);
            statement.setInt(3, stockUnits);
            statement.setInt(4, userAccountId);
            statement.setString(5, stockSymbol);
            statement.setInt(6, userAccountId);
            statement.setString(7, stockSymbol);
            statement.setInt(8, stockUnits);
            return statement.executeUpdate() > 0;
        }
    }

    @Override
    public UserStocks getUserStocksSummary(Integer userAccountId) throws SQLException {
        String query = "SELECT US.ACCOUNT_ID, US.STOCK_SYMBOL, STK.COMPANY_NAME , US.STOCK_UNITS , " +
                "       STK.STOCK_PRICE AS CURRENT_STOCK_PRICE, STK.STOCK_PRICE*US.STOCK_UNITS AS TOTAL_STOCK_PRICE " +
                "FROM USER_STOCKS US " +
                "INNER JOIN STOCKS STK " +
                "ON US.STOCK_SYMBOL = STK.STOCK_SYMBOL " +
                "WHERE US.ACCOUNT_ID = ?";
        UserStocks userStocks = new UserStocks();
        List<UserStockEntry> userStockEntries = new ArrayList<>();

        try (Connection connection = poolDataSource.getConnection();
             PreparedStatement statement = connection.prepareStatement(query);) {
            statement.setInt(1, userAccountId);
            ResultSet dataSet = statement.executeQuery();
            while (dataSet.next()) {
                userStockEntries.add(new UserStockEntry(
                        dataSet.getInt("ACCOUNT_ID"),
                        dataSet.getString("STOCK_SYMBOL"),
                        dataSet.getString("COMPANY_NAME"),
                        dataSet.getInt("STOCK_UNITS"),
                        dataSet.getInt("CURRENT_STOCK_PRICE"),
                        dataSet.getInt("TOTAL_STOCK_PRICE")
                ));
            }
            userStocks.setUserStocks(userStockEntries);
        }
        return userStocks;
    }

    @Override
    public StockBrokerStocks getStockBrokersStocksSummary() throws SQLException {
        String query = "SELECT SBS.* , COMPANY_NAME " +
                "FROM STOCK_BROKER_STOCKS SBS " +
                "INNER JOIN STOCKS S " +
                "ON SBS.STOCK_SYMBOL = S.STOCK_SYMBOL";
        StockBrokerStocks stockBrokerStocks = new StockBrokerStocks();
        List<StockBrokerStockEntry> stockBrokerStocksList = new ArrayList<>();

        try (Connection connection = poolDataSource.getConnection();
             PreparedStatement statement = connection.prepareStatement(query);) {
            ResultSet dataSet = statement.executeQuery();
            while (dataSet.next()) {
                stockBrokerStocksList.add(new StockBrokerStockEntry(
                        dataSet.getInt("ACCOUNT_ID"),
                        dataSet.getString("STOCK_SYMBOL"),
                        dataSet.getInt("STOCK_UNITS"),
                        dataSet.getString("COMPANY_NAME")
                ));
            }
            stockBrokerStocks.setStockBrokerStocks(stockBrokerStocksList);
        }
        return stockBrokerStocks;
    }

    @Override
    public StockBrokerStockEntry getStockBrokersStock(String stockSymbol) throws SQLException {
        String query = "SELECT SBS.* , COMPANY_NAME " +
                "FROM STOCK_BROKER_STOCKS SBS " +
                "INNER JOIN STOCKS S " +
                "ON SBS.STOCK_SYMBOL = S.STOCK_SYMBOL " +
                "WHERE S.STOCK_SYMBOL = ?";
        StockBrokerStockEntry stockBrokerStockEntry = null;
        try (Connection connection = poolDataSource.getConnection();
             PreparedStatement statement = connection.prepareStatement(query);) {
            statement.setString(1, stockSymbol);
            ResultSet dataSet = statement.executeQuery();
            if (dataSet.next()) {
                stockBrokerStockEntry = new StockBrokerStockEntry(
                        dataSet.getInt("ACCOUNT_ID"),
                        dataSet.getString("STOCK_SYMBOL"),
                        dataSet.getInt("STOCK_UNITS"),
                        dataSet.getString("COMPANY_NAME")
                );
            }
        }
        return stockBrokerStockEntry;
    }


}
