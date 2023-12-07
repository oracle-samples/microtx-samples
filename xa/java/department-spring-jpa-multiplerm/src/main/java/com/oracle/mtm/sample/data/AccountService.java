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

import com.oracle.mtm.sample.entity.Account;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.context.ApplicationContext;
import org.springframework.stereotype.Component;
import org.springframework.web.context.annotation.RequestScope;

import jakarta.persistence.EntityManager;
import javax.sql.DataSource;
import javax.sql.XADataSource;
import java.sql.SQLException;

/**
 * Service that connects to the accounts database and provides methods to interact with the account
 */

@Component
@RequestScope
public class AccountService implements IAccountService {

    private static final Logger LOG = LoggerFactory.getLogger(AccountService.class);

    private ApplicationContext applicationContext;

    @Autowired
    CustomAccountRepository customAccountRepository;

    @Autowired
    CreditAccountRepository creditAccountRepository;

    private EntityManager entityManager;

    private EntityManager creditEntityManager;


    @Autowired
    public AccountService(ApplicationContext applicationContext) {
        this.applicationContext = applicationContext;
        try {
            entityManager =  (EntityManager) applicationContext.getBean("microTxEntityManager", "departmentDataSource");
            creditEntityManager =  (EntityManager) applicationContext.getBean("microTxEntityManager", "creditDataSource");
        } catch (ClassCastException ex) {
            LOG.info(ex.getMessage());
        }
    }

    @Override
    public Account accountDetails(String accountId) throws SQLException {
        Account account = customAccountRepository.findByAccountId(accountId);
        return account;
    }

    @Override
    public Account creditAccountDetails(String accountId) throws SQLException {
        Account account = creditAccountRepository.findByAccountId(accountId);
        return account;
    }

    @Override
    public boolean withdraw(String accountId, double amount) throws SQLException {
        Account account = customAccountRepository.findByAccountId(accountId, entityManager);
        if (account != null ) {
            LOG.info("Current Balance: " + account.getAmount());
            account.setAmount(account.getAmount() - amount);
            account = entityManager.merge(account);
            entityManager.flush();
            LOG.info("New Balance: " + account.getAmount());
            return true;
        }
        return false;
    }

    @Override
    public boolean deposit(String accountId, double amount) throws SQLException {
        Account account = customAccountRepository.findByAccountId(accountId, entityManager);
        if (account != null) {
            LOG.info("Current Balance: " + account.getAmount());
            account.setAmount(account.getAmount() + amount);
            account = entityManager.merge(account);
            entityManager.flush();
            LOG.info("New Balance: " + account.getAmount());
            return true;
        }
        return false;

    }


    @Override
    public double getBalance(String accountId) throws SQLException {
        Account account = customAccountRepository.findByAccountId(accountId, entityManager);
        if (account != null) {
            return account.getAmount();
        }
        throw new IllegalArgumentException("Account not found");
    }

    @Override
    public boolean increaseCreditPoint(String accountId, Integer amount) throws SQLException {
        Account creditAccount = creditAccountRepository.findByAccountId(accountId, creditEntityManager);
        if (creditAccount != null) {
            LOG.info("Current Credit" + creditAccount.getAmount());
            creditAccount.setAmount(creditAccount.getAmount() + amount);
            creditAccount = creditEntityManager.merge(creditAccount);
            creditEntityManager.flush();
            LOG.info("Updated Credit" + creditAccount.getAmount());
            return true;
        }
        return false;
    }
}