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
package com.oracle.tmm.corebanking.resource;


import com.oracle.tmm.corebanking.domain.AccountBranchDetails;
import com.oracle.tmm.corebanking.domain.Branch;
import com.oracle.tmm.corebanking.domain.chart.BranchStats;
import com.oracle.tmm.corebanking.domain.response.ErrorResponse;
import com.oracle.tmm.corebanking.services.IBranchService;
import io.swagger.v3.oas.annotations.OpenAPIDefinition;
import io.swagger.v3.oas.annotations.info.Info;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.sql.SQLException;
import java.util.List;
import java.util.Objects;

@RestController
@RequestMapping("branch")
@OpenAPIDefinition(info = @Info(title = "Account Resource endpoint", version = "1.0"))
@Slf4j
public class BranchResource {

    @Autowired
    IBranchService branchService;

    @RequestMapping(value = "details", method = RequestMethod.GET, produces = {MediaType.APPLICATION_JSON_VALUE})
    public ResponseEntity<?> branchDetails(@RequestParam(value = "branchId", required = false) Integer branchId) {
        try {
            if (Objects.isNull(branchId)) {
                return ResponseEntity.ok()
                        .body(branchService.branchDetails());
            }
            Branch branch = branchService.branchDetails(branchId);
            if (Objects.nonNull(branch)) {
                return ResponseEntity.ok()
                        .body(branch);
            }
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(ErrorResponse.builder().errorMessage(String.format("Branch {%s} does not exist.", branchId)).build());

        } catch (SQLException e) {
            return ResponseEntity.internalServerError()
                    .body(ErrorResponse.builder().errorMessage(e.getMessage()).build());
        }
    }

    @RequestMapping(value = "lookup", method = RequestMethod.GET, produces = {MediaType.APPLICATION_JSON_VALUE})
    public ResponseEntity<?> getBranchDetailsByUserAccount(@RequestParam("accountId") Integer accountId) {
        try {
            AccountBranchDetails accountBranchDetails = branchService.getBranchDetailsByUserAccount(accountId);
            if (Objects.nonNull(accountBranchDetails)) {
                return ResponseEntity.ok()
                        .body(accountBranchDetails);
            }
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(ErrorResponse.builder().errorMessage("Account details not found for given account.").build());
        } catch (SQLException e) {
            return ResponseEntity.internalServerError()
                    .body(ErrorResponse.builder().errorMessage(e.getMessage()).build());
        }
    }

    @RequestMapping(value = "stats", method = RequestMethod.GET, produces = {MediaType.APPLICATION_JSON_VALUE})
    public ResponseEntity<?> getBranchStats() {
        try {
            List<BranchStats> branchStats = branchService.getBranchStats();
            return ResponseEntity.ok()
                    .body(branchStats);
        } catch (SQLException e) {
            return ResponseEntity.internalServerError()
                    .body(ErrorResponse.builder().errorMessage(e.getMessage()).build());
        }
    }
}
