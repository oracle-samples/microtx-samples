package com.oracle.example.department.data;

import com.oracle.example.department.entity.Account;
import com.oracle.example.department.exception.NotFoundException;
import com.oracle.example.department.exception.UnprocessableEntityException;

/**
 * Interface for account database service
 */
public interface IAccountOperationService {

    /**
     * Withdraw amount from an account
     * @param accountId Account identity
     * @param amount The amount to be withdrawn from the account
     */
    void withdraw(String accountId, double amount) throws NotFoundException, UnprocessableEntityException;

    /**
     * Deposit amount to an account
     * @param accountId Account identity
     * @param amount The amount to be deposited into the account
     */
    void deposit(String accountId, double amount) throws NotFoundException;

    /**
     * Saves Account entity
     * @param account Account entity object to be saved
     */
    void save(Account account);

}
