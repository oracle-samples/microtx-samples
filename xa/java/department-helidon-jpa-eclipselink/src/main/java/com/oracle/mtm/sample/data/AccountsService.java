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
package com.oracle.mtm.sample.data;

import java.lang.invoke.MethodHandles;
import java.sql.SQLException;
import java.util.logging.Level;
import jakarta.enterprise.context.RequestScoped;
import jakarta.inject.Inject;
import jakarta.inject.Provider;
import jakarta.persistence.EntityManager;
import jakarta.persistence.Query;

import com.oracle.mtm.sample.Configuration;
import com.oracle.mtm.sample.entity.Account;

import oracle.tmm.jta.common.TrmEntityManager;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

/**
 * Service that connects to the accounts database and provides methods to interact with the accounts
 */
@RequestScoped
public class AccountsService implements IAccountsService {

    @Inject
    @TrmEntityManager
    private EntityManager entityManager;

    @Inject
    private Provider<EntityManager> localEntityManager;

    final static Logger logger = LoggerFactory.getLogger(MethodHandles.lookup().lookupClass());

    public Account findByAccountId(String accountId) throws SQLException {
        EntityManager em = localEntityManager.get();
        try {
            Query query = em.createNativeQuery("SELECT * FROM accounts where account_id= ?", Account.class);
            query.setParameter(1, accountId);
            Account account = (Account) query.getSingleResult();
            return account;
        } catch (Exception e) {
            throw new SQLException(e);
        } finally {
            em.close();
        }
    }

    public Account findByAccountId(String accountId, EntityManager em) {
        Query query = em.createNativeQuery("SELECT * FROM accounts where account_id= ?", Account.class);
        query.setParameter(1, accountId);
        Account account = (Account) query.getSingleResult();
        return account;
    }

    @Override
    public Account accountDetails(String accountId) throws SQLException {
        Account account = findByAccountId(accountId);
        return account;
    }

    @Override
    public boolean withdraw(String accountId, double amount) throws SQLException {
        Account account = findByAccountId(accountId, entityManager);
        if (account != null) {
            logger.info("Current Balance: " + account.getAmount());
            account.setAmount(account.getAmount() - amount);

            account = entityManager.merge(account);
            entityManager.flush();
            logger.info("New Balance: " + account.getAmount());
            return true;
        }
        return false;
    }

    @Override
    public boolean deposit(String accountId, double amount) throws SQLException {
        Account account = findByAccountId(accountId, entityManager);
        if (account != null) {
            logger.info("Current Balance: " + account.getAmount());
            account.setAmount(account.getAmount() + amount);
            account = entityManager.merge(account);
            entityManager.flush();
            logger.info("New Balance: " + account.getAmount());
            return true;
        }
        return false;

    }

    @Override
    public double getBalance(String accountId) throws SQLException {
        Account account = findByAccountId(accountId, entityManager);
        if (account != null) {
            return account.getAmount();
        }
        throw new IllegalArgumentException("Account not found");
    }
}
