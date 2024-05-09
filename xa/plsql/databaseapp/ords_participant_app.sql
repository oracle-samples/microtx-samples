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

-- APPLICATION CODE START -----

CREATE TABLE accounts
(
    account_id varchar(10) not null,
    name varchar(60) not null,
    amount decimal(10,2) not null,
    PRIMARY KEY (account_id)
);
insert into accounts (account_id, name, amount) values('account1', 'account1', 1000.00);
insert into accounts (account_id, name, amount) values('account2', 'account2', 2000.00);
insert into accounts (account_id, name, amount) values('account3', 'account3', 3000.00);
insert into accounts (account_id, name, amount) values('account4', 'account4', 4000.00);
insert into accounts (account_id, name, amount) values('account5', 'account5', 5000.00);
/

CREATE OR REPLACE PROCEDURE doDeposit (
    p_amount     IN  accounts.amount%TYPE,
    p_account_id     IN  accounts.account_id%TYPE
)
AUTHID CURRENT_USER
AS
BEGIN
    UPDATE accounts
    SET amount    = amount + p_amount
    WHERE account_id  = p_account_id;
EXCEPTION
    WHEN OTHERS THEN
        HTP.print('Error: ' || SQLERRM || ' = Backtrace: ' || dbms_utility.format_error_backtrace);
END doDeposit;
/


CREATE OR REPLACE PROCEDURE doWithdraw (
    p_amount     IN  accounts.amount%TYPE,
    p_account_id     IN  accounts.account_id%TYPE
)
AUTHID CURRENT_USER
AS
BEGIN
    UPDATE accounts
    SET amount    = amount - p_amount
    WHERE account_id  = p_account_id;
EXCEPTION
    WHEN OTHERS THEN
        HTP.print('Error: ' || SQLERRM || ' = Backtrace: ' || dbms_utility.format_error_backtrace);
END doWithdraw;
/

DECLARE
    restModuleName VARCHAR2(256):= 'accounts'; --provide a name for the REST Service Module
    restModuleBasePath VARCHAR2(256):= 'accounts'; --provide a path for the REST Service Base Path
