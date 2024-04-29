# Database (ORDS-Apex) Sample Application for XA
This is a sample database resident application for XA. 
A database application is an Apex-ORDS application using an Oracle Database which can be run in a managed Apex service in OCI, in an ORDS-Apex-DB stack deployed in a Kubernetes cluster, or in an ORDS-Apex-DB stack within a VM or physical host.

## Pre-Requisite
- A Working ORDS-Apex-Database Stack. It could be running in the same kubernetes cluster in which TMM would be running or anywhere else.
- Network Access/Connectivity between TMM and the Database application when not deployed in the same kubernetes cluster.
- A Schema User must exist or should be created in Oracle DB. The schema must be registered with ORDS. See - https://docs.oracle.com/en/database/oracle/application-express/21.1/aeutl/accessing-RESTful-services.html  
- Ensure the ORDS service is available for the schema you registered. For example: http://localhost:50080/ords. Login to your workspace using the schema user credentials.  
- The TMM Library makes an outbound REST call to the TMM (Coordinator) for enlisting the participant service into an XA transaction. If outbound REST calls are not allowed by default then it requires adding permissions by creating an ACL (Access Control List). 
  The required ACL entries must be created and added to the database. The schema user would require sysdba permissions to add an ACL. Follow Apex documentation and add the required ACLs.
- When TMM is configured with Self Signed TLS certificate for HTTPS, it will require adding the trusted certificate to the Oracle Wallet being used with the Apex instance.
  Follow the Apex documentation to add the certificate to the wallet.

### ACL Configuration Example
An example ACL configuration to allow outgoing http calls to any host is shown here. To apply this configuration, login as sysdba user and execute the procedures below. You can create ACLs are required in your environment.
```bash
sqlplus sys/<adminPassword>@<host:port>/<pdbname> as sysdba
```
Example:
```bash
sqlplus sys/Welcome_12345@10.20.30.40:1521/ORCLPDB1 as sysdba
```
```sql
DECLARE
    l_principal VARCHAR2(20) := 'SCHEMA1'; --Replace the SCHEMA1 with your schema user name
begin
    DBMS_NETWORK_ACL_ADMIN.append_host_ace (
        host => '*',
        lower_port => 80,
        upper_port => 80,
        ace => xs$ace_type(privilege_list => xs$name_list('http'),
        principal_name => l_principal,
        principal_type => xs_acl.ptype_db));
 end;
 /
 
DECLARE
    l_principal VARCHAR2(20) := 'SCHEMA1'; --Replace the SCHEMA1 with your schema user name
begin
    DBMS_NETWORK_ACL_ADMIN.APPEND_HOST_ACE(
        host => '*',
        ace  =>  xs$ace_type(privilege_list => xs$name_list('connect', 'resolve'),
        principal_name => l_principal,
        principal_type => xs_acl.ptype_db));
end;
/
 
```
## TMM XA Library in Pl/SQL
The TMM library in Pl/SQL for XA provides a set of functions and stored procedures for a Database application to participate in an XA transaction coordinated by TMM.
The Library is available as a SQL file which needs to be executed before the application code is executed. This is a one time requirement.

## Step 1: Execute the TMM XA Library SQL
Connect to the Oracle Database using the Schema user that is registered with ORDS. You can connect using SQL Developer or SQLPlus. Run the tmmxa.sql.
This will create a set of Pl/SQL functions and Stored Procedures.

## Step 2: Build and Run the ORDS application 
- Create DDLs for tables and other database objects required for your application. Add required DMLs to insert default data.
- Create / Define a new REST module for your application.
- Create the required Pl/SQL functions and Stored Procedures for your application.  
- For every REST api, define a template and a handler.

### Handler Implementation Example
Follow the example below and perform the TODO steps in your application as shown in the example below.
The TmmStart function enables the XA transaction to be coordinated by TMM by making a REST call to TMM for enlisting the participant in the transaction and registering the callback REST apis.
The TmmStart function returns an object which provides an attribute that indicates whether the TmmStart function was successful and that the transaction can proceed ahead. 
Only when the value of the proceed attribute is greater than 0, the transaction should proceed further. Otherwise the function must return with a proper http status code.
#### proceed values:
- 0: proceed value of 0 means the TmmStart function was called within a TMM XA transaction but the XA initialization was not successful. Hence the application code should not proceed with the TMM XA transaction.
- 1: proceed value of 1 means the TmmStart function was called within a TMM XA transaction and the XA initialization was successful. Hence the application code should proceed as normal.
- 2: proceed value of 2 means there is no TMM XA transaction and the function has been executed within a local transaction. Hence the application code should proceed as normal.

