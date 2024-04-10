package com.oracle.example.department;

import com.oracle.microtx.common.MicroTxConfig;
import jakarta.persistence.EntityManagerFactory;
import oracle.ucp.jdbc.PoolDataSource;
import oracle.ucp.jdbc.PoolDataSourceFactory;
import oracle.ucp.jdbc.PoolXADataSource;
import org.hibernate.jpa.HibernatePersistenceProvider;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Primary;
import org.springframework.orm.jpa.LocalContainerEntityManagerFactoryBean;
import org.springframework.orm.jpa.vendor.HibernateJpaVendorAdapter;

import javax.sql.DataSource;
import javax.sql.XADataSource;
import java.sql.SQLException;
import java.util.Properties;

@SuppressWarnings("UnnecessaryBoxing")
@Configuration
public class XADataSourceConfig {

    @Value("${spring.datasource.url}")
    private String url;

    @Value("${spring.datasource.username}")
    private String username;

    @Value("${spring.datasource.password}")
    private String password;

    @Value("${spring.datasource.xaOracleucp.min-pool-size}")
    private String minPoolSize;

    @Value("${spring.datasource.xaOracleucp.initial-pool-size:10}")
    private String initialPoolSize;

    @Value("${spring.datasource.xaOracleucp.max-pool-size}")
    private String maxPoolSize;

    @Value("${spring.datasource.xaOracleucp.data-source-name}")
    private String xaDataSourceName;

    @Value("${spring.datasource.xaOracleucp.connection-pool-name}")
    private String xaConnectionPoolName;

    @Value("${spring.datasource.xaOracleucp.connection-factory-class-name:oracle.jdbc.xa.client.OracleXADataSource}")
    private String xaConnectionFactoryClassName;

    @Value("${spring.datasource.oracleucp.connection-pool-name}")
    private String connectionPoolName;

    @Value("${spring.datasource.oracleucp.connection-factory-class-name:oracle.jdbc.xa.client.OracleXADataSource}")
    private String connectionFactoryClassName;

    @Value("${spring.datasource.oracleucp.data-source-name}")
    private String dataSourceName;

    @Value("${spring.microtx.xa-resource-manager-id}")
    private String resourceManagerId;

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
        entityManagerFactoryBean.setPackagesToScan(new String[] { "com.oracle.example.department" });
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
        entityManagerFactoryBean.setPackagesToScan(new String[] { "com.oracle.example.department" });
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
        return (EntityManagerFactory) entityManagerFactoryBean.getObject();
    }
}