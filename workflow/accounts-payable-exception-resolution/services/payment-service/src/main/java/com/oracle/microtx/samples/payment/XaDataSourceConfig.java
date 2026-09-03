package com.oracle.microtx.samples.payment;
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
@Configuration
public class XaDataSourceConfig {
  /** Reads and idempotency lookups must not consume XA participant connections. */
  @Bean(name="paymentReadDataSource") DataSource paymentReadDataSource(
      @Value("${payment.datasource.url}") String url,@Value("${payment.datasource.username}") String user,@Value("${payment.datasource.password}") String password,
      @Value("${payment.datasource.connect-timeout-seconds}") int connectTimeoutSeconds) throws Exception {
    PoolDataSource pool=PoolDataSourceFactory.getPoolDataSource(); pool.setConnectionFactoryClassName("oracle.jdbc.pool.OracleDataSource"); pool.setURL(url); pool.setUser(user); pool.setPassword(password);
    pool.setConnectionPoolName("paymentReadPool"); pool.setDataSourceName("paymentReadDataSource"); pool.setMinPoolSize(1); pool.setInitialPoolSize(1); pool.setMaxPoolSize(10);
    pool.setConnectionWaitTimeout(connectTimeoutSeconds); pool.setLoginTimeout(connectTimeoutSeconds); pool.setConnectionProperties(connectionProperties(connectTimeoutSeconds));
    pool.setValidateConnectionOnBorrow(true); pool.setSQLForValidateConnection("SELECT 1 FROM DUAL"); validateReadDatabase(pool); return pool;
  }

  @Bean(name="paymentXaDataSource") XADataSource paymentXaDataSource(
      @Value("${payment.datasource.url}") String url,@Value("${payment.datasource.username}") String user,@Value("${payment.datasource.password}") String password,
      @Value("${payment.datasource.connection-pool-name}") String poolName,@Value("${payment.datasource.data-source-name}") String dataSourceName,
      @Value("${payment.datasource.connection-factory-class-name}") String factory,@Value("${payment.datasource.min-pool-size}") int min,
      @Value("${payment.datasource.initial-pool-size}") int initial,@Value("${payment.datasource.max-pool-size}") int max,
      @Value("${payment.datasource.connect-timeout-seconds}") int connectTimeoutSeconds,
      @Value("${spring.microtx.xa-resource-manager-id}") String resourceManagerId) throws Exception {
    if(url.isBlank()||user.isBlank()) throw new IllegalStateException("PAYMENT_DATABASE_URL and PAYMENT_DATABASE_USERNAME must be set before starting payment-service");
    PoolXADataSource pool=PoolDataSourceFactory.getPoolXADataSource(); pool.setConnectionFactoryClassName(factory); pool.setURL(url); pool.setUser(user); pool.setPassword(password);
    pool.setConnectionPoolName(poolName); pool.setDataSourceName(dataSourceName); pool.setMinPoolSize(min); pool.setInitialPoolSize(initial); pool.setMaxPoolSize(max);
    pool.setConnectionWaitTimeout(connectTimeoutSeconds); pool.setLoginTimeout(connectTimeoutSeconds);
    pool.setConnectionProperties(connectionProperties(connectTimeoutSeconds));
    pool.setValidateConnectionOnBorrow(true); pool.setSQLForValidateConnection("SELECT 1 FROM DUAL"); validateDatabase(pool); MicroTxConfig.initXaDataSource(pool,resourceManagerId); return pool;
  }
  private void validateDatabase(XADataSource dataSource) throws Exception {
    var xaConnection=dataSource.getXAConnection();
    try {
      try(Connection connection=xaConnection.getConnection(); Statement statement=connection.createStatement()){ statement.execute("SELECT 1 FROM DUAL"); }
    } finally {
      xaConnection.close();
    }
  }
  /** Establish the normal idempotency/read connection before the HTTP port is available. */
  private void validateReadDatabase(DataSource dataSource) throws Exception { try(Connection connection=dataSource.getConnection(); Statement statement=connection.createStatement()){ statement.execute("SELECT 1 FROM DUAL"); } }
  private Properties connectionProperties(int connectTimeoutSeconds) { Properties properties=new Properties(); properties.setProperty("oracle.net.CONNECT_TIMEOUT",Integer.toString(connectTimeoutSeconds * 1000)); properties.setProperty("oracle.jdbc.ReadTimeout",Integer.toString(connectTimeoutSeconds * 1000)); return properties; }
}
