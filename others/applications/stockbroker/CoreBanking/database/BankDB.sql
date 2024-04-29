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
-- Tables to be created
CREATE TABLE BRANCH
(
    BRANCH_ID   NUMBER NOT NULL,
    BRANCH_NAME VARCHAR2(20),
    PHONE       VARCHAR2(14),
    ADDRESS     VARCHAR2(60),
    SERVICE_URL VARCHAR2(255),
    LAST_ACCT   INTEGER,
    PRIMARY KEY (BRANCH_ID)
);

CREATE TABLE ACCOUNT
(
    ACCOUNT_ID NUMBER   NOT NULL,
    BRANCH_ID  NUMBER   NOT NULL,
    SSN        CHAR(12) NOT NULL,
    FIRST_NAME VARCHAR2(20),
    LAST_NAME  VARCHAR2(20),
    MID_NAME   VARCHAR2(10),
    PHONE      VARCHAR2(14),
    ADDRESS    VARCHAR2(60),
    PRIMARY KEY (ACCOUNT_ID)
);

CREATE TABLE HISTORY
(
    TRANSACTION_CREATED TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    ACCOUNT_ID          NUMBER       NOT NULL,
    BRANCH_ID           NUMBER       NOT NULL,
    TRANSACTION_TYPE    VARCHAR2(15) NOT NULL,
    DESCRIPTION         VARCHAR2(1024),
    AMOUNT              DECIMAL(20, 2) NOT NULL,
    BALANCE             DECIMAL(20, 2) NOT NULL
);


-- Initialization - Core Bank database

-- BRANCH
INSERT INTO BRANCH (BRANCH_ID, BRANCH_NAME, PHONE, ADDRESS, SERVICE_URL, LAST_ACCT)
VALUES (1111, 'Arizona', '123-456-7891', '6001 N 24th St, Phoenix, Arizona 85016, United States', 'http://arizona-branch-bank:9095', 10002);
INSERT INTO BRANCH (BRANCH_ID, BRANCH_NAME, PHONE, ADDRESS, SERVICE_URL, LAST_ACCT)
VALUES (2222, 'Los Angeles', '219-798-3000', '710 W Olympic Blvd, Los Angeles, CA 90015, United States', 'http://losangeles-branch-bank:9096', 20002);

-- ACCOUNTS
INSERT INTO ACCOUNT (ACCOUNT_ID, BRANCH_ID, SSN, FIRST_NAME, LAST_NAME, MID_NAME, PHONE, ADDRESS)
VALUES (10001, 1111, '873-61-1457', 'Adams', 'Lopez', 'D', '506-100-5886', '15311 Grove Ct. Arizona  95101');
INSERT INTO ACCOUNT (ACCOUNT_ID, BRANCH_ID, SSN, FIRST_NAME, LAST_NAME, MID_NAME, PHONE, ADDRESS)
VALUES (10002, 1111, '883-71-8538', 'Smith', 'Mason', 'N', '403-200-5890', '15322 Grove Ct. Arizona  95101');
INSERT INTO ACCOUNT (ACCOUNT_ID, BRANCH_ID, SSN, FIRST_NAME, LAST_NAME, MID_NAME, PHONE, ADDRESS)
VALUES (10003, 1111, '883-71-8538', 'Thomas', 'Dave', 'C', '603-700-5899', '15333 Grove Ct. Arizona  95101');

INSERT INTO ACCOUNT (ACCOUNT_ID, BRANCH_ID, SSN, FIRST_NAME, LAST_NAME, MID_NAME, PHONE, ADDRESS)
VALUES (20001, 2222, '893-51-9529', 'Johnson', 'White', 'A', '303-400-5822', '25322 Grove Ct. Los Angeles 95101');
INSERT INTO ACCOUNT (ACCOUNT_ID, BRANCH_ID, SSN, FIRST_NAME, LAST_NAME, MID_NAME, PHONE, ADDRESS)
VALUES (20002, 2222, '803-41-2510', 'Garcia', 'Reily', 'B', '202-400-5896', '25322 Grove Ct. Los Angeles 95101');
