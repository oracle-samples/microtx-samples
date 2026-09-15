package com.oracle.microtx.samples.ap;

import com.oracle.microtx.common.MicroTxConfig;
import oracle.ucp.jdbc.PoolDataSourceFactory;
import oracle.ucp.jdbc.PoolDataSource;
import oracle.ucp.jdbc.PoolXADataSource;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import javax.sql.XADataSource;
import javax.sql.DataSource;
import java.sql.Connection;
import java.sql.Statement;
import java.util.Properties;

/** Registers this service's Oracle XA resource with the MicroTx Spring library. */
@Configuration
public class XaDataSourceConfig {
    /**
     * Normal AP reads deliberately do not use the MicroTx connection factory.
     * Only payment preparation writes need an XA branch.  Creating a
     * microTxSqlConnection for every precheck/evidence query otherwise holds
     * XA connections until the small participant pool is exhausted.
     */
    @Bean(name = "apReadDataSource")
    DataSource apReadDataSource(
            @Value("${ap.datasource.url}") String url,
            @Value("${ap.datasource.username}") String username,
            @Value("${ap.datasource.password}") String password,
            @Value("${ap.datasource.connect-timeout-seconds}") int connectTimeoutSeconds) throws Exception {
        PoolDataSource pool = PoolDataSourceFactory.getPoolDataSource();
        pool.setConnectionFactoryClassName("oracle.jdbc.pool.OracleDataSource");
        pool.setURL(url); pool.setUser(username); pool.setPassword(password);
        pool.setConnectionPoolName("apBackendReadPool"); pool.setDataSourceName("apBackendReadDataSource");
        pool.setMinPoolSize(1); pool.setInitialPoolSize(1); pool.setMaxPoolSize(10);
        pool.setConnectionWaitTimeout(connectTimeoutSeconds); pool.setLoginTimeout(connectTimeoutSeconds);
        Properties properties = connectionProperties(connectTimeoutSeconds);
        pool.setConnectionProperties(properties);
        pool.setValidateConnectionOnBorrow(true); pool.setSQLForValidateConnection("SELECT 1 FROM DUAL");
        validateReadDatabase(pool);
        return pool;
    }

    @Bean(name = "apXaDataSource")
    XADataSource apXaDataSource(
            @Value("${ap.datasource.url}") String url,
            @Value("${ap.datasource.username}") String username,
            @Value("${ap.datasource.password}") String password,
            @Value("${ap.datasource.connection-pool-name}") String poolName,
            @Value("${ap.datasource.data-source-name}") String dataSourceName,
            @Value("${ap.datasource.connection-factory-class-name}") String factory,
            @Value("${ap.datasource.min-pool-size}") int min,
            @Value("${ap.datasource.initial-pool-size}") int initial,
            @Value("${ap.datasource.max-pool-size}") int max,
            @Value("${ap.datasource.connect-timeout-seconds}") int connectTimeoutSeconds,
            @Value("${spring.microtx.xa-resource-manager-id}") String resourceManagerId) throws Exception {
        if (url.isBlank() || username.isBlank()) {
            throw new IllegalStateException("AP_DATABASE_URL and AP_DATABASE_USERNAME must be set before starting ap-backend");
        }
        PoolXADataSource pool = PoolDataSourceFactory.getPoolXADataSource();
        pool.setConnectionFactoryClassName(factory);
        pool.setURL(url); pool.setUser(username); pool.setPassword(password);
        pool.setConnectionPoolName(poolName); pool.setDataSourceName(dataSourceName);
        pool.setMinPoolSize(min); pool.setInitialPoolSize(initial); pool.setMaxPoolSize(max);
        pool.setConnectionWaitTimeout(connectTimeoutSeconds); pool.setLoginTimeout(connectTimeoutSeconds);
        pool.setConnectionProperties(connectionProperties(connectTimeoutSeconds));
        pool.setValidateConnectionOnBorrow(true); pool.setSQLForValidateConnection("SELECT 1 FROM DUAL");
        validateDatabase(pool);
        MicroTxConfig.initXaDataSource(pool, resourceManagerId);
        return pool;
    }

    /** Fail startup with the real Oracle error instead of timing out on the first workflow task. */
    private void validateDatabase(XADataSource dataSource) throws Exception {
        var xaConnection = dataSource.getXAConnection();
        try {
            try (Connection connection = xaConnection.getConnection();
                 Statement statement = connection.createStatement()) {
                statement.execute("SELECT 1 FROM DUAL");
            }
        } finally {
            xaConnection.close();
        }
    }

    /** Establish the normal pre-XA read connection before the service binds its HTTP port. */
    private void validateReadDatabase(DataSource dataSource) throws Exception {
        try (Connection connection = dataSource.getConnection(); Statement statement = connection.createStatement()) {
            statement.execute("SELECT 1 FROM DUAL");
        }
    }

    private Properties connectionProperties(int connectTimeoutSeconds) {
        Properties properties = new Properties();
        properties.setProperty("oracle.net.CONNECT_TIMEOUT", Integer.toString(connectTimeoutSeconds * 1000));
        properties.setProperty("oracle.jdbc.ReadTimeout", Integer.toString(connectTimeoutSeconds * 1000));
        return properties;
    }
}
