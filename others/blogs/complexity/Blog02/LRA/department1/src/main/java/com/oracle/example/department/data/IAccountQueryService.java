package com.oracle.example.department.data;

import com.oracle.example.department.entity.Account;
import com.oracle.example.department.exception.NotFoundException;

/**
 * Interface for account queries (Non-Transactional operations)
 */
public interface IAccountQueryService {

    /**
     * Get account details persisted in the database
     * @param accountId Account identity
     * @return Returns the account details associated with the account
     */
    Account getAccountDetails(String accountId) throws NotFoundException;

    /**
     * Get balance amount from the account
     * @param accountId Account identity
     * @return Returns the balance associated with the account
     */
    double getBalance(String accountId);

}
