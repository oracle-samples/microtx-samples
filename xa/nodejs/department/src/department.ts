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
import { Request, Response, Router } from 'express';
import { XATransactionMethod, XAConfig, XADataSource, TrmXAResource } from "@oracle/microtx/xa/xa";
import { TrmConfig } from "@oracle/microtx/util/trmutils";
import { asyncHandler } from "@oracle/microtx/util/asynchandler";
import { OracleXADataSource } from "@oracle/microtx/xa/oraxa";
import oracledb from 'oracledb';

// Init Router
const departmentSvcRouter = Router();

// Initialize TRM library properties
TrmConfig.init('./tmm.properties');

// Create Oracledb data source
import dbConfig from '../dbconfig'
const xaPds: XADataSource = new OracleXADataSource(dbConfig);
TrmXAResource.init(xaPds);
xaPds.getXAConnection()

// Provide resource endpoints that will participate in an XA transaction
const xaTransactionWithdraw: XATransactionMethod = new XATransactionMethod("/:id/withdraw");
const xaTransactionDeposit: XATransactionMethod = new XATransactionMethod("/:id/deposit");
const xaTransactionMethods: XATransactionMethod[] = [xaTransactionWithdraw, xaTransactionDeposit];
const xaConfig: XAConfig = new XAConfig(departmentSvcRouter, '/accounts', xaTransactionMethods);

departmentSvcRouter.get('/:id', asyncHandler(async (req: Request, resp: Response) => {
    await getAccountDetails(req, resp); //business logic
}));

departmentSvcRouter.post('/:id/deposit', asyncHandler(async (req: Request, resp: Response) => {
    await doDeposit(req, resp); //business logic
}));

departmentSvcRouter.post('/:id/withdraw', asyncHandler(async (req: Request, resp: Response) => {
    await doWithdraw(req, resp); //business logic
}));

async function getAccountDetails(req: Request, resp: Response) {
    let connection;
    try {
        connection = await TrmXAResource.getXaDS().getConnection();
        const options = {
            outFormat: oracledb.OUT_FORMAT_OBJECT,   // query result format
        };
        let result;
        result = await connection.execute('select * from accounts where account_id = :1', [req.params.id], options);
        if (result) {
            const accountDetails = result.rows[0];
            accountDetails['ACCOUNT_ID'] = accountDetails['ACCOUNT_ID'].toString('hex');
            resp.status(200).json(accountDetails);
        } else {
            resp.status(500).send("Could not fetch account details");
        }
    } catch (e: any) {
        console.error("Failed to fetch account details", e)
        resp.status(500).send();
    } finally {
        if (connection) {
            try {
                await connection.close();
            } catch (err: any) {
                console.error("Connection close error:" + err);
            }
        }
    }
}

async function doWithdraw(req: Request, resp: Response) {
    console.log(`Nodejs department Service withdraw() called`);
    let amount = 10;
    if (req.query.amount != null && typeof req.query.amount === 'string') {
        amount = parseInt(req.query.amount, 10);
    }
    /* Xa connection pool is created and managed by the TMM library and is present in the context property of req object 
    (available on endpoints that are part of a XA transaction) */
    try {
        await req.xaConnection.connection.execute('UPDATE accounts SET amount = amount - :1 where account_id = :2', [amount, req.params.id]);
        resp.status(200).send();
    } catch (e: any) {
        console.error("Failed to withdraw from account", req.params.id, e)
        resp.status(500).send();
    }
}

async function doDeposit(req: Request, resp: Response) {
    console.log(`Nodejs department Service deposit() called`);
    let amount = 10;
    if (req.query.amount != null && typeof req.query.amount === 'string') {
        amount = parseInt(req.query.amount, 10);
    }
    /* Xa connection pool is created and managed by the TMM library and is present in the context property of req object 
    (available on endpoints that are part of a XA transaction) */
    try {
        await req.xaConnection.connection.execute('UPDATE accounts SET amount = amount + :1 where account_id = :2', [amount, req.params.id]);
        resp.status(200).send();
    } catch (e: any) {
        console.error("Failed to deposit to account",req.params.id, e)
        resp.status(500).send();
    }
}

process
    .once('SIGTERM', xaPds.closeConnectionPool)
    .once('SIGINT',  xaPds.closeConnectionPool);

/******************************************************************************
 *                                     Export
 ******************************************************************************/

export default departmentSvcRouter;
