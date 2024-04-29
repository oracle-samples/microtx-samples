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
package com.oracle.tmm.userbanking.resources.admin;

import com.oracle.tmm.userbanking.model.banking.*;
import com.oracle.tmm.userbanking.model.chart.BranchStats;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.HttpStatusCodeException;
import org.springframework.web.client.RestTemplate;

import javax.annotation.security.RolesAllowed;
import java.util.ArrayList;
import java.util.List;

@RestController
@RequestMapping(value = "/bankui-api/admin/banking")
@RolesAllowed({"BANK_ADMIN_ROLE"})
public class AdminBankingResource {

    @Value("${core-banking.endpoint}")
    String coreBankingEndpoint;

    @Autowired
    RestTemplate restTemplate;

    @PostMapping("openAccount")
    public OpenBankAccountResponse openAccount(@RequestBody AccountEntry accountEntry) {
        String url = coreBankingEndpoint.concat("/account/open");
        return restTemplate.postForObject(url, accountEntry, OpenBankAccountResponse.class);
    }

    @PostMapping("closeAccount")
    public CloseBankAccountResponse closeAccount(@RequestParam(name = "accountId") Integer accountId) {
        String url = coreBankingEndpoint.concat("/account/close?accountId={accountId}");
        return restTemplate.postForObject(url, null, CloseBankAccountResponse.class, accountId);
    }

    @GetMapping("transactions")
    public TransactionHistories getTransactions() {
        String url = coreBankingEndpoint.concat("/history/transactions");
        return restTemplate.getForObject(url, TransactionHistories.class);
    }

    @GetMapping("branchDetails")
    public Branches getBranchDetails() {
        String url = coreBankingEndpoint.concat("/branch/details");
        return restTemplate.getForObject(url, Branches.class);
    }

    @GetMapping("branches")
    public List<BranchUI> getBranches() {
        List<BranchUI> branchesUI = new ArrayList<>();
        String url = coreBankingEndpoint.concat("/branch/details");
        Branches branches = restTemplate.getForObject(url, Branches.class);
        branches.getBranches().stream()
                .forEach(branchEntry -> branchesUI.add(new BranchUI(branchEntry.getBranchId(), String.format("%s (%s)", branchEntry.getBranchName(), branchEntry.getBranchId()))));
        return branchesUI;
    }

    @GetMapping("userAccounts")
    public Accounts getUserDetails() {
        String url = coreBankingEndpoint.concat("/account/details");
        return restTemplate.getForObject(url, Accounts.class);
    }

    @GetMapping("branchStats")
    public List<BranchStats> getBranchStats() {
        String url = coreBankingEndpoint.concat("/branch/stats");
        return restTemplate.getForObject(url, List.class);
    }
}
