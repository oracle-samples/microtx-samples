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
