package com.oracle.mtm.sample;

import org.apache.derby.jdbc.EmbeddedDataSource;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.io.BufferedReader;
import java.io.FileNotFoundException;
import java.io.FileReader;
import java.io.IOException;
import java.nio.file.Paths;
import java.sql.Connection;
import java.sql.SQLException;
import java.sql.Statement;


public class PopulateData {

    private static Logger logger = LoggerFactory.getLogger(PopulateData.class);

    public static boolean populateData(EmbeddedDataSource dataSource) {
        String sqlFilePath = Paths.get(System.getProperty("user.dir"), "Create.sql").toString();

        try(Connection connection = dataSource.getConnection();
            Statement statement = connection.createStatement();
            BufferedReader reader = new BufferedReader(new FileReader(sqlFilePath))) {
            StringBuilder sqlQuery = new StringBuilder();
            String line;
            while ((line = reader.readLine()) != null) {
                line = line.trim();
                if (line.isEmpty() || line.startsWith("--")) { // Ignore empty lines and comments
                    continue;
                }
                sqlQuery.append(line).append(" ");

                // If the line ends with a semicolon, execute the statement
                if (line.endsWith(";")) {
                    statement.execute(sqlQuery.toString().replace(";", ""));
                    sqlQuery.setLength(0);
                }
            }
            System.out.println("SQL file executed successfully.");
        } catch (Exception  e) {
                logger.error(e.getMessage());
                return false;
        }
        return true;
    }

}