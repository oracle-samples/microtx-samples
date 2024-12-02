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
 
package com.oracle.tellerspringpromotion;

import com.oracle.microtx.common.MicroTxConfig;
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
import java.sql.SQLException;
import java.util.Properties;

@Configuration
@ComponentScan("com.oracle")
public class XADataSourceConfig {
    @Value("${feeDataSource.url}")
    private String url;
    @Value("${feeDataSource.user}")
    private String username;
    @Value("${feeDataSource.password}")
    private String password;

    @Value("${feeDataSource.rmid}")
    private String feeRmid;
    @Value("${feeDataSource.oracleucp.min-pool-size}")
    private String minPoolSize;
    @Value("${feeDataSource.oracleucp.initial-pool-size:10}")
    private String initialPoolSize;

    @Value("${feeDataSource.oracleucp.max-pool-size}")
    private String maxPoolSize;

    @Value("${feeDataSource.oracleucp.data-source-name}")
    private String dataSourceName;

    @Value("${feeDataSource.oracleucp.connection-pool-name}")
    private String connectionPoolName;

    @Value("${feeDataSource.oracleucp.connection-factory-class-name:oracle.jdbc.xa.client.OracleXADataSource}")
    private String connectionFactoryClassName;

    @Value("${creditDataSource.url}")
    private String creditUrl;
    @Value("${creditDataSource.user}")
    private String creditUsername;
    @Value("${creditDataSource.password}")
    private String creditPassword;

    @Value("${creditDataSource.rmid}")
    private String creditRmid;
    @Value("${creditDataSource.oracleucp.min-pool-size}")
    private String creditMinPoolSize;
    @Value("${creditDataSource.oracleucp.initial-pool-size:10}")
    private String creditInitialPoolSize;

    @Value("${creditDataSource.oracleucp.max-pool-size}")
    private String creditMaxPoolSize;

    @Value("${creditDataSource.oracleucp.data-source-name}")
    private String creditDataSourceName;

    @Value("${creditDataSource.oracleucp.connection-pool-name}")
    private String creditConnectionPoolName;

    @Value("${creditDataSource.oracleucp.connection-factory-class-name:oracle.jdbc.xa.client.OracleXADataSource}")
    private String creditConnectionFactoryClassName;

    @Bean(name = "ucpXADataSource")
    @Primary
    public DataSource getDataSource() {
        DataSource pds = null;
        try {
            pds = PoolDataSourceFactory.getPoolXADataSource();

            ((PoolXADataSource) pds).setConnectionFactoryClassName(connectionFactoryClassName);
            ((PoolXADataSource) pds).setURL(url);
            ((PoolXADataSource) pds).setUser(username);
            ((PoolXADataSource) pds).setPassword(password);
            ((PoolXADataSource) pds).setMinPoolSize(Integer.valueOf(minPoolSize));
            ((PoolXADataSource) pds).setInitialPoolSize(Integer.valueOf(initialPoolSize));
            ((PoolXADataSource) pds).setMaxPoolSize(Integer.valueOf(maxPoolSize));

            ((PoolXADataSource) pds).setDataSourceName(dataSourceName);
            ((PoolXADataSource) pds).setConnectionPoolName(connectionPoolName);

            System.out.println("XADataSourceConfig: XADataSource created");
        } catch (SQLException ex) {
            System.err.println("Error connecting to the database: " + ex.getMessage());
        }
        return pds;
    }

    @Bean(name = "creditUcpXADataSource")
    @Primary
    public DataSource getCreditDataSource() {
        DataSource pds = null;
        try {
            pds = PoolDataSourceFactory.getPoolXADataSource();

            ((PoolXADataSource) pds).setConnectionFactoryClassName(creditConnectionFactoryClassName);
            ((PoolXADataSource) pds).setURL(creditUrl);
            ((PoolXADataSource) pds).setUser(creditUsername);
            ((PoolXADataSource) pds).setPassword(creditPassword);
            ((PoolXADataSource) pds).setMinPoolSize(Integer.valueOf(creditMinPoolSize));
            ((PoolXADataSource) pds).setInitialPoolSize(Integer.valueOf(creditInitialPoolSize));
            ((PoolXADataSource) pds).setMaxPoolSize(Integer.valueOf(creditMaxPoolSize));

            ((PoolXADataSource) pds).setDataSourceName(creditDataSourceName);
            ((PoolXADataSource) pds).setConnectionPoolName(creditConnectionPoolName);

            System.out.println("XADataSourceConfig: XADataSource created");
        } catch (SQLException ex) {
            System.err.println("Error connecting to the database: " + ex.getMessage());
        }
        return pds;
    }

