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
package com.oracle.example.department.data;

import com.oracle.example.department.entity.Account;
import com.oracle.example.department.exception.NotFoundException;
import com.oracle.example.department.exception.UnprocessableEntityException;
import jakarta.persistence.EntityManager;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.context.annotation.RequestScope;

/**
 * Service that connects to the accounts database and provides methods to interact with the account
 */
@Component
@RequestScope
@Transactional
public class AccountOperationService implements IAccountOperationService {

    private static final Logger LOG = LoggerFactory.getLogger(AccountOperationService.class);

    @Autowired
    EntityManager entityManager;

    @Autowired
    IAccountQueryService accountQueryService;

    @Override
    public void withdraw(String accountId, double amount) throws UnprocessableEntityException, NotFoundException {
        Account account = accountQueryService.getAccountDetails(accountId);
        if (account.getAmount() < amount) {
            throw new UnprocessableEntityException("Insufficient balance in the account");
        }
        LOG.info("Current Balance: " + account.getAmount());
        account.setAmount(account.getAmount() - amount);
        account = entityManager.merge(account);
        entityManager.flush();
        LOG.info("New Balance: " + account.getAmount());
        LOG.info(amount + " withdrawn from account: " + accountId);
    }

    @Override
    public void deposit(String accountId, double amount) throws NotFoundException {
        Account account = accountQueryService.getAccountDetails(accountId);
        LOG.info("Current Balance: " + account.getAmount());
        account.setAmount(account.getAmount() + amount);
        account = entityManager.merge(account);
        entityManager.flush();
        LOG.info("New Balance: " + account.getAmount());
        LOG.info(amount + " deposited to account: " + accountId);
    }
}