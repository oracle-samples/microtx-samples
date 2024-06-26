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

CREATE USER department_spring IDENTIFIED BY <password> QUOTA UNLIMITED ON DATA;
GRANT CREATE SESSION TO department_spring;
ALTER SESSION SET CURRENT_SCHEMA=department_spring;
create table accounts
(
    account_id VARCHAR(10) not null,
    name VARCHAR(60) not null,
    amount decimal(10,2) not null,
    PRIMARY KEY (account_id)
);
insert into accounts values('account1', 'account1', 1000.00);
insert into accounts values('account2', 'account2', 2000.00);
insert into accounts values('account3', 'account3', 3000.00);
insert into accounts values('account4', 'account4', 4000.00);
insert into accounts values('account5', 'account5', 5000.00);

-- Oracle transaction event Queue(TEQ) related grants
GRANT EXECUTE ON DBMS_AQ TO department_spring
GRANT EXECUTE ON DBMS_AQIN to department_spring;

EXECUTE DBMS_AQADM.CREATE_SHARDED_QUEUE (queue_name  => 'department_spring.<queue_name>', multiple_consumers => true);
EXECUTE dbms_aqadm.grant_queue_privilege('ALL', 'department_spring.<queue_name>', 'department_spring');
EXECUTE dbms_aqadm.start_queue(queue_name => 'department_spring.<queue_name>');
