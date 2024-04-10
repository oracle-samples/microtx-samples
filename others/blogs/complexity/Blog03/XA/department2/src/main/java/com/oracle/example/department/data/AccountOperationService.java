package com.oracle.example.department.data;

import com.oracle.example.department.entity.Account;
import com.oracle.example.department.exception.NotFoundException;
import com.oracle.example.department.exception.UnprocessableEntityException;
import jakarta.persistence.EntityManager;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.context.annotation.Lazy;
import org.springframework.stereotype.Component;
import org.springframework.web.context.annotation.RequestScope;

/**
 * Service that connects to the accounts database and provides methods to interact with the account
 */
@Component
@RequestScope
public class AccountOperationService implements IAccountOperationService {

    private static final Logger LOG = LoggerFactory.getLogger(AccountOperationService.class);

    @Autowired
    @Qualifier("microTxEntityManager")
    @Lazy
    private EntityManager entityManager;

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
