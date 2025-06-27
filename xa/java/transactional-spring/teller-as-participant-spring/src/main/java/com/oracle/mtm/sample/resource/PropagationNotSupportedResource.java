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
package com.oracle.mtm.sample.resource;

import com.oracle.mtm.sample.service.TransferFeeService;
import com.oracle.mtm.sample.helpers.NotificationHelpers;
import com.oracle.mtm.sample.helpers.TransferHelpers;
import com.oracle.mtm.sample.entity.Fee;
import com.oracle.mtm.sample.entity.Transfer;
import com.oracle.mtm.sample.exception.CustomCheckedException1;
import com.oracle.mtm.sample.exception.CustomCheckedException2;
import com.oracle.mtm.sample.exception.CustomUnCheckedException;
import io.swagger.v3.oas.annotations.OpenAPIDefinition;
import io.swagger.v3.oas.annotations.info.Info;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Component;
import org.springframework.transaction.TransactionException;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.context.annotation.RequestScope;
import org.springframework.web.util.UriComponentsBuilder;

import java.net.URI;
import java.net.URISyntaxException;
import java.sql.SQLException;

@RestController
@RequestMapping("/containermanagedtxn")
@OpenAPIDefinition(info = @Info(title = "Amount Transfer endpoint", version = "1.0"))
@Component
@RequestScope
public class PropagationNotSupportedResource {

    @Autowired
    @Qualifier("MicroTxXaRestTemplate")
    RestTemplate restTemplate;
    private static final Logger LOG = LoggerFactory.getLogger(PropagationNotSupportedResource.class);

    @Value("${departmentOneEndpoint}")
    String departmentOneEndpoint;

    @Value("${departmentTwoEndpoint}")
    String departmentTwoEndpoint;

    @Autowired
    private TransferHelpers transferHelpers;

    @Autowired
    private NotificationHelpers notificationHelpers;

    @Autowired
    private TransferFeeService transferFeeService;

    @RequestMapping(value = "NOT_SUPPORTED/outsideContext", method = RequestMethod.POST)
    public ResponseEntity<?> transferTransactionalNotSupportsOC(@RequestBody Transfer transferDetails) {
        ResponseEntity<?> withdrawResponse = transferHelpers.withdrawNotSupportedOC_AnnotatedRequiresNew(transferDetails);
        ResponseEntity<?> depositResponse = transferHelpers.depositNotSupportedOC_AnnotatedRequiresNew(transferDetails);
        ResponseEntity<?> emailResponse = notificationHelpers.emailNotifyNotSupportedOC_AnnotatedNotSupported(transferDetails);
        if (withdrawResponse.getStatusCode().is2xxSuccessful() && depositResponse.getStatusCode().is2xxSuccessful() 
        && emailResponse.getStatusCode().is2xxSuccessful()){
            return ResponseEntity.ok("Transfer completed successfully");
        }
        throw new RuntimeException("Transfer failed ");

    }

    @RequestMapping(value = "NOT_SUPPORTED/insideContext", method = RequestMethod.POST)
    @Transactional(propagation = Propagation.REQUIRED)
    public ResponseEntity<?> transferTransactionalNotSupportsIC(@RequestBody Transfer transferDetails){
        ResponseEntity<?> withdrawResponse = transferHelpers.withdrawNotSupportedIC_AnnotatedMandatory(transferDetails);
        ResponseEntity<?> depositResponse = transferHelpers.depositNotSupportedIC_AnnotatedSupports(transferDetails);
        ResponseEntity<?> emailResponse = notificationHelpers.emailNotifyNotSupportedIC_AnnotatedNotSupported(transferDetails);
        if (withdrawResponse.getStatusCode().is2xxSuccessful() && depositResponse.getStatusCode().is2xxSuccessful() 
        && emailResponse.getStatusCode().is2xxSuccessful()){
            return ResponseEntity.ok("Transfer completed successfully");
        }
        throw new RuntimeException("Transfer failed ");

    }
}