BEGIN
    ORDS.define_module(
            p_module_name    => restModuleName,
            p_base_path      => restModuleBasePath,
            p_items_per_page => 0);


    /**
     * API to withdraw amount from account
     * @path param accountId - The accountId from which amount to be withdrawn
     * @query param amount - amount to be withdrawn
     * URI: /accounts/<accountId>/withdraw?amount=<amount>
     * @return - HTTP Status
     */
    ORDS.define_template(
            p_module_name    => restModuleName,
            p_pattern        => ':accountId/deposit');

    ORDS.define_handler(
            p_module_name    => restModuleName,
            p_pattern        => ':accountId/deposit',
            p_method         => 'POST',
            p_source_type    => ORDS.source_type_plsql,
            p_source         => '
                        DECLARE
                        /*
                        * l_callBackUrl: Set up the callBackUrl correctly. This is generally the base URL or path of the module.
                        * Examples of resolvable callback URL:
                        *  - http://localhost:50080/ords/ordstest/accounts
                        *  - http://localhost:8080/ords/otmm/accounts
                        * l_callBackUrl  VARCHAR2(256) := OWA_UTIL.get_cgi_env(''X-APEX-BASE'') || ''accounts'';
                        */
                        l_callBackUrl VARCHAR2(256) := get_microtx_config(''callback-url'') || ''/accounts'';

                        l_tmmReturn TmmReturn;
                        l_tmmReturn2 TmmReturn;

                        BEGIN
                            IF :amount > 1000 THEN
                                HTP.p(''Error: Cannot deposit amount more than 1000 without prior authorization'');
                                :status_code := 400;
                            ELSE
                                --Call TmmStart as shown below. All Other parameters than the callBackUrl must be passed as shown below.
                                l_tmmReturn := TmmStart(callBackUrl => l_callBackUrl, linkUrl => :linkUrl, requestId => :requestId, authorizationToken => :authorization, tmmTxToken => :tmmTxToken);
                                --HTP.p(''l_tmmReturn.proceed='' || l_tmmReturn.proceed);
                                IF (l_tmmReturn.proceed > 0) THEN       --Check if the transaction should proceed or not
                                    --Execute your business logic
                                    doDeposit(p_amount  => :amount, p_account_id  => :accountId);

                                    l_tmmReturn2 := TmmEnd(p_xid => l_tmmReturn.xid);   --Call TmmEnd

                                    :status_code := 200;
                                ELSE
                                    :status_code := 400; --bad request

                                END IF;
                            END IF;
                        exception
                            when others then
                                HTP.p(''ERROR Code: '' || SQLCODE || '' : ERROR Message: '' || SQLERRM || '' = Backtrace: '' || dbms_utility.format_error_backtrace);
                                :status_code := 500;

                         END;',
            p_items_per_page => 0);

    /**
     * API to deposit amount to account
     * @path param accountId - The accountId to which amount to be deposited
     * @query param amount - amount to be deposited
     * URI: /accounts/<accountId>/deposit?amount=<amount>
     * @return - HTTP Status
     */
    ORDS.define_template(
            p_module_name    => restModuleName,
            p_pattern        => ':accountId/withdraw');

    ORDS.define_handler(
            p_module_name    => restModuleName,
            p_pattern        => ':accountId/withdraw',
            p_method         => 'POST',
            p_source_type    => ORDS.source_type_plsql,
            p_source         => '
                        DECLARE
                        /*
                        * l_callBackUrl: Set up the callBackUrl correctly. This is generally the base URL or path of the module.
                        * Examples of resolvable callback URL:
                        *  - http://localhost:50080/ords/ordstest/accounts
                        *  - http://localhost:8080/ords/otmm/accounts
                        * l_callBackUrl  VARCHAR2(256) := OWA_UTIL.get_cgi_env(''X-APEX-BASE'') || ''accounts'';
                        */
                        l_callBackUrl VARCHAR2(256) := get_microtx_config(''callback-url'') || ''/accounts'';

                        l_tmmReturn TmmReturn;
                        l_tmmReturn2 TmmReturn;

                        BEGIN
                            --Call TmmStart as shown below. All Other parameters than the callBackUrl must be passed as shown below.
                            l_tmmReturn := TmmStart(callBackUrl => l_callBackUrl, linkUrl => :linkUrl, requestId => :requestId, authorizationToken => :authorization, tmmTxToken => :tmmTxToken);
                            --HTP.p(''l_tmmReturn.proceed='' || l_tmmReturn.proceed);
                            IF (l_tmmReturn.proceed > 0) THEN                   --Check if the transaction should proceed or not
                                --Execute your business logic
                                doWithdraw(p_amount  => :amount, p_account_id  => :accountId);

                                l_tmmReturn2 := TmmEnd(p_xid => l_tmmReturn.xid);       --Call TmmEnd

                                :status_code := 200;

                            ELSE
                                :status_code := 400; --bad request

                            END IF;

                        exception
                            when others then
                                HTP.p(''ERROR Code: '' || SQLCODE || '' : ERROR Message: '' ||  || '' = Backtrace: '' || dbms_utility.format_error_backtrace);
                                :status_code := 500;

                         END;',
            p_items_per_page => 0);


    /**
     * API to get an account details
     * @param accountId - The accountId for which the details should be returned
     * @return - Account Details associated with the accountId
     */
    ORDS.define_template(
            p_module_name    => restModuleName,
            p_pattern        => ':accountId');

    ORDS.DEFINE_HANDLER(
            p_module_name    => restModuleName,
            p_pattern        => ':accountId',
            p_method         => 'GET',
            p_source_type    => ORDS.source_type_plsql,
            p_mimes_allowed  => '',
            p_comments       => NULL,
            p_source         =>
                'DECLARE
                     l_val accounts.amount%TYPE;
                     l_name accounts.name%TYPE;

                 BEGIN
                     APEX_JSON.initialize_clob_output;
                     APEX_JSON.open_object; -- {

                     select amount, name into l_val, l_name from accounts where account_id = :accountId;

                     APEX_JSON.write(''accountId'', :accountId);
                     APEX_JSON.write(''name'', l_name);
                     APEX_JSON.write(''amount'', l_val);
                     APEX_JSON.close_object; -- }

                     -- Set header
                     OWA_UTIL.mime_header(''application/json'', FALSE);
                     OWA_UTIL.http_header_close;

                     -- Output response text.
                     HTP.p(APEX_JSON.get_clob_output);
                     APEX_JSON.free_output;

                    :status_code := 200;
                 exception
                     when others then
                         HTP.p(''ERROR Code: '' || SQLCODE || '' : ERROR Message: '' || SQLERRM || '' = Backtrace: '' || dbms_utility.format_error_backtrace);
                         :status_code := 500;

                 END;');

    --Create TMM Callback apis
    createTMMCallbacks(moduleName => restModuleName);

    --Register all Method Handlers that will participate in an XA transaction
    registerXaHandler(moduleName => restModuleName,
                      handlerPattern => ':accountId/deposit',
                      handlerMethod => 'POST');
    registerXaHandler(moduleName => restModuleName,
                      handlerPattern => ':accountId/withdraw',
                      handlerMethod => 'POST');

    COMMIT;
END;
/