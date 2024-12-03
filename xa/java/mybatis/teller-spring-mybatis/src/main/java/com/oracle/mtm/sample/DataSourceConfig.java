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
 
package com.oracle.mtm.sample;

import com.oracle.microtx.common.MicroTxConfig;
import com.oracle.microtx.xa.mybatis.MicroTxSqlSessionFactory;
import com.oracle.microtx.xa.mybatis.MicroTxTransactionFactory;
import com.oracle.mtm.sample.mappers.xa.FeeMapperXA;
import oracle.tmm.jta.common.DataSourceInfo;
import oracle.ucp.jdbc.PoolDataSource;
import oracle.ucp.jdbc.PoolDataSourceFactory;
import oracle.ucp.jdbc.PoolXADataSource;
import org.apache.ibatis.mapping.Environment;
import org.apache.ibatis.transaction.TransactionFactory;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.ComponentScan;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Primary;

import javax.sql.DataSource;
import javax.sql.XADataSource;
import java.sql.SQLException;

@Configuration
@ComponentScan("com.oracle")
public class DataSourceConfig {
    @Value("${feeDataSource.url}")
    private String url;
    @Value("${feeDataSource.user}")
    private String username;
    @Value("${feeDataSource.password}")
    private String password;
    @Value("${feeDataSource.oracleucp.min-pool-size}")
    private String minPoolSize;
    @Value("${feeDataSource.oracleucp.initial-pool-size:10}")
    private String initialPoolSize;

    @Value("${feeDataSource.oracleucp.max-pool-size}")
    private String maxPoolSize;

    @Value("${feeDataSource.oracleucp.data-source-name}")
    private String dataSourceName;

    @Value("${data-source-name:UCPDatasourceXA}")
    private String xaDataSourceName;

    @Value("${feeDataSource.oracleucp.connection-pool-name:nonxaConnectionPool}")
    private String connectionPoolName;

    @Value("${departmentDataSource.oracleucp.connection-pool-name:xaConnectionPool}")
    private String xaConnectionPoolName;

    @Value("${oracleucp.connection-factory-class-name:oracle.jdbc.pool.OracleDataSource}")
    private String connectionFactoryClassName;

    @Value("${oracleucp.connection-factory-class-name:oracle.jdbc.xa.client.OracleXADataSource}")
    private String xaConnectionFactoryClassName;

    @Value("${spring.microtx.xa-resource-manager-id}")
    private String resourceManagerId;

    private static final Logger logger = LoggerFactory.getLogger(DataSourceConfig.class);

    @Bean(name = "ucpDataSourceNonXA")
    public DataSource getDataSource() {
        PoolDataSource pds = null;
        try {
            pds = PoolDataSourceFactory.getPoolDataSource();
            logger.info("Using dbConnectionString {}", url);
            pds.setConnectionFactoryClassName(connectionFactoryClassName);
            pds.setURL(url);
            pds.setUser(username);
            pds.setPassword(password);
            pds.setMinPoolSize(Integer.valueOf(minPoolSize));
            pds.setInitialPoolSize(Integer.valueOf(initialPoolSize));
            pds.setMaxPoolSize(Integer.valueOf(maxPoolSize));

            pds.setLoginTimeout(60);
            pds.setMaxConnectionReuseCount(Integer.valueOf(1000));
            pds.setConnectionWaitTimeout(300);

            pds.setValidateConnectionOnBorrow(true);
            pds.setSQLForValidateConnection("select 1 from dual");
            pds.setInactiveConnectionTimeout(Integer.valueOf(120));
            pds.setAbandonedConnectionTimeout(Integer.valueOf(120));

            pds.setMaxIdleTime(Integer.valueOf(60));

            pds.setMaxStatements(100);

            pds.setDataSourceName(dataSourceName);
            pds.setConnectionPoolName(connectionPoolName);

            logger.info("UCP DataSource created");
        } catch (SQLException ex) {
            logger.error("Error connecting to the database: {}", ex.getMessage());
        }
        return pds;
    }

    @Bean(name = "ucpXADataSource")
    @Primary
    public DataSource getXADataSource() {
        PoolXADataSource pds = null;
        try {
            pds = PoolDataSourceFactory.getPoolXADataSource();

            ((PoolXADataSource) pds).setConnectionFactoryClassName(xaConnectionFactoryClassName);
            ((PoolXADataSource) pds).setURL(url);
            ((PoolXADataSource) pds).setUser(username);
            ((PoolXADataSource) pds).setPassword(password);

            ((PoolXADataSource) pds).setMinPoolSize(Integer.valueOf(minPoolSize));
            ((PoolXADataSource) pds).setInitialPoolSize(Integer.valueOf(initialPoolSize));
            ((PoolXADataSource) pds).setMaxPoolSize(Integer.valueOf(maxPoolSize));

            ((PoolXADataSource) pds).setDataSourceName(xaDataSourceName);
            ((PoolXADataSource) pds).setConnectionPoolName(xaConnectionPoolName);
            ((PoolXADataSource) pds).setLoginTimeout(60);
            ((PoolXADataSource) pds).setMaxConnectionReuseCount(1000);
            ((PoolXADataSource) pds).setConnectionWaitTimeout(300);
            ((PoolXADataSource) pds).setValidateConnectionOnBorrow(true);
            ((PoolXADataSource) pds).setSQLForValidateConnection("select 1 from dual");
            ((PoolXADataSource) pds).setInactiveConnectionTimeout(120);
            ((PoolXADataSource) pds).setAbandonedConnectionTimeout(120);
            ((PoolXADataSource) pds).setMaxIdleTime(60);
            ((PoolXADataSource) pds).setMaxStatements(100);

            initializeMicroTx(pds);
            logger.info("XADataSourceConfig: XADataSource created");

        } catch (SQLException ex) {
            logger.error("Error connecting to the database: " + ex.getMessage());
        }
        return pds;
    }

    public void initializeMicroTx(DataSource xaDataSource) {
        TransactionFactory transactionFactory = new MicroTxTransactionFactory();
        Environment environment = new Environment("MicroTxXAEnv", transactionFactory, xaDataSource);
        org.apache.ibatis.session.Configuration configuration = new org.apache.ibatis.session.Configuration(environment);
        configuration.addMapper(FeeMapperXA.class);
        MicroTxSqlSessionFactory sqlSessionFactory = new MicroTxSqlSessionFactory(configuration);

        DataSourceInfo dataSourceInfo = new DataSourceInfo(resourceManagerId);
        dataSourceInfo.setDataSourceName(xaDataSourceName);
        dataSourceInfo.setMicroTxSqlSessionFactory(sqlSessionFactory);

        MicroTxConfig.initXaDataSource((XADataSource) xaDataSource, dataSourceInfo);
    }
}
