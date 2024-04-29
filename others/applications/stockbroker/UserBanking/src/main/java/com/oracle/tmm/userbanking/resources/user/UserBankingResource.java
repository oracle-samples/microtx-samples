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
package com.oracle.tmm.userbanking.resources.user;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.oracle.tmm.userbanking.model.banking.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.HttpStatusCodeException;
import org.springframework.web.client.RestTemplate;

import java.util.ArrayList;
import java.util.List;

@RestController
@RequestMapping(value = "/bankui-api/user/banking")
public class UserBankingResource {

    @Value("${core-banking.endpoint}")
    String coreBankingEndpoint;

    @Autowired
    RestTemplate restTemplate;

    private ObjectMapper objectMapper = new ObjectMapper();

    @GetMapping("accountDetails")
    public Account getAccountDetails(@RequestParam(name = "accountId") Integer accountId) {
        String url = coreBankingEndpoint.concat("/account/details?accountId={accountId}");
        Account account = restTemplate.getForObject(url, Account.class, accountId);
        account.setSsn(account.getSsn().replaceAll("\\d{3}-\\d{2}-(?=\\d{4})", "XXX-XX-"));
        return account;
    }

    @GetMapping("branchDetails")
    public Branch getBranchDetails(@RequestParam(name = "branchId") Integer branchId) {
        String url = coreBankingEndpoint.concat("/branch/details?branchId={branchId}");
        return restTemplate.getForObject(url, Branch.class, branchId);
    }

    @GetMapping("recipientAccounts")
    public List<RecipientAccountUI> getRecipientAccounts(@RequestParam(name = "selfAccountId") Integer selfAccountId) {
        List<RecipientAccountUI> recipientAccounts = new ArrayList<>();
        String url = coreBankingEndpoint.concat("/account/details");
        Accounts accounts = restTemplate.getForObject(url, Accounts.class);
        accounts.getAccounts()
                .stream().filter(accountEntry -> !accountEntry.getAccountNumber().equals(selfAccountId))
                .forEach(accountEntry -> {
                    String userNameWithAccountNumber = String.format("%s (%s %s)", accountEntry.getAccountNumber(), accountEntry.getFirstName(), accountEntry.getLastName());
                    recipientAccounts.add(new RecipientAccountUI(accountEntry.getAccountNumber(), userNameWithAccountNumber));
                });
        return recipientAccounts;
    }

    @PostMapping("fundTransfer")
    public TransferResponse fundTransfer(@RequestBody FundTransfer fundTransfer) {
        String url = coreBankingEndpoint.concat("/transaction/transfer");
        TransferResponse transferResponse = null;
        try {
            transferResponse = restTemplate.postForObject(url, fundTransfer, TransferResponse.class);
        } catch (HttpStatusCodeException e) {
            try {
                transferResponse = objectMapper.readValue(e.getResponseBodyAsString(), TransferResponse.class);
            } catch (JsonProcessingException ex) {
                transferResponse.setMessage(ex.getMessage());
            }
        }
        return transferResponse;
    }

    @GetMapping("balance")
    public BalanceResponse getAccountBalance(@RequestParam(name = "accountId") Integer accountId) {
        String url = coreBankingEndpoint.concat("/transaction/balanceEnquiry?accountId={accountId}");
        return restTemplate.getForObject(url, BalanceResponse.class, accountId);
    }

    @GetMapping("transactions")
    public TransactionHistories getTransactions(@RequestParam(name = "accountId") Integer accountId) {
        String url = coreBankingEndpoint.concat("/history/transactions?accountId={accountId}");
        return restTemplate.getForObject(url, TransactionHistories.class, accountId);
    }

}
