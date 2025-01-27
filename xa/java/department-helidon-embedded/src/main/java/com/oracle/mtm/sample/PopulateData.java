package com.oracle.mtm.sample;

import org.apache.derby.jdbc.EmbeddedDataSource;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.sql.Connection;
import java.sql.SQLException;
import java.sql.Statement;

public class PopulateData {

    private static Logger logger = LoggerFactory.getLogger(PopulateData.class);

    public static boolean populateData(EmbeddedDataSource dataSource) {

        try(Connection connection = dataSource.getConnection(); Statement statement = connection.createStatement();) {
            statement.execute("create table accounts ( account_id VARCHAR(10) not null, name VARCHAR(60) not null, amount decimal(10,2) not null, PRIMARY KEY (account_id))");
            statement.execute("insert into accounts values('account1', 'account1', 1000.00)");
            statement.execute("insert into accounts values('account2', 'account2', 2000.00)");
            statement.execute("insert into accounts values('account3', 'account3', 3000.00)");
            statement.execute("insert into accounts values('account4', 'account4', 4000.00)");
            statement.execute("insert into accounts values('account5', 'account5', 5000.00)");
        } catch (SQLException e) {
            if(e.getMessage().contains("Table/View 'ACCOUNTS' already exists in Schema")){
                logger.info("TABLE ACCOUNTS already exists in Schema");
            } else{
                logger.error(e.getMessage());
                return false;
            }
        }
        return true;
    }

}