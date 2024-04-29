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
package com.oracle.tmm.corebanking;

import com.oracle.microtx.common.MicroTxConfig;
import lombok.extern.slf4j.Slf4j;
import oracle.ucp.jdbc.PoolDataSource;
import oracle.ucp.jdbc.PoolDataSourceFactory;
import oracle.ucp.jdbc.PoolXADataSource;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.ComponentScan;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Primary;

import java.sql.SQLException;

@Slf4j
@Configuration
@ComponentScan("com.oracle")
public class DatasourceConfigurations {

    @Value("${bank-datasource.url}")
    private String url;
    @Value("${bank-datasource.user}")
    private String username;
    @Value("${bank-datasource.password}")
    private String password;
    @Value("${bank-datasource.oracleucp.initial-pool-size}")
    private String initialPoolSize;
    @Value("${bank-datasource.oracleucp.min-pool-size}")
    private String minPoolSize;
    @Value("${bank-datasource.oracleucp.max-pool-size}")
    private String maxPoolSize;
    @Value("${bank-datasource.oracleucp.connection-driver-factory-class-name:oracle.jdbc.pool.OracleDataSource}")
    private String connectionFactoryClassName;

    @Value("${bank-datasource.oracleucp.xa-connection-driver-factory-class-name:oracle.jdbc.xa.client.OracleXADataSource}")
    private String xaConnectionFactoryClassName;

    /**
     * Datasource bean for local database operations
     */
    @Bean(name = "PoolDataSource")
    public PoolDataSource getPoolDataSource() {
        PoolDataSource pds = null;
        try {
            pds = PoolDataSourceFactory.getPoolDataSource();
            pds.setConnectionFactoryClassName(connectionFactoryClassName);
            pds.setURL(url);
            pds.setUser(username);
            pds.setPassword(password);
            pds.setMinPoolSize(Integer.valueOf(minPoolSize));
            pds.setInitialPoolSize(Integer.valueOf(initialPoolSize));
            pds.setMaxPoolSize(Integer.valueOf(maxPoolSize));
            pds.setValidateConnectionOnBorrow(true);
            pds.setInactiveConnectionTimeout(60);
            pds.setAbandonedConnectionTimeout(60);
        } catch (SQLException ea) {
            log.error("Error connecting to the database: " + ea.getMessage());
        }
        log.info("PoolDataSource initialized successfully.");
        return pds;
    }

    /**
     * XA datasource bean for distributed XA transactions
     */
    @Bean(name = "CBPoolXADataSource")
    @Primary
    public PoolXADataSource getXAPoolDataSource() {
        PoolXADataSource xapds = null;
        try {
            xapds = PoolDataSourceFactory.getPoolXADataSource();
            xapds.setConnectionFactoryClassName(xaConnectionFactoryClassName);
            xapds.setURL(url);
            xapds.setUser(username);
            xapds.setPassword(password);
            xapds.setMinPoolSize(Integer.valueOf(minPoolSize));
            xapds.setInitialPoolSize(Integer.valueOf(initialPoolSize));
            xapds.setMaxPoolSize(Integer.valueOf(maxPoolSize));
            xapds.setValidateConnectionOnBorrow(true);
            xapds.setInactiveConnectionTimeout(60);
            xapds.setAbandonedConnectionTimeout(60);

            MicroTxConfig.initXaDataSource(xapds);
        } catch (SQLException ea) {
            log.error("Error connecting to the database: {}", ea.getMessage());
        }
        log.info("PoolXADataSource initialized successfully.");
        return xapds;
    }
}