The TmmEnd function must be called at the end after the business logic has been completely executed.
```sql
DECLARE

    restModuleName VARCHAR2(256):= 'accounts'; --provide a name for the REST Service Module
    restModuleBasePath VARCHAR2(256):= 'accounts'; --provide a path for the REST Service Base Path

BEGIN
    ORDS.define_module(
            p_module_name    => restModuleName,
            p_base_path      => restModuleBasePath,
            p_items_per_page => 0);
 
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
                        -- TODO 1) Set up the callBackUrl correctly. This is generally the base URL or path of the module. Example: http://localhost:50080/ords/ordstest/accounts;
                        l_callBackUrl  VARCHAR2(256) := OWA_UTIL.get_cgi_env(''X-APEX-BASE'') || ''accounts'';  
                        l_tmmReturn TmmReturn;
                        l_tmmReturn2 TmmReturn;
                        resManagerId VARCHAR2(256):= ''60720954-8842-9f7c-a383-8d24e14554b6''; --TODO: Provide a resource manager Id to uniquely identify the resource manager (database)
        
                        BEGIN
                            --TODO 2) Call TmmStart as shown below. All Other parameters than the callBackUrl must be passed as shown below.
                            l_tmmReturn := TmmStart(callBackUrl => l_callBackUrl, linkUrl => :linkUrl, requestId => :requestId, authorizationToken => :authorization, tmmTxToken => :tmmTxToken, resourceManagerId => resManagerId);
                             
                            --TODO 3) Check if the transaction should proceed further (value of l_tmmReturn.proceed is greater than 0) or not (value of l_tmmReturn.proceed is 0). Execute your business logic only if transaction can proceed further. If not, then return with an http error code. 
                            IF (l_tmmReturn.proceed > 0) THEN                   
                                
                                --TODO 4) Execute your business logic. Execute SQLs statements or call other functions or stored procedures.
                                doWithdraw(p_amount  => :amount, p_account_id  => :accountId);
                                
                                --TODO 5) Call TmmEnd at the end of the REST function.
                                l_tmmReturn2 := TmmEnd(p_xid => l_tmmReturn.xid);       

                                :status_code := 200;

                            ELSE
                                :status_code := 400; --bad request

                            END IF;

                        exception
                            when others then
                                HTP.p(''ERROR Code: '' || SQLCODE || '' : ERROR Message: '' || SQLERRM);
                                :status_code := 500;

                         END;',
            p_items_per_page => 0);


    --TODO 6) Create TMM Callback apis
    createTMMCallbacks(moduleName => restModuleName);

    --TODO 7) Register all Method Handlers that will participate in an XA transaction
    registerXaHandler(moduleName => restModuleName,
                      handlerPattern => ':accountId/withdraw',
                      handlerMethod => 'POST');

COMMIT;
END;
/
```

### Execute the application sql file
Connect to the Oracle Database using the Schema user that is registered with ORDS. You can connect using SQL Developer or SQLPlus. Run the application sql file.
This will create all database objects like tables, a set of Pl/SQL functions and Stored Procedures. Also, a REST module will be created along with all the REST apis.
The application is ready to serve REST api calls at this point.


## Test the Sample Application
- Check Balance for account account2
```bash
curl --location --request GET 'http://localhost:50080/ords/ordstest/accounts/account2'
```
- Call the Withdraw REST api for account account2 with an amount of 10
```bash
curl --location --request POST 'http://localhost:50080/ords/ordstest/accounts/account2/withdraw?amount=10'
```
- Check Balance for account account2 to verify if the withdraw function was successful
```bash
curl --location --request GET 'http://localhost:50080/ords/ordstest/accounts/account2'
```
- Call the Deposit REST api for account account2 with an amount of 10
```bash
curl --location --request POST 'http://localhost:50080/ords/ordstest/accounts/account2/deposit?amount=10'
```
- Check Balance for account account2 to verify if the deposit function was successful
```bash
curl --location --request GET 'http://localhost:50080/ords/ordstest/accounts/account2'
```

Note: The calls to withdraw and deposit REST apis in the above examples are executed in a local transaction.