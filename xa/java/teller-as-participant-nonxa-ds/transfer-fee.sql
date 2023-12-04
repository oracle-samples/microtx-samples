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
#LLR commit records table. LLR with datasource participant needs this table to be created for storing the commit records
CREATE TABLE LLR_COMMIT_RECORD (
                                   GTRID varchar(255) NOT NULL,
                                   DATE_COMMITED TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                                   RECORDSTR text,
                                   PRIMARY KEY (GTRID)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

#fee table used in the sample application to demonstrate fee transfer from teller app
create database transfer_fee;
use transfer_fee;
create table fee
(
    account_id VARCHAR(10) not null,
    amount decimal(10,2) not null,
    PRIMARY KEY (account_id)
);
insert into fee values('account1', 10.00);
insert into fee values('account2', 20.00);
insert into fee values('account3', 30.00);
insert into fee values('account4', 40.00);
insert into fee values('account5', 50.00);