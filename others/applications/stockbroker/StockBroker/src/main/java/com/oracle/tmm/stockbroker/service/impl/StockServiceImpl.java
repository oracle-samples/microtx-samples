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


import com.oracle.tmm.stockbroker.domain.Stocks;
import com.oracle.tmm.stockbroker.domain.StocksEntry;
import com.oracle.tmm.stockbroker.service.StockService;
import oracle.ucp.jdbc.PoolDataSource;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
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
public class StockServiceImpl implements StockService {

    @Autowired
    @Qualifier("PoolDataSource")
    PoolDataSource poolDataSource;

    @Override
    public boolean createStock(StocksEntry stocksEntry) throws SQLException {
        String query = "INSERT INTO STOCKS(STOCK_SYMBOL, COMPANY_NAME, INDUSTRY, STOCK_PRICE)" +
                "VALUES (?, ?, ?)";

        try (Connection connection = poolDataSource.getConnection();
             PreparedStatement statement = connection.prepareStatement(query);) {
            statement.setString(1, stocksEntry.getStockSymbol());
            statement.setString(2, stocksEntry.getCompanyName());
            statement.setString(3, stocksEntry.getIndustry());
            statement.setDouble(4, stocksEntry.getStockPrice());
            return statement.executeUpdate() > 0;
        }
    }

    @Override
    public Stocks getAvailableStocks() throws SQLException {
        String query = "SELECT * FROM STOCKS";
        Stocks stocks = new Stocks();
        List<StocksEntry> stocksEntryList = new ArrayList<>();

        try (Connection connection = poolDataSource.getConnection();
             PreparedStatement statement = connection.prepareStatement(query);) {
            ResultSet dataSet = statement.executeQuery();
            while (dataSet.next()) {
                stocksEntryList.add(new StocksEntry(
                        dataSet.getString("STOCK_SYMBOL"),
                        dataSet.getString("COMPANY_NAME"),
                        dataSet.getString("INDUSTRY"),
                        dataSet.getDouble("STOCK_PRICE")
                ));
            }
            stocks.setStocks(stocksEntryList);
        }
        return stocks;
    }

    @Override
    public StocksEntry getStock(String stockSymbol) throws SQLException {
        String query = "SELECT * FROM STOCKS WHERE STOCK_SYMBOL=?";
        StocksEntry stocksEntry = null;

        try (Connection connection = poolDataSource.getConnection();
             PreparedStatement statement = connection.prepareStatement(query);) {
            statement.setString(1, stockSymbol);
            ResultSet dataSet = statement.executeQuery();
            if (dataSet.next()) {
                stocksEntry = new StocksEntry(
                        dataSet.getString("STOCK_SYMBOL"),
                        dataSet.getString("COMPANY_NAME"),
                        dataSet.getString("INDUSTRY"),
                        dataSet.getDouble("STOCK_PRICE")
                );
            }
        }
        return stocksEntry;
    }

    @Override
    public boolean updateStocks(StocksEntry stocksEntry) throws SQLException {
        String query = "UPDATE STOCKS SET STOCK_PRICE=? " +
                "WHERE STOCK_SYMBOL=?";

        try (Connection connection = poolDataSource.getConnection();
             PreparedStatement statement = connection.prepareStatement(query);) {
            statement.setDouble(1, stocksEntry.getStockPrice());
            statement.setString(2, stocksEntry.getStockSymbol());
            return statement.executeUpdate() > 0;
        }
    }
}
