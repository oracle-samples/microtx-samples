//User Banking API's
var appContextPrefix = "/bankapp";

async function callAccountDetails(accountId) {
    return new Promise(function (resolve, reject) {
        var headers = {};
        headers['Accept'] = 'application/json';
        ;
        fetch(appContextPrefix + '/bankui-api/user/banking/accountDetails?accountId=' + accountId, {
            method: 'GET',
            headers: headers,
            mode: 'cors'
        })
            .then(resp => resp.json())
            .then((data) => {
                resolve(data)
            })
            .catch((error) => {
                reject(error)
            })
    })
}

async function callBranchDetails(branchId) {
    return new Promise(function (resolve, reject) {
        var headers = {};
        headers['Accept'] = 'application/json';

        fetch(appContextPrefix + '/bankui-api/user/banking/branchDetails?branchId=' + branchId, {
            method: 'GET',
            headers: headers,
            mode: 'cors'
        })
            .then(resp => resp.json())
            .then((data) => {
                resolve(data)
            })
            .catch((error) => {
                reject(error)
            })
    })
}

async function callGetRecipientAccountsForListing(selfAccountId) {
    return new Promise(function (resolve, reject) {
        var headers = {};
        headers['Accept'] = 'application/json';

        fetch(appContextPrefix + '/bankui-api/user/banking/recipientAccounts?selfAccountId=' + selfAccountId, {
            method: 'GET',
            headers: headers,
            mode: 'cors'
        })
            .then(resp => resp.json())
            .then((data) => {
                resolve(data)
            })
            .catch((error) => {
                reject(error)
            })
    })
}

async function callFundTransfer(transferDetails) {
    return new Promise(function (resolve, reject) {
        var headers = new Headers();
        headers.append('Accept', 'application/json');
        headers.append('Content-Type', 'application/json');

        var bodyPart = JSON.stringify(transferDetails);

        fetch(appContextPrefix + '/bankui-api/user/banking/fundTransfer', {
            method: 'POST',
            headers: headers,
            mode: 'cors',
            body: bodyPart
        })
            .then(resp => resp.json())
            .then((data) => {
                resolve(data)
            })
            .catch((error) => {
                reject(error)
            })
    })
}

async function callGetBalance(accountId) {
    return new Promise(function (resolve, reject) {
        var headers = {};
        headers['Accept'] = 'application/json';

        fetch(appContextPrefix + '/bankui-api/user/banking/balance?accountId=' + accountId, {
            method: 'GET',
            headers: headers,
            mode: 'cors'
        })
            .then(resp => resp.json())
            .then((data) => {
                resolve(data)
            })
            .catch((error) => {
                reject(error)
            })
    })
}

async function callGetBankTransactionHistory(accountId) {
    return new Promise(function (resolve, reject) {
        var headers = {};
        headers['Accept'] = 'application/json';

        fetch(appContextPrefix + '/bankui-api/user/banking/transactions?accountId=' + accountId, {
            method: 'GET',
            headers: headers,
            mode: 'cors'
        })
            .then(resp => resp.json())
            .then((data) => {
                resolve(data)
            })
            .catch((error) => {
                reject(error)
            })
    })
}

// StockBroker API's

async function callGetAvailableStocks() {
    return new Promise(function (resolve, reject) {
        var headers = {};
        headers['Accept'] = 'application/json';

        fetch(appContextPrefix + '/bankui-api/user/trading/stocks', {
            method: 'GET',
            headers: headers,
            mode: 'cors'
        })
            .then(resp => resp.json())
            .then((data) => {
                resolve(data)
            })
            .catch((error) => {
                reject(error)
            })
    })
}

async function callGetAvailableStocksForListing() {
    return new Promise(function (resolve, reject) {
        var headers = {};
        headers['Accept'] = 'application/json';

        fetch(appContextPrefix + '/bankui-api/user/trading/stocksUI', {
            method: 'GET',
            headers: headers,
            mode: 'cors'
        })
            .then(resp => resp.json())
            .then((data) => {
                resolve(data)
            })
            .catch((error) => {
                reject(error)
            })
    })
}

async function callGetUserStocks(accountId) {
    return new Promise(function (resolve, reject) {
        var headers = {};
        headers['Accept'] = 'application/json';

        fetch(appContextPrefix + '/bankui-api/user/trading/userStocks?accountId=' + accountId, {
            method: 'GET',
            headers: headers,
            mode: 'cors'
        })
            .then(resp => resp.json())
            .then((data) => {
                resolve(data)
            })
            .catch((error) => {
                reject(error)
            })
    })
}

