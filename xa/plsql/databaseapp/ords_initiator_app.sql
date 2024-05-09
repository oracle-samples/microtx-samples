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

/**
* API to initiate a transfer using TMM XA coordinator
* @param transferDetails transfer entity with transfer details
* @return HTTP response
* 
* Sample curl for transfer: 
*
* curl --location 'http://<HOST:PORT>/ords/<pool-name>/<schema-name>/transfers/transfer' \
* --header 'Accept: application/json' \
* --header 'Content-Type: application/json' \
* -d '{
*     "from": "account1",
*     "to": "account2",
*     "amount": 2
* }'
* 
* <pool-name> : is required if REST module is not created in default pool
*/
DECLARE
    restModuleName VARCHAR2(256):= 'teller'; --provide a name for the REST Service Module
    restModuleBasePath VARCHAR2(256):= 'transfers'; --provide a path for the REST Service Base Path
BEGIN
    ORDS.define_module(
            p_module_name    => restModuleName,
            p_base_path      => restModuleBasePath,
            p_items_per_page => 0);


    ORDS.define_template(
            p_module_name    => restModuleName,
            p_pattern        => 'transfer');

    ORDS.define_handler(
            p_module_name    => restModuleName,
            p_pattern        => 'transfer',
            p_method         => 'POST',
            p_source_type    => ORDS.source_type_plsql,
            p_source         => '
                        DECLARE
                        payload      JSON_OBJECT_T;
                        l_from_account VARCHAR2(32);
                        l_to_account VARCHAR2(32);
                        l_amount VARCHAR2(32);
                        l_microTxTransaction MicroTxTransaction;
                        l_forwardHeaders ForwardHeaders;
                        l_is_withdraw_successful BOOLEAN;
                        l_is_deposit_successful BOOLEAN;
                        BEGIN
                            payload := JSON_OBJECT_T(:body);
                            l_from_account := payload.get_String(''from'');
                            l_to_account := payload.get_String(''to'');
                            l_amount := payload.get_String(''amount'');

                            -- Set response header
                            OWA_UTIL.mime_header(''application/json'', FALSE);
                            OWA_UTIL.http_header_close;

                            -- set forward headers
                            l_forwardHeaders := ForwardHeaders(:authorization, :tmmTxToken, :requestId);

                            l_microTxTransaction := tmm_begin_tx(l_forwardHeaders);

                            l_is_withdraw_successful := callWithdrawParticipant(l_from_account, l_amount, l_microTxTransaction , l_forwardHeaders);
                            IF NOT l_is_withdraw_successful THEN
                                tmm_rollback_tx(l_microTxTransaction, l_forwardHeaders);
                                :status_code := 500;
                                HTP.p(''{"error" : "Withdraw failed"}'');
                                RETURN;
                            END IF;

                            l_is_deposit_successful := callDepositParticipant(l_to_account, l_amount, l_microTxTransaction, l_forwardHeaders);
                            IF NOT l_is_deposit_successful THEN
                                tmm_rollback_tx(l_microTxTransaction, l_forwardHeaders);
                                :status_code := 500;
                                HTP.p(''{"error" : "Deposit failed"}'');
                                RETURN;
                            END IF;

                            -- Within global transaction
                            creditFundTransferRewards(l_from_account, l_amount);

                            tmm_commit_tx(l_microTxTransaction, l_forwardHeaders);
                            :status_code := 200;
                            HTP.P(''{"message":"Transfer successful"}'');
                            
                        EXCEPTION
                            WHEN tmm_exceptions.FailedToCreateMicroTxTransaction THEN
                                HTP.p(''{"error" : "Failed to create transaction"}'' || tmm_exceptions.get_error_message_by_code(SQLCODE));
                                :status_code := 500;
                            WHEN others THEN 
                                IF tmm_exceptions.is_microtx_exception(SQLCODE) THEN
                                    HTP.p(''ERROR Code: '' || SQLCODE || '' : ERROR Message: '' || tmm_exceptions.get_error_message_by_code(SQLCODE));
                                ELSE
                                    HTP.p(''App ERROR Code: '' || SQLCODE || '' : ERROR Message: '' || SQLERRM || '' = Backtrace: '' || dbms_utility.format_error_backtrace);
                                END IF;
                                -- Based on application logic, transaction can be rolledback on exception
                                -- tmm_rollback_tx(l_microTxTransaction, l_forwardHeaders);
                                :status_code := 500;
                        END;',
            p_items_per_page => 0);

    /**
     * API to get reward details for a given account
     * @param accountId - The accountId for which the details should be returned
     * @return - Reward details associated with the accountId
     *
     * Curl:
     * curl -s --location 'http://<HOST:PORT>/ords/<pool-name>/<schema-name>/transfers/rewards/account1'
     *
     * <pool-name> : is required if REST module is not created in default pool
     */
    ORDS.define_template(
            p_module_name    => restModuleName,
            p_pattern        => 'rewards/:accountId');

    ORDS.DEFINE_HANDLER(
            p_module_name    => restModuleName,
            p_pattern        => 'rewards/:accountId',
            p_method         => 'GET',
            p_source_type    => ORDS.source_type_plsql,
            p_mimes_allowed  => '',
            p_comments       => NULL,
            p_source         =>
                'DECLARE
                     l_account_id fund_transfer_reward.account_id%TYPE;
                     l_total_reward_amount fund_transfer_reward.reward_amount%TYPE;

                 BEGIN
                     APEX_JSON.initialize_clob_output;
                     APEX_JSON.open_object; -- {

                     SELECT account_id, sum(reward_amount) INTO l_account_id, l_total_reward_amount 
                     FROM fund_transfer_reward WHERE account_id = :accountId
                     GROUP BY account_id;

                     APEX_JSON.write(''account_id'', l_account_id);
                     APEX_JSON.write(''total_reward_amount'', l_total_reward_amount);
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

    --Register all Method Handlers with library bindings
    registerXaHandler(moduleName => restModuleName,
                      handlerPattern => 'transfer',
                      handlerMethod => 'POST');

    --Create TMM Callback apis
    createTMMCallbacks(moduleName => restModuleName);

    COMMIT;
END;
/


/**
* Create table for persisting fund transfer rewards
**/
CREATE TABLE fund_transfer_reward (
    transfer_date  TIMESTAMP DEFAULT ON NULL sysdate,
    account_id     VARCHAR2(64),
    reward_amount  DECIMAL(18, 2)
);

/**
* Send an HTTP request to the service to withdraw amount from the provided account identity
*
* @param accountId The account Identity
* @param amount    The amount to be withdrawn
* @return HTTP Response from the service
*/
CREATE OR REPLACE FUNCTION callWithdrawParticipant (
    p_account_id  IN  VARCHAR2,
    p_amount     IN  VARCHAR2,
    l_microTxTransaction IN MicroTxTransaction,
    l_forwardHeaders IN ForwardHeaders DEFAULT NULL
) RETURN BOOLEAN 
AUTHID CURRENT_USER
AS
   l_withdraw_endpoint VARCHAR2(128) := 'http://host.docker.internal:8081';
   l_withdraw_url VARCHAR2(255);
   l_withdraw_response CLOB;
BEGIN
    -- Withdraw URL http://host.docker.internal:8081/accounts/<account-id>/withdraw?amount=<withdraw-amount>
    l_withdraw_url := utl_lms.format_message('%s/accounts/%s/withdraw?amount=%d', l_withdraw_endpoint, p_account_id, p_amount);

    
    apex_web_service.set_request_headers (
        -- Set link header, this is mandatory for external requests which involves distributed transaction
        p_name_01 => 'Link',
        p_value_01 => getTmmLinkHeader(l_microTxTransaction),

        -- forward request headers to participant
        p_name_02 => 'Authorization',
        p_value_02 => l_forwardHeaders.authorizationToken,
        p_name_03 => 'oracle-tmm-tx-token',
        p_value_03 => l_forwardHeaders.tmmTxToken,
        p_name_04 => 'x-request-id',
        p_value_04 => l_forwardHeaders.requestId,
        -- optional Transaction Id for affinity
        p_name_05 => 'x-request-id',
        p_value_05 => l_microTxTransaction.gtrid
    );

    l_withdraw_response := apex_web_service.make_rest_request(
        p_url         => l_withdraw_url,
        p_http_method => 'POST',
        p_body => ''
    );
    IF apex_web_service.g_status_code = 200 THEN
       microtx_log('Withdraw operation successful');
       RETURN TRUE;
    ELSE
       microtx_log('Withdraw failed with HTTP response ' || apex_web_service.g_status_code || ' : ' || l_withdraw_response);
       RETURN FALSE;
    END IF;
EXCEPTION
    WHEN OTHERS THEN
        microtx_log('Withdraw failed ' || SQLERRM || ' = Backtrace: ' || dbms_utility.format_error_backtrace);
        RETURN FALSE;
END callWithdrawParticipant;
/

/**
* Send an HTTP request to the service to deposit amount into the provided account identity
*
* @param accountId The account Identity
* @param amount    The amount to be deposited
* @return HTTP Response from the service
*/
CREATE OR REPLACE FUNCTION callDepositParticipant (
    p_account_id  IN  VARCHAR2,
    p_amount     IN  VARCHAR2,
    l_microTxTransaction IN MicroTxTransaction,
    l_forwardHeaders IN ForwardHeaders DEFAULT NULL
) RETURN BOOLEAN 
AUTHID CURRENT_USER
AS
   l_withdraw_endpoint VARCHAR2(128) := 'http://host.docker.internal:8082';
   l_deposit_url VARCHAR2(255);
   l_deposit_response CLOB;
BEGIN
    -- Deposit URL http://host.docker.internal:8082/accounts/<account-id>/deposit?amount=<withdraw-amount>
    l_deposit_url := utl_lms.format_message('%s/accounts/%s/deposit?amount=%d', l_withdraw_endpoint, p_account_id, p_amount);

    apex_web_service.set_request_headers (
        -- Set link header, this is mandatory for external requests which involves distributed transaction
        p_name_01 => 'Link',
        p_value_01 => getTmmLinkHeader(l_microTxTransaction),

        -- forward request headers to participant
        p_name_02 => 'Authorization',
        p_value_02 => l_forwardHeaders.authorizationToken,
        p_name_03 => 'oracle-tmm-tx-token',
        p_value_03 => l_forwardHeaders.tmmTxToken,
        p_name_04 => 'x-request-id',
        p_value_04 => l_forwardHeaders.requestId,
        -- optional Transaction Id for affinity
        p_name_05 => 'x-request-id',
        p_value_05 => l_microTxTransaction.gtrid
    );

    l_deposit_response := apex_web_service.make_rest_request(
        p_url         => l_deposit_url,
        p_http_method => 'POST',
        p_body => ''
    );
    IF apex_web_service.g_status_code = 200 THEN
       microtx_log('Deposit operation successful');
       RETURN TRUE;
    ELSE
       microtx_log('Deposit failed with HTTP response ' || apex_web_service.g_status_code || ' : ' || l_deposit_response);
       RETURN FALSE;
    END IF;
EXCEPTION
    WHEN OTHERS THEN
        microtx_log('Deposit failed ' || SQLERRM || ' = Backtrace: ' || dbms_utility.format_error_backtrace);
        RETURN FALSE;
END callDepositParticipant;
/

/**
  Credit points to sender account on every transfer. 
  For every transfer, the sender receives a 5% reward on the transfer amount.
**/
CREATE OR REPLACE PROCEDURE creditFundTransferRewards (
    p_account_id  IN  VARCHAR2,
    p_amount     IN  VARCHAR2
)
AUTHID CURRENT_USER
IS
   c_reward_percentage constant NUMBER := 5;
   l_reward_amount FLOAT;
BEGIN
   l_reward_amount := (TO_NUMBER(p_amount DEFAULT 0 ON CONVERSION ERROR) * c_reward_percentage) / 100;
   INSERT INTO fund_transfer_reward(account_id, reward_amount) 
   VALUES (p_account_id, l_reward_amount);
END creditFundTransferRewards;
/