package com.oracle.example.department.data;

import com.oracle.example.department.exception.NotFoundException;
import com.oracle.example.department.exception.UnprocessableEntityException;

/**
 * Interface for account operations
 */
public interface IAccountOperationService {

    /**
     * Withdraw amount from an account
     * @param accountId Account identity
     * @param amount The amount to be withdrawn from the account
     */
    void withdraw(String accountId, double amount) throws UnprocessableEntityException, NotFoundException;

    /**
     * Deposit amount to an account
     * @param accountId Account identity
     * @param amount The amount to be deposited into the account
     */
    void deposit(String accountId, double amount) throws NotFoundException;

}