async function callGetStockTransactions(accountId) {
    return new Promise(function (resolve, reject) {
        var headers = {};
        headers['Accept'] = 'application/json';

        fetch(appContextPrefix + '/bankui-api/user/trading/transactions?accountId=' + accountId, {
            method: 'GET',
            headers: headers,
            mode: 'cors'
        })
            .then(resp => resp.json())
            .then((data) => {
                resolve(data)
            })
            .catch((error) => {
                reject(error)
            })
    })
}

async function callPurchaseStocks(buyStockRequest) {
    return new Promise(function (resolve, reject) {
        var headers = new Headers();
        headers.append('Accept', 'application/json');
        headers.append('Content-Type', 'application/json');

        var bodyPart = JSON.stringify(buyStockRequest);

        fetch(appContextPrefix + '/bankui-api/user/trading/buyStocks', {
            method: 'POST',
            headers: headers,
            mode: 'cors',
            body: bodyPart
        })
            .then(resp => resp.json())
            .then((data) => {
                resolve(data)
            })
            .catch((error) => {
                reject(error)
            })
    })
}

async function callSellStocks(sellStockRequest) {
    return new Promise(function (resolve, reject) {
        var headers = new Headers();
        headers.append('Accept', 'application/json');
        headers.append('Content-Type', 'application/json');

        var bodyPart = JSON.stringify(sellStockRequest);

        fetch(appContextPrefix + '/bankui-api/user/trading/sellStocks', {
            method: 'POST',
            headers: headers,
            mode: 'cors',
            body: bodyPart
        })
            .then(resp => resp.json())
            .then((data) => {
                resolve(data)
            })
            .catch((error) => {
                reject(error)
            })
    })
}


///////////////////////////////////////////////////////////////////////////////////////////

async function callGetServiceWithOneParam(serviceName, paramName, paramValue) {
    return new Promise(function (resolve, reject) {
        var headers = {};
        headers['Content-Type'] = 'application/json';

        fetch(UTIL.server_url + serviceName + '?' + paramName + '=' + paramValue, {
            method: 'GET',
            headers: headers,
            mode: 'cors'
        })
            .then(resp => resp.json())
            .then((data) => {
                resolve(data)
            })
            .catch((error) => {
                reject(error)
            })
    })
}

async function callPostService(serviceName, input) {
    return new Promise(function (resolve, reject) {
        var headers = {};
        headers['Content-Type'] = 'application/json';

        var bodyPart = JSON.stringify(input);

        fetch(UTIL.server_url + serviceName, {
            method: 'POST',
            headers: headers,
            mode: 'cors',
            body: bodyPart
        })
            .then(resp => resp.json())
            .then((data) => {
                resolve(data)
            })
            .catch((error) => {
                reject(error)
            })
    })
}

async function callPostServiceReturnString(serviceName, input) {
    return new Promise(function (resolve, reject) {
        var headers = {};
        headers['Content-Type'] = 'application/json';

        var bodyPart = JSON.stringify(input);

        fetch(UTIL.server_url + serviceName, {
            method: 'POST',
            headers: headers,
            mode: 'cors',
            body: bodyPart
        })
            .then(resp => resp.text())
            .then((data) => {
                resolve(data)
            })
            .catch((error) => {
                reject(error)
            })
    })
}

function setSession(key, value) {
    sessionStorage.setItem(key, value);
}

function getSession(key) {
    return sessionStorage.getItem(key);
}

function isNoDataInSession(key) {
    var data = sessionStorage.getItem(key);
    return data === undefined || data === null || data === '';
}

function setJSONSession(key, value) {
    sessionStorage.setItem(key, JSON.stringify(value));
}

function getJSONSession(key) {
    return JSON.parse(sessionStorage.getItem(key));
}

var UTIL = {
    server_url: "http://127.0.0.1:7101/Schedule/jersey/ScheduleServices/",
    app_name: "Scheduler Management System",
    customer_name: "Company",
    env_name: "DV",

    message_timeout: 2000,

    translate: function (key) {
        if (key && key.trim().length > 0) {
            return oj.Translations.getTranslatedString(key);
        }
    }
}