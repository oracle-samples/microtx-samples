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
package com.oracle.teller.service;

import com.oracle.teller.entity.Fee;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.ApplicationContext;
import org.springframework.stereotype.Component;
import org.springframework.web.context.annotation.RequestScope;

import jakarta.persistence.EntityManager;
import java.sql.SQLException;

@Component
@RequestScope
public class TransferFeeService {

    private EntityManager feeEntityManager;
    @Autowired
    FeeRepository feeRepository;

    private ApplicationContext applicationContext;

    private static final Logger LOG = LoggerFactory.getLogger(TransferFeeService.class);

    @Autowired
    public TransferFeeService(ApplicationContext applicationContext) {
        this.applicationContext = applicationContext;
        try {
            feeEntityManager =  (EntityManager) applicationContext.getBean("microTxEntityManager", "deptxadatasource");
        } catch (ClassCastException ex) {
            LOG.info(ex.getMessage());
        }
    }
    public TransferFeeService(){

    }

    public boolean depositFee(String accountId, double amount) throws SQLException {

        Fee fee = feeRepository.findByAccountId(accountId,feeEntityManager);
        if(fee != null){
            fee.setAmount(fee.getAmount() + amount);
            fee = feeEntityManager.merge(fee);
            feeEntityManager.flush();
            return true;
        }
        return false;
    }
}