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
import jakarta.persistence.EntityManager;
import jakarta.persistence.NoResultException;
import jakarta.persistence.Query;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;
import org.springframework.web.context.annotation.RequestScope;

import java.util.Objects;

@Component
@RequestScope
public class AccountQueryService implements IAccountQueryService{

    @Autowired
    EntityManager entityManager;

    private static final Logger LOG = LoggerFactory.getLogger(AccountQueryService.class);

    @Override
    public Account getAccountDetails(String accountId) throws NotFoundException {
        Account account = null;
        try {
            Query query = entityManager.createNativeQuery("SELECT * FROM accounts where account_id= :account_id", Account.class);
            query.setParameter("account_id", accountId);
            account = (Account) query.getSingleResult();
            if(Objects.isNull(account)) {
                LOG.error("Account not found: " + accountId);
                throw new NotFoundException("No account found for the provided account Identity");
            }
        } catch (NoResultException e) {
            LOG.error("Unable to get account details for {}. Reason : {}", accountId, e);
        }
        return account;
    }

    @Override
    public double getBalance(String accountId) {
        Query query = entityManager.createNativeQuery("SELECT * FROM accounts where account_id= :account_id", Account.class);
        query.setParameter("account_id", accountId);
        Account account = (Account) query.getSingleResult();
        if (account != null) {
            return account.getAmount();
        }
        throw new IllegalArgumentException("Account not found");
    }
}
