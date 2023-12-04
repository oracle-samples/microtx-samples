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

import com.oracle.microtx.common.MicroTxConfig;
import oracle.tmm.jta.common.DataSourceInfo;
import org.postgresql.xa.PGXADataSource;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.ComponentScan;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Primary;

import java.net.URI;
import java.net.URISyntaxException;
import java.util.HashMap;
import java.util.Map;

@Configuration
@ComponentScan("com.oracle")
public class XADataSourceConfig {

    private PGXADataSource dataSource;
    private static final Logger LOG = LoggerFactory.getLogger(XADataSourceConfig.class);

    @Value("${departmentDataSource.url}")
    private String url;

    @Value("${departmentDataSource.user}")
    private String user;

    @Value("${departmentDataSource.password}")
    private String password;

    @Value("${spring.microtx.xa-resource-manager-id}")
    private String rmid;


    /**
     * Initialises the datasource to the Trm library that manages the lifecycle of the XA transaction
     *
     */
    @Bean(name = "PGXADataSource")
    @Primary
    public PGXADataSource getPostgresSQLXADataSource() {
        try {
            Map<String, String> jdbcMetadata = getDataSourceMetadata(url);
            this.dataSource = new PGXADataSource();
            this.dataSource.setURL(url);
            this.dataSource.setUser(user);
            this.dataSource.setPassword(password);
            this.dataSource.setDatabaseName(jdbcMetadata.get("databaseName"));
            this.dataSource.setServerName(jdbcMetadata.get("serverName"));
            this.dataSource.setPortNumber(Integer.valueOf(jdbcMetadata.get("port")));

            DataSourceInfo dataSourceInfo = new DataSourceInfo(rmid);
            MicroTxConfig.initXaDataSource(this.dataSource,dataSourceInfo);
            LOG.info("XADataSourceConfig: XADataSource created");
        } catch (Exception e) {
            LOG.error("Failed to initialize database");
        }
        return dataSource;
    }

    private Map<String, String> getDataSourceMetadata(String jdbcURL) {
        try {
            URI uri = new URI(jdbcURL.replace("jdbc:", ""));
            return new HashMap<>(){{
                put("serverName", uri.getHost());
                put("port", String.valueOf(uri.getPort()));
                put("databaseName", uri.getPath().replace("/", ""));
            }};
        } catch (URISyntaxException e) {
            throw new RuntimeException("Invalid Postgres JDBC connection string. Expected format : jdbc:postgresql://<postgres-server-host>:<port>/<database>", e);
        }
    }

}