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

import com.fasterxml.jackson.core.JsonProcessingException;
import com.oracle.microtx.xa.rm.MicroTxUserTransactionService;
import com.oracle.tmm.stockbroker.domain.StocksEntry;
import com.oracle.tmm.stockbroker.domain.UserStocks;
import com.oracle.tmm.stockbroker.domain.response.BuyResponse;
import com.oracle.tmm.stockbroker.domain.response.CreditResponse;
import com.oracle.tmm.stockbroker.domain.response.DebitResponse;
import com.oracle.tmm.stockbroker.domain.response.SellResponse;
import com.oracle.tmm.stockbroker.domain.transaction.BuyStock;
import com.oracle.tmm.stockbroker.domain.transaction.SellStock;
import com.oracle.tmm.stockbroker.service.StockBrokerTransactionService;
import com.oracle.tmm.stockbroker.service.StockService;
import com.oracle.tmm.stockbroker.service.UserStockTransactionService;
import com.oracle.tmm.stockbroker.utils.BankUtility;
import com.oracle.tmm.stockbroker.utils.TransactionEventsUtility;
import jakarta.transaction.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;

import java.net.URISyntaxException;
import java.sql.SQLException;

@Component
public class UserStockTransactionServiceImpl implements UserStockTransactionService {

    @Autowired
    StockService stockService;

    @Autowired
    StockBrokerTransactionService stockBrokerTransactionService;

    @Autowired
    TransactionEventsUtility transactionEventsUtility;

    @Autowired
    BankUtility bankUtility;

    @Value("${coreBankEndpoint}")
    String coreBankEndpoint;

    @Autowired
    MicroTxUserTransactionService microTxUserTransaction;

    /**
     * Purchase Stock Transaction using MicroTx
     */
    @Override
    public BuyResponse buy(BuyStock buyStock) {
        BuyResponse buyResponse = new BuyResponse();
        try {
            microTxUserTransaction.begin(true);
            transactionEventsUtility.registerStockTransactionEvents(buyStock);
            buyResponse.setTransactionId(microTxUserTransaction.getTransactionID());
            StocksEntry stocksEntry = stockService.getStock(buyStock.getStockSymbol());
            Double totalStockPrice = buyStock.getStockUnits() * stocksEntry.getStockPrice();
            DebitResponse debitResponse = bankUtility.debit(coreBankEndpoint, buyStock.getUserAccountId(), totalStockPrice);
            if (debitResponse.getHttpStatusCode() != HttpStatus.OK.value()) {
                buyResponse.setHttpStatusCode(HttpStatus.INTERNAL_SERVER_ERROR.value());
                buyResponse.setMessage("Buy operation failed as debit money from user account failed. " + debitResponse.getMessage());
                microTxUserTransaction.rollback();
                return buyResponse;
            }

            if (!stockBrokerTransactionService.creditMoneyToStockBroker(totalStockPrice)) {
                buyResponse.setHttpStatusCode(HttpStatus.INTERNAL_SERVER_ERROR.value());
                buyResponse.setMessage("Buy operation failed as credit money to stockbroker failed. " + debitResponse.getMessage());
                microTxUserTransaction.rollback();
                return buyResponse;
            }

            if (!stockBrokerTransactionService.debitStocksFromStockBroker(buyStock.getStockSymbol(), buyStock.getStockUnits())) {
                buyResponse.setHttpStatusCode(HttpStatus.INTERNAL_SERVER_ERROR.value());
                buyResponse.setMessage("Buy operation failed as transfer(debit) stock from stockbroker failed. " + debitResponse.getMessage());
                microTxUserTransaction.rollback();
                return buyResponse;
            }

            if (!stockBrokerTransactionService.creditStocksToUser(buyStock.getUserAccountId(), buyStock.getStockSymbol(), buyStock.getStockUnits())) {
                buyResponse.setHttpStatusCode(HttpStatus.INTERNAL_SERVER_ERROR.value());
                buyResponse.setMessage("Buy operation failed as transfer(credit) stock to user stock account failed. " + debitResponse.getMessage());
                microTxUserTransaction.rollback();
                return buyResponse;
            }

            microTxUserTransaction.commit();
            buyResponse.setHttpStatusCode(HttpStatus.OK.value());
            buyResponse.setMessage(String.format("User %s successfully purchased %s Stock of quantity %s stock units. ", buyStock.getUserAccountId(), stocksEntry.getStockSymbol(), buyStock.getStockUnits()));
            return buyResponse;
        } catch (RollbackException | HeuristicMixedException | HeuristicRollbackException | NotSupportedException e) {
            buyResponse.setHttpStatusCode(HttpStatus.INTERNAL_SERVER_ERROR.value());
            buyResponse.setMessage("Buy stock operation failed." + e.getLocalizedMessage());
            return buyResponse;
        } catch (SystemException | URISyntaxException | SQLException | JsonProcessingException e) {
            buyResponse.setHttpStatusCode(HttpStatus.INTERNAL_SERVER_ERROR.value());
            buyResponse.setMessage("Buy stock operation failed." + e.getLocalizedMessage());
            return buyResponse;
        }
    }

