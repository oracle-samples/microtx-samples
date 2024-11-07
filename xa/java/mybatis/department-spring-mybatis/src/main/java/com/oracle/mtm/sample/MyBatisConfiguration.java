package com.oracle.mtm.sample;

import com.oracle.mtm.sample.mappers.nonxa.AccountMapperNonXA;
import org.apache.ibatis.mapping.Environment;
import org.apache.ibatis.session.Configuration;
import org.apache.ibatis.session.SqlSessionFactory;
import org.apache.ibatis.session.SqlSessionFactoryBuilder;
import org.apache.ibatis.transaction.TransactionFactory;
import org.apache.ibatis.transaction.jdbc.JdbcTransactionFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.context.annotation.Bean;
import org.springframework.stereotype.Component;

import javax.sql.DataSource;

@Component
public class MyBatisConfiguration {

    @Autowired
    @Qualifier("ucpDataSourceNonXA")
    private DataSource dataSource;

    @Bean(name = "customSqlSessionFactory")
    public SqlSessionFactory sqlSessionFactoryBean() throws Exception {
        TransactionFactory transactionFactory = new JdbcTransactionFactory();
        Environment environment = new Environment("development", transactionFactory, dataSource);
        Configuration configuration = new Configuration(environment);
        configuration.addMappers("com.oracle.mtm.sample.mappers.nonxa");
        //configuration.addMapper(AccountMapperNonXA.class);
        SqlSessionFactory sqlSessionFactory = new SqlSessionFactoryBuilder().build(configuration);
        return sqlSessionFactory;
    }
}
