/*

Oracle Transaction Manager for Microservices

Copyright (c) 2023, Oracle and/or its affiliates. **

The Universal Permissive License (UPL), Version 1.0 **

Subject to the condition set forth below, permission is hereby granted to any person obtaining a copy of this software, associated documentation and/or data (collectively the "Software"), free of charge and under any and all copyright rights in the Software, and any and all patent rights owned or freely licensable by each licensor hereunder covering either the unmodified Software as contributed to or provided by such licensor, or (ii) the Larger Works (as defined below), to deal in both **
(a) the Software, and (b) any piece of software and/or hardware listed in the lrgrwrks.txt file if one is included with the Software (each a "Larger Work" to which the Software is contributed by such licensors), **
without restriction, including without limitation the rights to copy, create derivative works of, display, perform, and distribute the Software and make, use, sell, offer for sale, import, export, have made, and have sold the Software and the Larger Work(s), and to sublicense the foregoing rights on either these or other terms. **

This license is subject to the following condition: The above copyright notice and either this complete permission notice or at a minimum a reference to the UPL must be included in all copies or substantial portions of the Software. **
THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

*/
package com.oracle.mtm.sample.data;


import java.sql.SQLException;

import com.mongodb.BasicDBObject;
import com.mongodb.MongoClientSettings;
import com.mongodb.client.ClientSession;
import com.mongodb.client.MongoCollection;
import com.mongodb.client.model.Filters;
import com.mongodb.client.model.Updates;
import com.mongodb.client.result.UpdateResult;
import com.oracle.mtm.sample.NonXADataSourceConfig;
import com.oracle.mtm.sample.entity.Account;
import com.oracle.mtm.sample.resource.AccountsResource;
import org.bson.codecs.configuration.CodecRegistry;
import org.bson.codecs.pojo.PojoCodecProvider;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;

import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.context.annotation.Lazy;
import org.springframework.stereotype.Component;

import org.springframework.web.context.annotation.RequestScope;


import static org.bson.codecs.configuration.CodecRegistries.fromProviders;
import static org.bson.codecs.configuration.CodecRegistries.fromRegistries;

/**
 * Service that connects to the accounts database and provides methods to interact with the account
 */

@Component
@RequestScope
public class AccountService implements IAccountService {

    @Autowired
    @Qualifier("microTxNonXASession")
    @Lazy
    ClientSession session;

    private static final Logger LOG = LoggerFactory.getLogger(AccountsResource.class);

    @Autowired
    NonXADataSourceConfig config;

    @Override
    public Account accountDetails(String accountId) throws SQLException {
        BasicDBObject searchQuery = new BasicDBObject();
        searchQuery.put("accountId", accountId);
        return getAccounts().find(Filters.eq("accountId", accountId)).first();
    }

    @Override
    public boolean withdraw(String accountId, double amount) throws SQLException {
        double currentBalance = getBalance(accountId);
        double newBalance = currentBalance - amount;
        return updateBalance(session, accountId, newBalance);
    }

    @Override
    public boolean deposit(String accountId, double amount) throws SQLException {
        double currentBalance = getBalance(accountId);
        double newBalance = currentBalance + amount;
        return updateBalance(session, accountId, newBalance);
    }

    @Override
    public double getBalance(String accountId) throws SQLException {
        Account account = this.accountDetails(accountId);
        if (account != null) {
            return account.getAmount();
        }
        throw new IllegalArgumentException("Account not found");
    }

    private MongoCollection<Account> getAccounts() {
        CodecRegistry pojoCodecRegistry = fromRegistries(MongoClientSettings.getDefaultCodecRegistry(),
                fromProviders(PojoCodecProvider.builder().register(Account.class).build()));
        return config.getDatabase().getCollection("accounts", Account.class).withCodecRegistry(pojoCodecRegistry);
    }

    private boolean updateBalance(ClientSession session, String accountId, double newBalance) {
        UpdateResult result = getAccounts().updateOne(session, Filters.eq("accountId", accountId), Updates.set("amount", newBalance));
        return result != null && result.wasAcknowledged();
    }
}