    @Bean(name = "entityManagerFactory")
    public EntityManagerFactory createEntityManagerFactory() throws SQLException {
        LocalContainerEntityManagerFactoryBean entityManagerFactoryBean = new LocalContainerEntityManagerFactoryBean();

        entityManagerFactoryBean.setDataSource(getDataSource());
        entityManagerFactoryBean.setPackagesToScan(new String[] { "com.oracle.tellerspringpromotion.entity" });
        entityManagerFactoryBean.setJpaVendorAdapter(new HibernateJpaVendorAdapter());

        entityManagerFactoryBean.setPersistenceProviderClass(HibernatePersistenceProvider.class);
        entityManagerFactoryBean.setPersistenceUnitName("mydeptxads");
        Properties properties = new Properties();
        properties.setProperty( "jakarta.persistence.transactionType", "RESOURCE_LOCAL"); // change this to resource_local
        properties.put("hibernate.show_sql", "true");
        properties.put("hibernate.dialect", "org.hibernate.dialect.OracleDialect");
        properties.put("hibernate.format_sql", "true");
        properties.put("hbm2ddl.auto", "validate");
        properties.put("hibernate.connection.provider_class", "com.oracle.microtx.jpa.HibernateXADataSourceConnectionProvider");
        entityManagerFactoryBean.setJpaProperties(properties);
        entityManagerFactoryBean.afterPropertiesSet();
        EntityManagerFactory emf = (EntityManagerFactory) entityManagerFactoryBean.getObject();
        System.out.println("entityManagerFactory = " + emf);
        MicroTxConfig.initEntityManagerFactory(emf, "feeDataSource", feeRmid); // Initialize TMM Library
        return emf;
    }

    @Bean(name = "creditEntityManagerFactory")
    public EntityManagerFactory createCreditEntityManagerFactory() throws SQLException {
        LocalContainerEntityManagerFactoryBean entityManagerFactoryBean = new LocalContainerEntityManagerFactoryBean();

        entityManagerFactoryBean.setDataSource(getCreditDataSource());
        entityManagerFactoryBean.setPackagesToScan(new String[] { "com.oracle.tellerspringpromotion.entity" });
        entityManagerFactoryBean.setJpaVendorAdapter(new HibernateJpaVendorAdapter());

        entityManagerFactoryBean.setPersistenceProviderClass(HibernatePersistenceProvider.class);
        entityManagerFactoryBean.setPersistenceUnitName("mycreditads");
        Properties properties = new Properties();
        properties.setProperty( "jakarta.persistence.transactionType", "RESOURCE_LOCAL"); // change this to resource_local
        properties.put("hibernate.show_sql", "true");
        properties.put("hibernate.dialect", "org.hibernate.dialect.OracleDialect");
        properties.put("hibernate.format_sql", "true");
        properties.put("hbm2ddl.auto", "validate");
        properties.put("hibernate.connection.provider_class", "com.oracle.microtx.jpa.HibernateXADataSourceConnectionProvider");
        entityManagerFactoryBean.setJpaProperties(properties);
        entityManagerFactoryBean.afterPropertiesSet();
        EntityManagerFactory emf = (EntityManagerFactory) entityManagerFactoryBean.getObject();
        System.out.println("entityManagerFactory = " + emf);
        MicroTxConfig.initEntityManagerFactory(emf, "creditDataSource", creditRmid); // Initialize TMM Library
        return emf;
    }

}