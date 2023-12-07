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

import oracle.tmm.common.TrmConfig;
import oracle.tmm.jta.common.DataSourceInfo;
import oracle.tmm.jta.common.TrmXAResourceType;
import oracle.ucp.jdbc.PoolDataSourceFactory;
import oracle.ucp.jdbc.PoolXADataSource;
import org.eclipse.microprofile.config.inject.ConfigProperty;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import jakarta.enterprise.context.ApplicationScoped;
import jakarta.enterprise.context.Initialized;
import jakarta.enterprise.event.Observes;
import jakarta.inject.Inject;
import java.lang.invoke.MethodHandles;
import java.sql.SQLException;

@ApplicationScoped
public class Configuration {

    private PoolXADataSource dataSource;

    private PoolXADataSource creditdataSource;
    final static Logger logger = LoggerFactory.getLogger(MethodHandles.lookup().lookupClass());

    @Inject
    @ConfigProperty(name = "departmentDataSource.url")
    String url;

    @Inject
    @ConfigProperty(name = "departmentDataSource.user")
    String user;

    @Inject
    @ConfigProperty(name = "departmentDataSource.password")
    String password;

    @Inject
    @ConfigProperty(name = "departmentDataSource.rmid")
    String rmid;

    @Inject
    @ConfigProperty(name = "creditDataSource.url")
    String creditUrl;

    @Inject
    @ConfigProperty(name = "creditDataSource.user")
    String creditUser;

    @Inject
    @ConfigProperty(name = "creditDataSource.password")
    String creditPassword;

    @Inject
    @ConfigProperty(name = "creditDataSource.rmid")
    String creditRmid;

    private void init(@Observes @Initialized(ApplicationScoped.class) Object event) {
        initialiseDataSource();
    }

    /**
     * Initializes the datasource into the TMM library that manages the lifecycle of the XA transaction
     *
     */
    private void initialiseDataSource() {
        try {

            DataSourceInfo departmentDataSourceInfo = new DataSourceInfo(rmid);
            departmentDataSourceInfo.setDataSourceName("departmentDataSource");
            this.dataSource = PoolDataSourceFactory.getPoolXADataSource();
            this.dataSource.setURL(url);
            this.dataSource.setUser(user);
            this.dataSource.setPassword(password);
            this.dataSource.setConnectionFactoryClassName("oracle.jdbc.xa.client.OracleXADataSource");
            this.dataSource.setMaxPoolSize(15);

            TrmConfig.initXaDataSource(this.dataSource,departmentDataSourceInfo);

        } catch (SQLException e) {
            logger.error("Failed to initialise "+ rmid +" database");
        }

        try {

            DataSourceInfo creditDataSouceInfo = new DataSourceInfo(creditRmid);
            creditDataSouceInfo.setDataSourceName("creditDataSource");

            this.creditdataSource = PoolDataSourceFactory.getPoolXADataSource();
            this.creditdataSource.setURL(creditUrl);
            this.creditdataSource.setUser(creditUser);
            this.creditdataSource.setPassword(creditPassword);
            this.creditdataSource.setConnectionFactoryClassName("oracle.jdbc.xa.client.OracleXADataSource");
            this.creditdataSource.setMaxPoolSize(15);
            TrmConfig.initXaDataSource(this.creditdataSource,creditDataSouceInfo);
        } catch (SQLException e) {
            logger.error("Failed to initialise "+ creditRmid +" database");
        }
    }

    public PoolXADataSource getDatasource() {
        return dataSource;
    }
}