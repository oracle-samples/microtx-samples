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
}
