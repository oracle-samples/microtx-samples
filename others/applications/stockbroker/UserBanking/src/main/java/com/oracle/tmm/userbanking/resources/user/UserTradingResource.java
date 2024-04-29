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
package com.oracle.tmm.userbanking.resources.user;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.oracle.tmm.userbanking.model.trading.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.HttpStatusCodeException;
import org.springframework.web.client.RestTemplate;

import java.util.ArrayList;
import java.util.List;

@RestController
@RequestMapping(value = "/bankui-api/user/trading")
public class UserTradingResource {

    @Value("${stock-broker.endpoint}")
    String stockBrokerEndpoint;

    @Autowired
    RestTemplate restTemplate;

    private ObjectMapper objectMapper = new ObjectMapper();

    @GetMapping("stocks")
    public Stocks getAvailableStocks() {
        String url = stockBrokerEndpoint.concat("/stocks");
        return restTemplate.getForObject(url, Stocks.class);
    }

    @GetMapping("stocksUI")
    public List<StocksUI> getAvailableStocksToUI() {
        List<StocksUI> stocksUI = new ArrayList<>();
        String url = stockBrokerEndpoint.concat("/stocks");
        Stocks stocks = restTemplate.getForObject(url, Stocks.class);
        stocks.getStocks().forEach(stocksEntry -> stocksUI.add(new StocksUI(stocksEntry.getStockSymbol(), stocksEntry.getCompanyName())));
        return stocksUI;
    }

    @GetMapping("userStocks")
    public UserStocks getUserStocks(@RequestParam(name = "accountId") Integer accountId) {
        String url = stockBrokerEndpoint.concat("/transactions/enquire?accountId={accountId}");
        return restTemplate.getForObject(url, UserStocks.class, accountId);
    }

    @PostMapping("buyStocks")
    public BuyResponse buyStocks(@RequestBody BuyStock buyStock) {
        String url = stockBrokerEndpoint.concat("/transactions/buy");
        BuyResponse buyResponse = null;
        try {
            buyResponse = restTemplate.postForObject(url, buyStock, BuyResponse.class);
        } catch (HttpStatusCodeException e) {
            try {
                buyResponse = objectMapper.readValue(e.getResponseBodyAsString(), BuyResponse.class);
            } catch (JsonProcessingException ex) {
                buyResponse.setMessage(ex.getMessage());
            }
        }
        return buyResponse;
    }

    @PostMapping("sellStocks")
    public SellResponse sellStocks(@RequestBody SellStock sellStock) {
        String url = stockBrokerEndpoint.concat("/transactions/sell");
        SellResponse sellResponse = null;
        try {
            sellResponse = restTemplate.postForObject(url, sellStock, SellResponse.class);
        } catch (HttpStatusCodeException e) {
            try {
                sellResponse = objectMapper.readValue(e.getResponseBodyAsString(), SellResponse.class);
            } catch (JsonProcessingException ex) {
                sellResponse.setMessage(ex.getMessage());
            }
        }
        return sellResponse;
    }

    @GetMapping("transactions")
    public TransactionHistories getTransactions(@RequestParam(name = "accountId") Integer accountId) {
        String url = stockBrokerEndpoint.concat("/history/transactions?accountId={accountId}");
        return restTemplate.getForObject(url, TransactionHistories.class, accountId);
    }

}
