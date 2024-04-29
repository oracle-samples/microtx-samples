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


import com.oracle.tmm.stockbroker.domain.Stocks;
import com.oracle.tmm.stockbroker.domain.StocksEntry;
import com.oracle.tmm.stockbroker.domain.response.ErrorResponse;
import com.oracle.tmm.stockbroker.service.StockService;
import io.swagger.v3.oas.annotations.OpenAPIDefinition;
import io.swagger.v3.oas.annotations.info.Info;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.scheduling.annotation.Async;
import org.springframework.web.bind.annotation.*;

import java.sql.SQLException;
import java.util.Objects;
import java.util.Random;
import java.util.concurrent.TimeUnit;

@RestController
@RequestMapping("/stocks")
@OpenAPIDefinition(info = @Info(title = "Stocks endpoint", version = "1.0"))
@Slf4j
public class StocksResource {

    @Autowired
    StockService stockService;

    @RequestMapping(value = "", method = RequestMethod.GET, produces = {MediaType.APPLICATION_JSON_VALUE})
    public ResponseEntity<?> getStocks(@RequestParam(value = "stockSymbol", required = false) String stockSymbol) {
        Stocks stocks = null;
        try {
            if (Objects.nonNull(stockSymbol)) {
                StocksEntry stocksEntry = stockService.getStock(stockSymbol);
                if (Objects.isNull(stocksEntry)) {
                    return ResponseEntity.internalServerError()
                            .body(ErrorResponse.builder()
                                    .errorMessage(String.format("Stock Id %s not found.", stockSymbol))
                                    .build());
                }

                return ResponseEntity.ok()
                        .body(stocksEntry);
            }
            stocks = stockService.getAvailableStocks();
            return ResponseEntity.ok().body(stocks);
        } catch (SQLException e) {
            return ResponseEntity.internalServerError()
                    .body(ErrorResponse.builder()
                            .errorMessage("Retrieving Available stocks failed. "+e.getMessage())
                            .build());
        }
    }

    @RequestMapping(value = "create", method = RequestMethod.POST, produces = {MediaType.APPLICATION_JSON_VALUE}, consumes = {MediaType.APPLICATION_JSON_VALUE})
    public ResponseEntity<?> createStock(@RequestBody StocksEntry stocksEntry) throws Exception {
        if (stockService.createStock(stocksEntry)) {
            log.info("Stock Created successfully.");
            return ResponseEntity.ok().build();
        }
        return ResponseEntity.internalServerError()
                .body(ErrorResponse.builder()
                        .errorMessage("Stock creation failed.")
                        .build());
    }

    @RequestMapping(value = "update", method = RequestMethod.POST, produces = {MediaType.APPLICATION_JSON_VALUE})
    public ResponseEntity<?> updateStock(@RequestBody StocksEntry stocksEntry) throws Exception {
        if (stockService.updateStocks(stocksEntry)) {
            log.info("Stock Updated successfully.");
            return ResponseEntity.ok().build();
        }
        return ResponseEntity.internalServerError()
                .body(ErrorResponse.builder()
                        .errorMessage("Stock Updation failed.")
                        .build());
    }

    @Async("threadPoolTaskExecutor")
    @RequestMapping(value = "updateStocksDaemon", method = RequestMethod.POST)
    public void updateStocksDaemon() throws InterruptedException {
        Random random = new Random();
        for (; ; ) {
            try {
                Stocks stocks = stockService.getAvailableStocks();
                StocksEntry stocksEntry = stocks.getStocks().get(random.nextInt(stocks.getStocks().size() - 1));
                stocksEntry.setStockPrice(Math.abs(random.nextInt() % 2 == 0 ? stocksEntry.getStockPrice() + random.nextInt(1000) : stocksEntry.getStockPrice() - random.nextInt(50)));
                stockService.updateStocks(stocksEntry);
                TimeUnit.MINUTES.sleep(5);
            } catch (SQLException e) {
                log.error("Daemon : Updating Stocks failed");
                throw new RuntimeException(e);
            }
        }
    }
}