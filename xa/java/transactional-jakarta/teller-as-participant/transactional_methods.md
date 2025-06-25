# JTA Transactional Methods

The following are the methods that can be used with different JTA Transactional types, along with their behavior within and outside a transactional context:

## 1. REQUIRED
- Method: `transferTransactionalRequiredOC`
- Description: Supports a transaction if one already exists. If not, it creates a new transaction.
- Within Context: Uses the existing transaction.
- Outside Context: Creates a new transaction.

## 2. REQUIRES_NEW
- Method: `transferTransactionalRequiresNewOC`
- Description: Always creates a new transaction. If a transaction already exists, it is suspended.
- Within Context: Suspends the existing transaction and creates a new one.
- Outside Context: Creates a new transaction.

## 3. MANDATORY
- Method: `transferTransactionalMandatoryOC`
- Description: Requires a transaction to be present. If not, it throws an exception.
- Within Context: Uses the existing transaction.
- Outside Context: Throws an exception because there's no existing transaction.

## 4. SUPPORTS
- Method: `transferTransactionalSupportsOC`
- Description: Supports a transaction if one exists. If not, it executes non-transactionally.
- Within Context: Uses the existing transaction.
- Outside Context: Executes non-transactionally.

## 5. NOT_SUPPORTED
- Method: `transferTransactionalNotSupportedOC`
- Description: Always executes non-transactionally. If a transaction exists, it is suspended.
- Within Context: Suspends the existing transaction and executes non-transactionally.
- Outside Context: Executes non-transactionally.

## 6. NEVER
- Method: `transferTransactionalNeverOC`
- Description: Never supports a transaction. If a transaction exists, it throws an exception.
- Within Context: Throws an exception because a transaction exists.
- Outside Context: Executes non-transactionally.
