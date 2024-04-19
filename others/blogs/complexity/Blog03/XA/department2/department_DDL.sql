-- Accounts table
CREATE TABLE accounts
(
    account_id VARCHAR(10)    not null,
    name       VARCHAR(60)    not null,
    amount     decimal(10, 2) not null,
    PRIMARY KEY (account_id)
);

-- Populate accounts
INSERT INTO accounts
VALUES ('account1', 'account1', 1000.00);
INSERT INTO accounts
VALUES ('account2', 'account2', 2000.00);
INSERT INTO accounts
VALUES ('account3', 'account3', 3000.00);
INSERT INTO accounts
VALUES ('account4', 'account4', 4000.00);
INSERT INTO accounts
VALUES ('account5', 'account5', 5000.00);