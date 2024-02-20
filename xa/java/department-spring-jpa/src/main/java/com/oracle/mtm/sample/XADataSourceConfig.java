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
import oracle.ucp.jdbc.PoolDataSource;
import oracle.ucp.jdbc.PoolDataSourceFactory;
import oracle.ucp.jdbc.PoolXADataSource;
import org.hibernate.jpa.HibernatePersistenceProvider;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.ComponentScan;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Primary;
import org.springframework.orm.jpa.LocalContainerEntityManagerFactoryBean;
import org.springframework.orm.jpa.vendor.HibernateJpaVendorAdapter;

import jakarta.persistence.EntityManagerFactory;
import javax.sql.DataSource;
import javax.sql.XADataSource;
import java.sql.SQLException;
import java.util.Properties;

@Configuration
@ComponentScan("com.oracle")
public class XADataSourceConfig {
    @Value("${departmentDataSource.url}")
    private String url;

    @Value("${departmentDataSource.user}")
    private String username;

    @Value("${departmentDataSource.password}")
    private String password;

    @Value("${departmentDataSource.xaOracleucp.min-pool-size}")
    private String minPoolSize;

    @Value("${departmentDataSource.xaOracleucp.initial-pool-size:10}")
    private String initialPoolSize;

    @Value("${departmentDataSource.xaOracleucp.max-pool-size}")
    private String maxPoolSize;

    @Value("${departmentDataSource.xaOracleucp.data-source-name}")
    private String xaDataSourceName;

    @Value("${departmentDataSource.xaOracleucp.connection-pool-name}")
    private String xaConnectionPoolName;

    @Value("${departmentDataSource.xaOracleucp.connection-factory-class-name:oracle.jdbc.xa.client.OracleXADataSource}")
    private String xaConnectionFactoryClassName;

    @Value("${spring.microtx.xa-resource-manager-id}")
    private String resourceManagerId;

    @Value("${departmentDataSource.oracleucp.connection-pool-name}")
    private String connectionPoolName;

    @Value("${departmentDataSource.oracleucp.connection-factory-class-name:oracle.jdbc.xa.client.OracleXADataSource}")
    private String connectionFactoryClassName;

    @Value("${departmentDataSource.oracleucp.data-source-name}")
    private String dataSourceName;







    @Bean(name = "ucpXADataSource")
    @Primary
    public DataSource getXADataSource() {
        DataSource pds = null;
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

            MicroTxConfig.initXaDataSource((XADataSource) pds, resourceManagerId);
            System.out.println("XADataSourceConfig: XADataSource created");
        } catch (SQLException ex) {
            System.err.println("Error connecting to the database: " + ex.getMessage());
        }
        return pds;
    }

    public DataSource getDataSource() {
        DataSource pds = null;
        try {
            pds = PoolDataSourceFactory.getPoolDataSource();

            ((PoolDataSource) pds).setConnectionFactoryClassName(connectionFactoryClassName);
            ((PoolDataSource) pds).setURL(url);
            ((PoolDataSource) pds).setUser(username);
            ((PoolDataSource) pds).setPassword(password);
            ((PoolDataSource) pds).setMinPoolSize(Integer.valueOf(minPoolSize));
            ((PoolDataSource) pds).setInitialPoolSize(Integer.valueOf(initialPoolSize));
            ((PoolDataSource) pds).setMaxPoolSize(Integer.valueOf(maxPoolSize));

            ((PoolDataSource) pds).setDataSourceName(dataSourceName);
            ((PoolDataSource) pds).setConnectionPoolName(connectionPoolName);

        } catch (SQLException ex) {
            System.err.println("Error connecting to the database: " + ex.getMessage());
        }
        return pds;
    }


    @Bean(name = "entityManagerFactory")
    @Primary
    public EntityManagerFactory createXAEntityManagerFactory() throws SQLException {
        LocalContainerEntityManagerFactoryBean entityManagerFactoryBean = new LocalContainerEntityManagerFactoryBean();

        entityManagerFactoryBean.setDataSource(getXADataSource());
        entityManagerFactoryBean.setPackagesToScan(new String[] { "com.oracle.mtm.sample.entity" });
        entityManagerFactoryBean.setJpaVendorAdapter(new HibernateJpaVendorAdapter());

        entityManagerFactoryBean.setPersistenceProviderClass(HibernatePersistenceProvider.class);
        entityManagerFactoryBean.setPersistenceUnitName("mydeptxads");
        Properties properties = new Properties();
        properties.setProperty( "jakarta.persistence.transactionType", "RESOURCE_LOCAL"); // change this to resource_local
        properties.put("hibernate.show_sql", "true");
        properties.put("hibernate.dialect", "org.hibernate.dialect.Oracle12cDialect");
        properties.put("hibernate.format_sql", "true");
        properties.put("hbm2ddl.auto", "validate");
        properties.put("hibernate.connection.provider_class", "com.oracle.microtx.jpa.HibernateXADataSourceConnectionProvider");
        entityManagerFactoryBean.setJpaProperties(properties);
        entityManagerFactoryBean.afterPropertiesSet();
        EntityManagerFactory emf = (EntityManagerFactory) entityManagerFactoryBean.getObject();
        System.out.println("entityManagerFactory = " + emf);
        MicroTxConfig.initEntityManagerFactory(emf, resourceManagerId); // Initialize TMM Library
        return emf;
    }

    @Bean(name = "localEntityManagerFactory")
    public EntityManagerFactory createEntityManagerFactory() throws SQLException {
        LocalContainerEntityManagerFactoryBean entityManagerFactoryBean = new LocalContainerEntityManagerFactoryBean();

        entityManagerFactoryBean.setDataSource(getDataSource());
        entityManagerFactoryBean.setPackagesToScan(new String[] { "com.oracle.mtm.sample.entity" });
        entityManagerFactoryBean.setJpaVendorAdapter(new HibernateJpaVendorAdapter());

        entityManagerFactoryBean.setPersistenceProviderClass(HibernatePersistenceProvider.class);
        entityManagerFactoryBean.setPersistenceUnitName("mydeptds");
        Properties properties = new Properties();
        properties.setProperty( "jakarta.persistence.transactionType", "RESOURCE_LOCAL"); // change this to resource_local
        properties.put("hibernate.show_sql", "true");
        properties.put("hibernate.dialect", "org.hibernate.dialect.Oracle12cDialect");
        properties.put("hibernate.format_sql", "true");
        properties.put("hbm2ddl.auto", "validate");

        properties.put("hibernate.ucp.oracle.url", url);
        properties.put("hibernate.ucp.username", username);
        properties.put("hibernate.ucp.password", password);
        entityManagerFactoryBean.setJpaProperties(properties);
        entityManagerFactoryBean.afterPropertiesSet();
        EntityManagerFactory emf =  (EntityManagerFactory) entityManagerFactoryBean.getObject();
        return emf;
    }
}