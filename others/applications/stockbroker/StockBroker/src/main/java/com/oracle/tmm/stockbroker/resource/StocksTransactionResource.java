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
package com.oracle.tmm.stockbroker.resource;


import com.oracle.tmm.stockbroker.domain.UserStockEntry;
import com.oracle.tmm.stockbroker.domain.UserStocks;
import com.oracle.tmm.stockbroker.domain.response.BuyResponse;
import com.oracle.tmm.stockbroker.domain.response.ErrorResponse;
import com.oracle.tmm.stockbroker.domain.response.SellResponse;
import com.oracle.tmm.stockbroker.domain.transaction.BuyStock;
import com.oracle.tmm.stockbroker.domain.transaction.SellStock;
import com.oracle.tmm.stockbroker.service.StockBrokerTransactionService;
import com.oracle.tmm.stockbroker.service.StockService;
import com.oracle.tmm.stockbroker.service.UserStockTransactionService;
import io.swagger.v3.oas.annotations.OpenAPIDefinition;
import io.swagger.v3.oas.annotations.info.Info;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.sql.SQLException;

@RestController
@RequestMapping("/transactions")
@OpenAPIDefinition(info = @Info(title = "Stock transaction endpoint", version = "1.0"))
@Slf4j
public class StocksTransactionResource {

    @Autowired
    StockService stockService;

    @Autowired
    UserStockTransactionService stockTransactionService;

    @Autowired
    StockBrokerTransactionService stockBrokerTransactionService;

    @RequestMapping(value = "buy", method = RequestMethod.POST, produces = {MediaType.APPLICATION_JSON_VALUE}, consumes = {MediaType.APPLICATION_JSON_VALUE})
    public ResponseEntity<?> buyStocks(@RequestBody BuyStock buyStock) {
        BuyResponse buyResponse = new BuyResponse();
        try {
            if (buyStock.getStockUnits() > stockBrokerTransactionService.getStockBrokersStock(buyStock.getStockSymbol()).getStockUnits()) {
                buyResponse.setMessage("User trying to purchase the stock units which exceeds the stock broker's purchase limit.");
                buyResponse.setHttpStatusCode(HttpStatus.INTERNAL_SERVER_ERROR.value());
                log.error("Stock purchase operation failed. {}", buyResponse.getMessage());
                return ResponseEntity.internalServerError()
                        .body(buyResponse);
            }
            buyResponse = stockTransactionService.buy(buyStock);
            if (buyResponse.getHttpStatusCode() == HttpStatus.OK.value()) {
                log.info("Stock purchased successfully.");
                return ResponseEntity.ok()
                        .body(buyResponse);
            }
        } catch (SQLException e) {
            log.error("Stock purchase failed. {}",e.getLocalizedMessage());
            buyResponse.setMessage("Stock purchase failed. "+e.getLocalizedMessage());
            return ResponseEntity.internalServerError()
                    .body(buyResponse);
        }
        return ResponseEntity.internalServerError()
                .body(buyResponse);
    }

    @RequestMapping(value = "sell", method = RequestMethod.POST, produces = {MediaType.APPLICATION_JSON_VALUE})
    public ResponseEntity<?> sellStocks(@RequestBody SellStock sellStock) {
        SellResponse sellResponse = new SellResponse();
        try {
            UserStockEntry userStockEntry = stockTransactionService.enquireStocks(sellStock.getUserAccountId()).getUserStocks().stream()
                    .filter(stockEntry -> stockEntry.getStockSymbol().equals(sellStock.getStockSymbol()))
                    .findFirst().get();
            if (sellStock.getStockUnits() > userStockEntry.getStockUnits()) {
                sellResponse.setMessage("User does not have sufficient stocks to sell.");
                log.error("Stock purchase operation failed. {}", sellResponse.getMessage());
                return ResponseEntity.internalServerError()
                        .body(sellResponse);
            }
            sellResponse = stockTransactionService.sell(sellStock);
            if (sellResponse.getHttpStatusCode() == HttpStatus.OK.value()) {
                log.info("Stock purchased successfully.");
                return ResponseEntity.ok()
                        .body(sellResponse);
            }
        } catch (SQLException e) {
            log.error("Stock purchase failed. {}", e.getLocalizedMessage());
            sellResponse.setMessage("Stock purchase failed. " +e.getLocalizedMessage());
            return ResponseEntity.internalServerError()
                    .body(sellResponse);
        }
        log.error("Stock purchase failed.");
        return ResponseEntity.internalServerError()
                .body(sellResponse);
    }

    @RequestMapping(value = "enquire", method = RequestMethod.GET, produces = {MediaType.APPLICATION_JSON_VALUE})
    public ResponseEntity<?> enquireStocks(@RequestParam("accountId") Integer accountId) {
        UserStocks userStocks = null;
        try {
            userStocks = stockTransactionService.enquireStocks(accountId);
            return ResponseEntity.ok()
                    .body(userStocks);
        } catch (SQLException e) {
            log.error("Stock enquiry failed. {}", e.getLocalizedMessage());
            return ResponseEntity.internalServerError()
                    .body(ErrorResponse.builder().errorMessage(e.getLocalizedMessage()).build());
        }
    }
}
