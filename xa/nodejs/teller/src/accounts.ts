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
import { NextFunction, Request, Response, Router } from 'express';
const axios = require('axios').default;
import { asyncHandler } from "tmmlib-node/util/asynchandler";
import { TrmUserTransaction } from "tmmlib-node/xa/xatxn";
import { TmsClientUtil, TrmConfig } from "tmmlib-node/util/trmutils";

// Init Router
const accountsSvcRouter = Router();
const DEPARTMENT_A_ENDPOINT = process.env.DEPARTMENTONEENDPOINT || "http://localhost:8085";
const DEPARTMENT_B_ENDPOINT = process.env.DEPARTMENTTWOENDPOINT || "http://localhost:8082";
const SERVICE_NAME: string = process.env.SERVICE_NAME || "Accounts";
// Initialize TRM library properties
TrmConfig.init('./tmm.properties')

/**
 * Endpoint that transfers amount from department A to department B
 */
accountsSvcRouter.post('/transfers', asyncHandler(async (req: Request, resp: Response, next: NextFunction) => {
    console.log("Node.js TRM XA Client Demo: start transaction");
    // Start a new transaction
    let ut: TrmUserTransaction = new TrmUserTransaction();
    await ut.begin(req);
    try {
        // Execute the function (second argument) in the context of the created transaction
        await ut.execute(req, transfer, req, resp, ut, DEPARTMENT_A_ENDPOINT, DEPARTMENT_B_ENDPOINT);
        // commit the transaction
        await ut.commit(req);
        resp.status(200).send("Transfer Completed. ");
    } catch (e: any) {
        console.error("ERROR:", e.message);
        // Rollback the transaction incase of error
        await ut.rollback(req);
        resp.status(500).send(e.message)
    }
}));

async function transfer(req: Request, resp: Response, ut: TrmUserTransaction, fromService: string, toService: string) {
    await withdraw(fromService, req);
    await deposit(toService, req);
}

async function withdraw(fromService: string, req: Request): Promise<void> {
    console.log(`Nodejs ${SERVICE_NAME} Service withdraw() called`);
    const accountId = req.body.from;
    const amount = req.body.amount;
    // Construct the endpoint of the department service for withdrawal 
    let svcEndpoint = new URL(fromService);
    if (svcEndpoint.pathname && svcEndpoint.pathname.length > 1) {
        svcEndpoint.pathname = svcEndpoint.pathname + `/accounts/${accountId}/withdraw`;
    }
    else {
        svcEndpoint.pathname = `/accounts/${accountId}/withdraw`;
    }
    svcEndpoint.searchParams.append("amount", amount);
    console.log(`Withdraw URL [${svcEndpoint.toString()}]`);

    try {
        const config = {
            method: 'post',
            url: svcEndpoint.toString(),
            headers: {
                'Content-Type': 'application/json',
            }
        };
        let resp = await axios(config);
        console.log(`withdraw [${svcEndpoint}] response: ${resp.status}  ${resp.data}`);
        if (resp.status != 200 && resp.status != 201) {
            throw new Error("Failed to withdraw");
        }
    } catch (e: any) {
        console.log("Withdraw error:", e);
        console.log("Withdraw error details:", JSON.stringify(e, ["message", "arguments", "type", "name"]));
        throw new Error("Withdraw exception: " + e.message);
    }
}

async function deposit(toService: string, req: Request): Promise<void> {
    console.log(`Nodejs ${SERVICE_NAME} Service deposit() called`);
    const accountId = req.body.to;
    const amount = req.body.amount;
    // Construct the endpoint of the department service for deposit 
    let svcEndpoint = new URL(toService);
    if (svcEndpoint.pathname && svcEndpoint.pathname.length > 1) {
        svcEndpoint.pathname = svcEndpoint.pathname + `/accounts/${accountId}/deposit`;
    }
    else {
        svcEndpoint.pathname = `/accounts/${accountId}/deposit`;
    }
    svcEndpoint.searchParams.append("amount", amount);
    console.log(`Deposit URL [${svcEndpoint.toString()}]`);
    try {
        const config = {
            method: 'post',
            url: svcEndpoint.toString(),
            headers: {
                'Content-Type': 'application/json',
            }
        };
        let resp = await axios(config);
        console.log(`deposit [${svcEndpoint}] response: ${resp.status}  ${resp.data}`);
        if (resp.status != 200 && resp.status != 201) {
            throw new Error("Failed to deposit");
        }

    } catch (e) {
        console.log("Deposit error:", e);
        console.log("Deposit error details:", JSON.stringify(e, ["message", "arguments", "type", "name"]));
        throw new Error("Deposit exception");
    }
}

/******************************************************************************
 *                                     Export
 ******************************************************************************/

export default accountsSvcRouter;