    /**
     * Sell Stock Transaction using MicroTx
     */
    @Override
    public SellResponse sell(SellStock sellStock) {
        SellResponse sellResponse = new SellResponse();
        try {
            microTxUserTransaction.begin(true);
            transactionEventsUtility.registerStockTransactionEvents(sellStock);
            sellResponse.setTransactionId(microTxUserTransaction.getTransactionID());
            StocksEntry stocksEntry = stockService.getStock(sellStock.getStockSymbol());
            Double totalStockPrice = sellStock.getStockUnits() * stocksEntry.getStockPrice();
            CreditResponse creditResponse = bankUtility.credit(coreBankEndpoint, sellStock.getUserAccountId(), totalStockPrice);
            if (creditResponse.getHttpStatusCode() != HttpStatus.OK.value()) {
                sellResponse.setHttpStatusCode(HttpStatus.INTERNAL_SERVER_ERROR.value());
                sellResponse.setMessage("Sell operation failed as credit money to user account failed." + creditResponse.getMessage());
                microTxUserTransaction.rollback();
                return sellResponse;
            }

            if (!stockBrokerTransactionService.debitMoneyFromStockBroker(totalStockPrice)) {
                sellResponse.setHttpStatusCode(HttpStatus.INTERNAL_SERVER_ERROR.value());
                sellResponse.setMessage("Sell operation failed as debit money from stockbroker failed." + creditResponse.getMessage());
                microTxUserTransaction.rollback();
                return sellResponse;
            }

            if (!stockBrokerTransactionService.creditStocksToStockBroker(sellStock.getStockSymbol(), sellStock.getStockUnits())) {
                sellResponse.setHttpStatusCode(HttpStatus.INTERNAL_SERVER_ERROR.value());
                sellResponse.setMessage("Sell operation failed as transfer(credit) stock to stockbroker failed." + creditResponse.getMessage());
                microTxUserTransaction.rollback();
                return sellResponse;
            }

            if (!stockBrokerTransactionService.debitStocksFromUser(sellStock.getUserAccountId(), sellStock.getStockSymbol(), sellStock.getStockUnits())) {
                sellResponse.setHttpStatusCode(HttpStatus.INTERNAL_SERVER_ERROR.value());
                sellResponse.setMessage("Sell operation failed as transfer(debit) stock from user stock account failed." + creditResponse.getMessage());
                microTxUserTransaction.rollback();
                return sellResponse;
            }
            microTxUserTransaction.commit();
            sellResponse.setHttpStatusCode(HttpStatus.OK.value());
            sellResponse.setMessage(String.format("User %s successfully sold %s Stock of quantity %s stock units.", sellStock.getUserAccountId(), stocksEntry.getStockSymbol(), sellStock.getStockUnits()));
            return sellResponse;
        } catch (RollbackException | HeuristicMixedException | HeuristicRollbackException | NotSupportedException e) {
            sellResponse.setHttpStatusCode(HttpStatus.INTERNAL_SERVER_ERROR.value());
            sellResponse.setMessage("Sell operation failed." + e.getLocalizedMessage());
            return sellResponse;
        } catch (SystemException | URISyntaxException | SQLException | JsonProcessingException e) {
            sellResponse.setHttpStatusCode(HttpStatus.INTERNAL_SERVER_ERROR.value());
            sellResponse.setMessage("Sell operation failed." + e.getLocalizedMessage());
            return sellResponse;
        }
    }

    @Override
    public UserStocks enquireStocks(Integer userAccountId) throws SQLException {
        return stockBrokerTransactionService.getUserStocksSummary(userAccountId);
    }
}
