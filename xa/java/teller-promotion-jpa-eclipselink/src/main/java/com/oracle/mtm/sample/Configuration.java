/*

Oracle Transaction Manager for Microservices

Copyright (c) 2023, Oracle and/or its affiliates. **

The Universal Permissive License (UPL), Version 1.0 **

Subject to the condition set forth below, permission is hereby granted to any person obtaining a copy of this software, associated documentation and/or data (collectively the "Software"), free of charge and under any and all copyright rights in the Software, and any and all patent rights owned or freely licensable by each licensor hereunder covering either the unmodified Software as contributed to or provided by such licensor, or (ii) the Larger Works (as defined below), to deal in both **
(a) the Software, and (b) any piece of software and/or hardware listed in the lrgrwrks.txt file if one is included with the Software (each a "Larger Work" to which the Software is contributed by such licensors), **
without restriction, including without limitation the rights to copy, create derivative works of, display, perform, and distribute the Software and make, use, sell, offer for sale, import, export, have made, and have sold the Software and the Larger Work(s), and to sublicense the foregoing rights on either these or other terms. **

This license is subject to the following condition: The above copyright notice and either this complete permission notice or at a minimum a reference to the UPL must be included in all copies or substantial portions of the Software. **
THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

*/
package com.oracle.mtm.sample;

import oracle.tmm.common.TrmConfig;
import oracle.ucp.jdbc.PoolDataSourceFactory;
import oracle.ucp.jdbc.PoolXADataSource;
import org.eclipse.microprofile.config.inject.ConfigProperty;
import org.eclipse.persistence.config.PersistenceUnitProperties;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import jakarta.enterprise.context.ApplicationScoped;
import jakarta.enterprise.context.Initialized;
import jakarta.enterprise.event.Observes;
import jakarta.enterprise.inject.Produces;
import jakarta.inject.Inject;
import jakarta.persistence.EntityManager;
import jakarta.persistence.EntityManagerFactory;
import jakarta.persistence.Persistence;
import java.lang.invoke.MethodHandles;
import java.sql.SQLException;
import java.util.HashMap;
import java.util.Map;

@ApplicationScoped
public class Configuration {

    private PoolXADataSource dataSource;

    private PoolXADataSource creditDataSource;
    final static Logger logger = LoggerFactory.getLogger(MethodHandles.lookup().lookupClass());

    @Inject
    @ConfigProperty(name = "feeDataSource.url")
    String url;
    @Inject
    @ConfigProperty(name = "feeDataSource.user")
    String user;
    @Inject
    @ConfigProperty(name = "feeDataSource.password")
    String password;

    @Inject
    @ConfigProperty(name = "feeDataSource.rmid")
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

    private EntityManagerFactory entityManagerFactory;

    private void init(@Observes @Initialized(ApplicationScoped.class) Object event) {
        //initialize first DataSource
        initializeDataSource();
        createEntityManagerFactory();

        //initialize Second DataSource

        initializeCreditDataSource();
        createCreditEntityManagerFactory();
    }

    /**
     * Initializes the datasource into the TMM library that manages the lifecycle of the XA transaction
     *
     */
    private void initializeDataSource() {
        try {
            this.dataSource = PoolDataSourceFactory.getPoolXADataSource();
            this.dataSource.setURL(url);
            this.dataSource.setUser(user);
            this.dataSource.setPassword(password);
            this.dataSource.setDataSourceName("feeDataSource");
            this.dataSource.setConnectionFactoryClassName("oracle.jdbc.xa.client.OracleXADataSource");
            this.dataSource.setMaxPoolSize(15);
        } catch (SQLException e) {
            logger.error("Failed to initialise fee database");
        }
    }

    private void initializeCreditDataSource() {
        try {
            this.creditDataSource = PoolDataSourceFactory.getPoolXADataSource();
            this.creditDataSource.setURL(creditUrl);
            this.creditDataSource.setUser(creditUser);
            this.creditDataSource.setPassword(creditPassword);
            this.creditDataSource.setDataSourceName("creditDataSource");
            this.creditDataSource.setConnectionFactoryClassName("oracle.jdbc.xa.client.OracleXADataSource");
            this.creditDataSource.setMaxPoolSize(15);
        } catch (SQLException e) {
            logger.error("Failed to initialise credit database");
        }
    }

    public PoolXADataSource getDatasource() {
        return dataSource;
    }

    public PoolXADataSource getCreditDatasource() {
        return creditDataSource;
    }

    public EntityManagerFactory createEntityManagerFactory(){
        Map<String, Object> props = new HashMap<String, Object>();

        props.put("jakarta.persistence.nonJtaDataSource", getDatasource());
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

        entityManagerFactory = Persistence.createEntityManagerFactory("mydeptxads", props);

        TrmConfig.initEntityManagerFactory(entityManagerFactory,"feeDataSource",rmid); // Initialize TMM Library
        return entityManagerFactory;
    }

    public EntityManagerFactory createCreditEntityManagerFactory(){
        Map<String, Object> props = new HashMap<String, Object>();

        props.put("jakarta.persistence.nonJtaDataSource", getCreditDatasource());
        props.put( "jakarta.persistence.transactionType", "RESOURCE_LOCAL");
        props.put("jakarta.persistence.jdbc.driver", "oracle.jdbc.OracleDriver");
        props.put("jakarta.persistence.jdbc.url", creditUrl);
        props.put("jakarta.persistence.jdbc.user", creditUser);
        props.put("jakarta.persistence.jdbc.password", creditPassword);

        props.put(PersistenceUnitProperties.CACHE_SHARED_DEFAULT, "false");
        props.put(PersistenceUnitProperties.TARGET_DATABASE, "Oracle");
        props.put(PersistenceUnitProperties.WEAVING, "false");
        props.put(PersistenceUnitProperties.JDBC_CONNECTOR, "oracle.tmm.jta.jpa.eclipselink.EclipseLinkXADataSourceConnector");
        props.put(PersistenceUnitProperties.SESSION_EVENT_LISTENER_CLASS, "oracle.tmm.jta.jpa.eclipselink.EclipseLinkXASessionEventAdaptor");

        entityManagerFactory = Persistence.createEntityManagerFactory("mycreditxads", props);

        TrmConfig.initEntityManagerFactory(entityManagerFactory,"creditDataSource",creditRmid); // Initialize TMM Library
        return entityManagerFactory;
    }

    public EntityManagerFactory getEntityManagerFactory() {
        return this.entityManagerFactory;
    }

    /**
     * EntityManager bean for non-distributed database operations.
     */
    @Produces
    public EntityManager getEntityManager() {
        EntityManager entityManager = null;
        try {
            entityManager = this.getEntityManagerFactory().createEntityManager();
        } catch (RuntimeException e){
            e.printStackTrace();
            logger.error("Entity manager bean for local transactions creation failed!");
        }
        return entityManager;
    }
}