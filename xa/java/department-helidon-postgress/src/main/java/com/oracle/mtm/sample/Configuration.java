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
import org.postgresql.xa.PGXADataSource;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import jakarta.enterprise.context.ApplicationScoped;
import jakarta.enterprise.context.Initialized;
import jakarta.enterprise.event.Observes;
import jakarta.inject.Inject;
import java.lang.invoke.MethodHandles;
import java.net.URI;
import java.net.URISyntaxException;
import java.util.HashMap;
import java.util.Map;


@ApplicationScoped
public class Configuration {

    private PGXADataSource dataSource;
    private PoolXADataSource poolXADataSource;
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

    private void init(@Observes @Initialized(ApplicationScoped.class) Object event) {
        initializePostgreSQLXADataSource();
    }

    /**
     * Initializes the datasource into the TMM library that manages the lifecycle of the XA transaction
     */
    private void initializePostgreSQLXADataSource() {
        try {
            Map<String, String> jdbcMetadata = getDataSourceMetadata(url);
            this.dataSource = new PGXADataSource();
            this.dataSource.setURL(url);
            this.dataSource.setUser(user);
            this.dataSource.setPassword(password);
            this.dataSource.setDatabaseName(jdbcMetadata.get("databaseName"));
            this.dataSource.setServerName(jdbcMetadata.get("serverName"));
            this.dataSource.setPortNumber(Integer.valueOf(jdbcMetadata.get("port")));

            TrmConfig.initXaDataSource(this.dataSource);
        } catch (Exception e) {
            logger.error("Failed to initialize database");
        }
    }

    public PGXADataSource getDatasource() {
        return dataSource;
    }

    private Map<String, String> getDataSourceMetadata(String jdbcURL) {
        try {
            URI uri = new URI(jdbcURL.replace("jdbc:", ""));
            return new HashMap<>(){{
                put("serverName", uri.getHost());
                put("port", String.valueOf(uri.getPort()));
                put("databaseName", uri.getPath().replace("/", ""));
            }};
        } catch (URISyntaxException e) {
            throw new RuntimeException("Invalid Postgres JDBC connection string. Expected format : jdbc:postgresql://<postgres-server-host>:<port>/<database>", e);
        }
    }

    /**
     * To use connection pooling with postgres, uncomment below methods [ initializePostgreSQLXADataSource() and getDatasource() ] .
     * And comment out above existing initializePostgreSQLXADataSource() and  getDatasource().
     *
     * Note: Connection pool being used here is Oracle UCP
     * Current parameters like database URL, user and password has to be set in application.yaml. Along with that user need to take care of
     * setting databaseName, serverName and serverPort explicitly in UCP parameters as shown in below method
     */
/*
    private void initializePostgreSQLXADataSource() {
        try {
            this.poolXADataSource = PoolDataSourceFactory.getPoolXADataSource();
            this.poolXADataSource.setConnectionFactoryClassName("org.postgresql.xa.PGXADataSource");
            this.poolXADataSource.setURL(url);
            this.poolXADataSource.setUser(user);
            this.poolXADataSource.setPassword(password);

            this.poolXADataSource.setDatabaseName(databaseName); // example: department
            this.poolXADataSource.setServerName(serverName); // serverName: localhost or FQDN of postgres database host
            this.poolXADataSource.setPortNumber(serverPort); // server port which postgres is running. ex: 5432

            this.poolXADataSource.setInitialPoolSize(10);
            this.poolXADataSource.setMinPoolSize(20);
            this.poolXADataSource.setLoginTimeout(60);
            this.poolXADataSource.setMaxConnectionReuseCount(1000);
            this.poolXADataSource.setConnectionWaitTimeout(60);

            this.poolXADataSource.setValidateConnectionOnBorrow(true);
            this.poolXADataSource.setInactiveConnectionTimeout(300);
            this.poolXADataSource.setAbandonedConnectionTimeout(300);

            DataSourceInfo dataSourceInfo = new DataSourceInfo((TrmConfig.resourceManagerId));
            dataSourceInfo.setDatabaseType(TrmXAResourceType.PostgreSQL);

            TrmConfig.initXaDataSource(this.poolXADataSource, dataSourceInfo);
        } catch (Exception e) {
            logger.error("Failed to initialize database");
        }
    }

    public PoolXADataSource getDatasource() {
        return poolXADataSource;
    }
 */
}