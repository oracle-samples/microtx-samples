var appContextPrefix ="/bankapp";

async function callAdminGetBankTransactionHistory() {
    return new Promise(function (resolve, reject) {
        var headers = {};
        headers['Accept'] = 'application/json';

        fetch(appContextPrefix + '/bankui-api/admin/banking/transactions', {
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

async function callGetBranchStats() {
    return new Promise(function (resolve, reject) {
        var headers = {};
        headers['Accept'] = 'application/json';

        fetch(appContextPrefix + '/bankui-api/admin/banking/branchStats', {
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

async function callGetBranchDetails() {
    return new Promise(function (resolve, reject) {
        var headers = {};
        headers['Accept'] = 'application/json';

        fetch(appContextPrefix + '/bankui-api/admin/banking/branchDetails', {
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

async function callGetBranches() {
    return new Promise(function (resolve, reject) {
        var headers = {};
        headers['Accept'] = 'application/json';

        fetch(appContextPrefix + '/bankui-api/admin/banking/branches', {
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


async function callGetUserAccounts() {
    return new Promise(function (resolve, reject) {
        var headers = {};
        headers['Accept'] = 'application/json';

        fetch(appContextPrefix + '/bankui-api/admin/banking/userAccounts', {
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

async function callOpenAccount(openBankAccountRequest) {
    return new Promise( function (resolve, reject) {
        var headers = new Headers();
        headers.append('Accept', 'application/json');
        headers.append('Content-Type', 'application/json');

        var bodyPart = JSON.stringify(openBankAccountRequest);

        fetch(appContextPrefix + '/bankui-api/admin/banking/openAccount', {
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

async function callCloseAccount(accountId) {
    return new Promise( function (resolve, reject) {
        var headers = new Headers();
        headers.append('Accept', 'application/json');
        headers.append('Content-Type', 'application/json');

        fetch(appContextPrefix + '/bankui-api/admin/banking/closeAccount?accountId='+accountId, {
            method: 'POST',
            headers: headers,
            mode: 'cors',
            body: null
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

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

async function callGetService(serviceName) {
    return new Promise(function (resolve, reject) {
        var headers = {};
        headers['Content-Type'] = 'application/json';

        fetch(UTIL.server_url + serviceName, {
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