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

import oracle.jakarta.jms.AQjmsFactory;
import oracle.jakarta.jms.AQjmsSession;
import oracle.jakarta.jms.AQjmsTextMessage;
import oracle.jakarta.jms.AQjmsTopicSubscriber;
import oracle.tmm.common.TrmConfig;
import oracle.tmm.jta.common.DataSourceInfo;
import oracle.ucp.jdbc.PoolDataSource;
import oracle.ucp.jdbc.PoolDataSourceFactory;
import oracle.ucp.jdbc.PoolXADataSource;
import org.eclipse.microprofile.config.inject.ConfigProperty;

import jakarta.enterprise.context.ApplicationScoped;
import jakarta.enterprise.context.Initialized;
import jakarta.enterprise.event.Observes;
import jakarta.inject.Inject;
import jakarta.jms.JMSException;
import jakarta.jms.Session;
import jakarta.jms.Topic;
import jakarta.jms.TopicConnection;
import jakarta.jms.TopicSession;
import jakarta.jms.XATopicConnectionFactory;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.lang.invoke.MethodHandles;
import java.sql.SQLException;

@ApplicationScoped
public class Configuration {

    private PoolXADataSource xaDataSource;
    private PoolDataSource dataSource;
    final static Logger logger = LoggerFactory.getLogger(MethodHandles.lookup().lookupClass());

    @Inject
    @ConfigProperty(name = "departmentDataSource.url")
    String url;
    @Inject
    @ConfigProperty(name = "departmentDataSource.user")
    String user;
    @Inject
    @ConfigProperty(name = "departmentDataSource.password")
    String password;

    @Inject
    @ConfigProperty(name = "departmentDataSource.jms.topicName")
    String topicName;

    private void init(@Observes @Initialized(ApplicationScoped.class) Object event) {
        initialiseDataSource();
        new Thread(() -> {
            consumeEvents();
        }).start();

    }


    /**
     * Consumes the TEQ messages posted in the XA transaction
     */
    private void consumeEvents() {
        // create a JMS topic connection and session
        XATopicConnectionFactory tcf = null;
        try {
            tcf = AQjmsFactory.getXATopicConnectionFactory(this.getXADatasource());
            TopicConnection conn = tcf.createXATopicConnection();
            conn.start();
            TopicSession session =
                    (AQjmsSession) conn.createSession(true, Session.AUTO_ACKNOWLEDGE);

            // create a subscriber on the topic
            Topic topic = ((AQjmsSession) session).getTopic(user, topicName);
            AQjmsTopicSubscriber subscriber =
                    (AQjmsTopicSubscriber) session.createDurableSubscriber(topic, "my_sub");

            System.out.println("Waiting for messages...");

            // wait forever for messages to arrive and print them out
            int i = 0;
            while (true) {

                // the 1_000 is a one second timeout
                AQjmsTextMessage message = (AQjmsTextMessage) subscriber.receive(1000);
                System.out.println("Checking for message " + i++);
                if (message != null && message.getText() != null) {
                        System.out.println("Message consumed:" + message.getText());
                }
                session.commit();
            }
        } catch (JMSException e) {
            e.printStackTrace();
        }
    }

    /**
     * Initializes the datasource into the TMM library that manages the lifecycle of the XA transaction
     */
    private void initialiseDataSource() {
        try {
            this.xaDataSource = PoolDataSourceFactory.getPoolXADataSource();
            this.xaDataSource.setURL(url);
            this.xaDataSource.setUser(user);
            this.xaDataSource.setPassword(password);
            this.xaDataSource.setConnectionFactoryClassName("oracle.jdbc.xa.client.OracleXADataSource");
            this.xaDataSource.setMaxPoolSize(15);
            DataSourceInfo dataSourceInfo = new DataSourceInfo(TrmConfig.getResourceManagerId());
            dataSourceInfo.setJms(true);
            TrmConfig.initXaDataSource(this.xaDataSource, dataSourceInfo);
        } catch (SQLException e) {
            logger.error("Failed to initialise xa database");
        }

        try {
            this.dataSource = PoolDataSourceFactory.getPoolDataSource();
            this.dataSource.setURL(url);
            this.dataSource.setUser(user);
            this.dataSource.setPassword(password);
            this.dataSource.setConnectionFactoryClassName("oracle.jdbc.pool.OracleDataSource");
            this.dataSource.setMaxPoolSize(15);
        } catch (SQLException e) {
            logger.error("Failed to initialise database");
        }
    }

    public PoolXADataSource getXADatasource() {
        return xaDataSource;
    }

    public PoolDataSource getDatasource() {
        return dataSource;
    }
}
