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
import oracle.ucp.jdbc.PoolDataSource;
import oracle.ucp.jdbc.PoolDataSourceFactory;
import oracle.ucp.jdbc.PoolXADataSource;
import org.eclipse.microprofile.config.inject.ConfigProperty;
import org.eclipse.persistence.config.PersistenceUnitProperties;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import jakarta.enterprise.context.ApplicationScoped;
import jakarta.enterprise.context.Initialized;
import jakarta.enterprise.event.Observes;
import jakarta.inject.Inject;
import jakarta.persistence.EntityManagerFactory;
import jakarta.persistence.Persistence;
import java.lang.invoke.MethodHandles;
import java.sql.SQLException;
import java.util.HashMap;
import java.util.Map;

@ApplicationScoped
public class Configuration {

    private PoolXADataSource xaDataSource;
    private PoolXADataSource creditXADataSource;

    private PoolDataSource dataSource;

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
    String rmid1;

    @Inject
    @ConfigProperty(name = "creditDataSource.url")
    String cdbUrl;
    @Inject
    @ConfigProperty(name = "creditDataSource.user")
    String cdbUser;
    @Inject
    @ConfigProperty(name = "creditDataSource.password")
    String cdbPassword;
    @Inject
    @ConfigProperty(name = "creditDataSource.rmid")
    String rmid2;

    final static Logger logger = LoggerFactory.getLogger(MethodHandles.lookup().lookupClass());

    private void init(@Observes @Initialized(ApplicationScoped.class) Object event) {

        //init ds0
        initializeDataSource();

        // init xaDs1
        initializeXaDataSource();
        createXAEntityManagerFactory();

        // init xaDs2
        initialiseCdbDataSource();
        createCdbEntityManagerFactory();
    }

    /**
     * Initializes the datasource into the TMM library that manages the lifecycle of the XA transaction
     *
     */
    private void initializeXaDataSource() {
        try {
            this.xaDataSource = PoolDataSourceFactory.getPoolXADataSource();
            this.xaDataSource.setURL(url);
            this.xaDataSource.setUser(user);
            this.xaDataSource.setPassword(password);
            this.xaDataSource.setConnectionFactoryClassName("oracle.jdbc.xa.client.OracleXADataSource");
            this.xaDataSource.setMaxPoolSize(15);
            this.xaDataSource.setDataSourceName("departmentXADataSource");
        } catch (SQLException e) {
            logger.error("Failed to initialise database");
        }
    }
    private void initializeDataSource() {
        try {
            this.dataSource = PoolDataSourceFactory.getPoolDataSource();
            this.dataSource.setURL(url);
            this.dataSource.setUser(user);
            this.dataSource.setPassword(password);
            this.dataSource.setConnectionFactoryClassName("oracle.jdbc.pool.OracleDataSource");
            this.dataSource.setMaxPoolSize(15);
            this.dataSource.setDataSourceName("departmentDataSource");
        } catch (SQLException e) {
            logger.error("Failed to initialise database");
        }
    }


    private void initialiseCdbDataSource() {
        try {
            this.creditXADataSource = PoolDataSourceFactory.getPoolXADataSource();
            this.creditXADataSource.setURL(cdbUrl);
            this.creditXADataSource.setUser(cdbUser);
            this.creditXADataSource.setPassword(cdbPassword);
            this.creditXADataSource.setConnectionFactoryClassName("oracle.jdbc.xa.client.OracleXADataSource");
            this.creditXADataSource.setMaxPoolSize(15);
            this.creditXADataSource.setDataSourceName("creditXADataSource");
        } catch (SQLException e) {
            logger.error("Failed to initialise cdb database");
        }
    }

    public PoolXADataSource getXaDatasource() {
        return xaDataSource;
    }

    public PoolDataSource getDatasource() {
        return dataSource;
    }

    public PoolXADataSource getCdbDatasource() {
        return creditXADataSource;
    }

    public void createXAEntityManagerFactory(){
        Map<String, Object> props = new HashMap<String, Object>();

        props.put("jakarta.persistence.nonJtaDataSource", getXaDatasource());
        props.put( "jakarta.persistence.transactionType", "RESOURCE_LOCAL");
        props.put("jakarta.persistence.jdbc.driver", "oracle.jdbc.OracleDriver");
        props.put("jakarta.persistence.jdbc.url", url);
        props.put("jakarta.persistence.jdbc.user", user);
        props.put("jakarta.persistence.jdbc.password", password);

        props.put(PersistenceUnitProperties.CACHE_SHARED_DEFAULT, "false");
        props.put(PersistenceUnitProperties.TARGET_DATABASE, "Oracle");
        props.put(PersistenceUnitProperties.WEAVING, "false");
        props.put(PersistenceUnitProperties.JDBC_CONNECTOR, "oracle.tmm.jta.jpa.eclipselink.EclipseLinkXADataSourceConnector");
        props.put(PersistenceUnitProperties.SESSION_EVENT_LISTENER_CLASS, "oracle.tmm.jta.jpa.eclipselink.EclipseLinkXASessionEventAdaptor");

        EntityManagerFactory emf = Persistence.createEntityManagerFactory("mydeptxads", props);
        TrmConfig.initEntityManagerFactory(emf, "departmentXADataSource", rmid1); // Initialize TMM Library
    }

    public void createCdbEntityManagerFactory(){
        Map<String, Object> props = new HashMap<String, Object>();

        props.put("jakarta.persistence.nonJtaDataSource", getCdbDatasource());
        props.put( "jakarta.persistence.transactionType", "RESOURCE_LOCAL");
        props.put("jakarta.persistence.jdbc.driver", "oracle.jdbc.OracleDriver");
        props.put("jakarta.persistence.jdbc.url", cdbUrl);
        props.put("jakarta.persistence.jdbc.user", cdbUser);
        props.put("jakarta.persistence.jdbc.password", cdbPassword);

        props.put(PersistenceUnitProperties.CACHE_SHARED_DEFAULT, "false");
        props.put(PersistenceUnitProperties.TARGET_DATABASE, "Oracle");
        props.put(PersistenceUnitProperties.WEAVING, "false");
        props.put(PersistenceUnitProperties.JDBC_CONNECTOR, "oracle.tmm.jta.jpa.eclipselink.EclipseLinkXADataSourceConnector");
        props.put(PersistenceUnitProperties.SESSION_EVENT_LISTENER_CLASS, "oracle.tmm.jta.jpa.eclipselink.EclipseLinkXASessionEventAdaptor");

        EntityManagerFactory emf = Persistence.createEntityManagerFactory("cdbdeptxads", props);
        TrmConfig.initEntityManagerFactory(emf, "creditXADataSource", rmid2); // Initialize TMM Library
    }

    public Logger getLogger() {
        return logger;
    }
}