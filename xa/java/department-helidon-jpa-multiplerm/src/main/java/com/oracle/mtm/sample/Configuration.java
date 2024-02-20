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

    private PoolDataSource dataSource;
    private PoolXADataSource xaDataSource;
    private PoolXADataSource creditXADataSource;
    final static Logger logger = LoggerFactory.getLogger(MethodHandles.lookup().lookupClass());

    private EntityManagerFactory xaEntityManagerFactory;

    private EntityManagerFactory entityManagerFactory;
    private EntityManagerFactory cdbEntityManagerFactory;


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

    private void init(@Observes @Initialized(ApplicationScoped.class) Object event) {

        //init fetch ds0
        initialiseDataSource();
        createEntityManagerFactory();



        // init ds1
        initialiseXaDataSource();
        createXaEntityManagerFactory();

        // init ds2
        initialiseCdbDataSource();
        createCdbEntityManagerFactory();
    }

    /**
     * Initializes the datasource into the TMM library that manages the lifecycle of the XA transaction
     *
     */
    private void initialiseXaDataSource() {
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

    private void initialiseDataSource() {
        try {
            this.dataSource = PoolDataSourceFactory.getPoolDataSource();
            this.dataSource.setURL(url);
            this.dataSource.setUser(user);
            this.dataSource.setPassword(password);
            this.dataSource.setConnectionFactoryClassName("oracle.jdbc.pool.OracleDataSource");
            this.dataSource.setInitialPoolSize(10);
            this.dataSource.setMinPoolSize(5);
            this.dataSource.setMaxPoolSize(10);
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

    public PoolDataSource getDataSource(){ return  dataSource;}

    public PoolXADataSource getCdbXADatasource() {
        return creditXADataSource;
    }


    public void createXaEntityManagerFactory(){
        Map<String, Object> props = new HashMap<String, Object>();

        props.put("hibernate.connection.datasource", getXaDatasource());
        props.put("hibernate.show_sql", "true");
        props.put("hibernate.dialect", "org.hibernate.dialect.Oracle12cDialect");
        props.put("hibernate.hbm2ddl.auto", "none");
        props.put("hibernate.format_sql", "true");
        props.put("hibernate.connection.provider_class", "oracle.tmm.jta.jpa.hibernate.HibernateXADataSourceConnectionProvider");
        props.put("jakarta.persistence.transactionType", "RESOURCE_LOCAL");
        props.put("jakarta.persistence.jdbc.driver", "oracle.jdbc.OracleDriver");
        props.put("jakarta.persistence.jdbc.url", url);
        props.put("jakarta.persistence.jdbc.user", user);
        props.put("jakarta.persistence.jdbc.password", password);

        this.xaEntityManagerFactory = Persistence.createEntityManagerFactory("mydeptxads", props);

        TrmConfig.initEntityManagerFactory(this.xaEntityManagerFactory, "departmentXADataSource", rmid1); // Initialize TMM Library
    }

    public void createCdbEntityManagerFactory(){
        Map<String, Object> props = new HashMap<String, Object>();

        props.put("hibernate.connection.datasource", getCdbXADatasource());
        props.put("hibernate.show_sql", "true");
        props.put("hibernate.dialect", "org.hibernate.dialect.Oracle12cDialect");
        props.put("hibernate.hbm2ddl.auto", "none");
        props.put("hibernate.format_sql", "true");
        props.put("hibernate.connection.provider_class", "oracle.tmm.jta.jpa.hibernate.HibernateXADataSourceConnectionProvider");
        props.put("jakarta.persistence.transactionType", "RESOURCE_LOCAL");
        props.put("jakarta.persistence.jdbc.driver", "oracle.jdbc.OracleDriver");
        props.put("jakarta.persistence.jdbc.url", cdbUrl);
        props.put("jakarta.persistence.jdbc.user", cdbUser);
        props.put("jakarta.persistence.jdbc.password", cdbPassword);

        this.cdbEntityManagerFactory = Persistence.createEntityManagerFactory("cdbdeptxads", props);

        TrmConfig.initEntityManagerFactory(this.cdbEntityManagerFactory, "creditXADataSource", rmid2); // Initialize TMM Library
    }

    public EntityManagerFactory getXaEntityManagerFactory() {
        return this.xaEntityManagerFactory;
    }

    public EntityManagerFactory getCdbEntityManagerFactory() {
        return this.cdbEntityManagerFactory;
    }


    public void createEntityManagerFactory(){
        Map<String, Object> props = new HashMap<String, Object>();

        props.put("hibernate.connection.datasource", getDataSource());
        props.put("hibernate.show_sql", "true");
        props.put("hibernate.dialect", "org.hibernate.dialect.Oracle12cDialect");
        props.put("hibernate.hbm2ddl.auto", "none");
        props.put("hibernate.format_sql", "true");
        props.put("jakarta.persistence.transactionType", "RESOURCE_LOCAL");
        props.put("jakarta.persistence.jdbc.driver", "oracle.jdbc.OracleDriver");
        props.put("jakarta.persistence.jdbc.url", url);
        props.put("jakarta.persistence.jdbc.user", user);
        props.put("jakarta.persistence.jdbc.password", password);

        props.put("hibernate.ucp.oracle.url", url);
        props.put("hibernate.ucp.username", user);
        props.put("hibernate.ucp.password", password);

        this.entityManagerFactory = Persistence.createEntityManagerFactory("mydeptds", props);
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