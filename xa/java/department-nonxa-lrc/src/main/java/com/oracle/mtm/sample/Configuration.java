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

import java.lang.invoke.MethodHandles;
import java.util.concurrent.TimeUnit;

import jakarta.enterprise.context.ApplicationScoped;
import jakarta.enterprise.context.Initialized;
import jakarta.enterprise.event.Observes;
import jakarta.inject.Inject;

import com.mongodb.ConnectionString;
import com.mongodb.MongoClientSettings;
import com.mongodb.client.MongoClient;
import com.mongodb.client.MongoClients;
import com.mongodb.client.MongoDatabase;

import com.mongodb.connection.ConnectionPoolSettings;
import org.eclipse.microprofile.config.inject.ConfigProperty;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@ApplicationScoped
public class Configuration {

    private MongoClient client;
    final static Logger logger = LoggerFactory.getLogger(MethodHandles.lookup().lookupClass());

    @Inject
    @ConfigProperty(name = "departmentDataSource.url")
    String url;

    @Inject
    @ConfigProperty(name = "departmentDataSource.databaseName")
    String databaseName;

    @Inject
    @ConfigProperty(name = "departmentDataSource.socketReadTimeoutInSeconds", defaultValue = "60")
    Integer socketReadTimeoutInSeconds;

    @Inject
    @ConfigProperty(name = "departmentDataSource.heartbeatFrequency", defaultValue = "60")
    Integer heartbeatFrequency;

    @Inject
    @ConfigProperty(name = "departmentDataSource.pool.maxConnectionIdleTime", defaultValue = "60")
    Integer maxConnectionIdleTime;

    @Inject
    @ConfigProperty(name = "departmentDataSource.pool.maintenanceFrequency", defaultValue = "60")
    Integer maintenanceFrequency;

    @Inject
    @ConfigProperty(name = "departmentDataSource.pool.minSize", defaultValue = "5")
    Integer minSize;

    private void init(@Observes @Initialized(ApplicationScoped.class) Object event) {
        initialise();
    }

    /**
     * Initialises the datasource to the Trm library that manages the lifecycle of the XA transaction
     *
     */
    private void initialise() {
        try {
            ConnectionPoolSettings connectionPoolSettings = ConnectionPoolSettings.builder()
                    .minSize(minSize)
                    .maxConnectionIdleTime(maxConnectionIdleTime, TimeUnit.SECONDS)
                    .maintenanceFrequency(maintenanceFrequency, TimeUnit.SECONDS)
                    .build();

            MongoClientSettings mongoClientSettings = MongoClientSettings.builder()
                    .applyConnectionString(new ConnectionString(url))
                    .applyToSocketSettings(builder -> {
                        builder.readTimeout(socketReadTimeoutInSeconds, TimeUnit.SECONDS);
                    })
                    .applyToConnectionPoolSettings(builder -> builder.applySettings(connectionPoolSettings))
                    .applyToServerSettings(builder -> builder.heartbeatFrequency(heartbeatFrequency, TimeUnit.SECONDS))
                    .build();
            this.client = MongoClients.create(mongoClientSettings);
        } catch (Exception e) {
            logger.error("Failed to initialise database");
        }
    }

    public MongoDatabase getDatabase() {
        return client.getDatabase(databaseName);
    }

    public MongoClient getClient() {
        return client;
    }
}