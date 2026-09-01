package com.oracle.workflow.samples.notification_service.txeventq;

import oracle.jdbc.pool.OracleDataSource;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.sql.CallableStatement;
import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.List;
import java.util.Locale;
import java.util.regex.Pattern;

@Service
public class TxEventQueueService {

    private static final Logger LOGGER = LoggerFactory.getLogger(TxEventQueueService.class);
    private static final Pattern ORACLE_IDENTIFIER = Pattern.compile("^[A-Za-z][A-Za-z0-9_$#]*$");
    private static final Pattern MESSAGE_ID = Pattern.compile("^[A-Fa-f0-9]{32}$");
    private static final int MAX_ALLOWED_MESSAGES = 1_000;

    private final TxEventQueueProperties properties;
    private volatile OracleDataSource dataSource;

    public TxEventQueueService(TxEventQueueProperties properties) {
        this.properties = properties;
    }

    public List<TxEventQueueMessage> listMessages() {
        QueueConfiguration configuration = configuration();
        LOGGER.info("Starting TxEventQ message list operation.");
        String sql = """
                SELECT RAWTOHEX(msg_id) AS message_id,
                       enq_timestamp,
                       msg_state,
                       consumer_name,
                       UTL_I18N.RAW_TO_CHAR(
                           DBMS_LOB.SUBSTR(user_data, 32767, 1),
                           'AL32UTF8'
                       ) AS payload
                FROM AQ$%s
                WHERE consumer_name = ?
                  AND msg_state = 'READY'
                ORDER BY enq_timestamp DESC
                FETCH FIRST %d ROWS ONLY
                """.formatted(configuration.queueName(), configuration.maxMessages());

        try (Connection connection = dataSource(configuration).getConnection();
             PreparedStatement statement = connection.prepareStatement(sql)) {
            verifyConnection(connection, configuration, "message list");
            statement.setString(1, configuration.consumerName());
            try (ResultSet resultSet = statement.executeQuery()) {
                List<TxEventQueueMessage> messages = new ArrayList<>();
                while (resultSet.next()) {
                    messages.add(new TxEventQueueMessage(
                            resultSet.getString("message_id"),
                            resultSet.getTimestamp("enq_timestamp").toInstant(),
                            resultSet.getString("msg_state"),
                            resultSet.getString("consumer_name"),
                            resultSet.getString("payload")));
                }
                LOGGER.info("TxEventQ message list operation completed. {} pending message(s) found.", messages.size());
                return messages;
            }
        } catch (SQLException exception) {
            logSqlFailure("read TxEventQ messages", exception);
            throw new TxEventQueueAccessException("Unable to read TxEventQ messages.", exception);
        }
    }

    public TxEventQueueMetadata metadata() {
        QueueConfiguration configuration = configuration();
        return new TxEventQueueMetadata(configuration.queueName(), configuration.consumerName());
    }

    public void consumeMessage(String messageId) {
        QueueConfiguration configuration = configuration();
        if (!MESSAGE_ID.matcher(messageId).matches()) {
            throw new TxEventQueueInvalidMessageIdException();
        }
        LOGGER.info("Starting TxEventQ message consume operation.");

        String plsql = """
                DECLARE
                    dequeue_options DBMS_AQ.dequeue_options_t;
                    message_properties DBMS_AQ.message_properties_t;
                    message SYS.AQ$_JMS_MESSAGE;
                    dequeued_message_id RAW(16);
                BEGIN
                    dequeue_options.consumer_name := ?;
                    dequeue_options.msgid := HEXTORAW(?);
                    dequeue_options.dequeue_mode := DBMS_AQ.REMOVE;
                    dequeue_options.navigation := DBMS_AQ.FIRST_MESSAGE;
                    dequeue_options.visibility := DBMS_AQ.IMMEDIATE;
                    dequeue_options.wait := DBMS_AQ.NO_WAIT;

                    DBMS_AQ.DEQUEUE(
                        queue_name => ?,
                        dequeue_options => dequeue_options,
                        message_properties => message_properties,
                        payload => message,
                        msgid => dequeued_message_id
                    );
                END;
                """;

        try (Connection connection = dataSource(configuration).getConnection();
             CallableStatement statement = connection.prepareCall(plsql)) {
            verifyConnection(connection, configuration, "message consume");
            statement.setString(1, configuration.consumerName());
            statement.setString(2, messageId.toUpperCase(Locale.ROOT));
            statement.setString(3, configuration.queueName());
            statement.execute();
            LOGGER.info("TxEventQ message consume operation completed successfully.");
        } catch (SQLException exception) {
            if (exception.getErrorCode() == 25228) {
                LOGGER.info("TxEventQ message consume operation found no pending message for the configured consumer.");
                throw new TxEventQueueMessageNotFoundException(messageId);
            }
            logSqlFailure("consume TxEventQ message", exception);
            throw new TxEventQueueAccessException("Unable to consume the TxEventQ message.", exception);
        }
    }

    private QueueConfiguration configuration() {
        if (!properties.isEnabled()) {
            throw new TxEventQueueDisabledException();
        }

        String jdbcUrl = required(properties.getJdbcUrl(), "txeventq.jdbc-url");
        String username = required(properties.getUsername(), "txeventq.username");
        String password = required(properties.getPassword(), "txeventq.password");
        String queueName = required(properties.getQueueName(), "txeventq.queue-name");
        String consumerName = required(properties.getConsumerName(), "txeventq.consumer-name");

        if (!ORACLE_IDENTIFIER.matcher(queueName).matches()) {
            throw new TxEventQueueConfigurationException("txeventq.queue-name must be an unquoted Oracle identifier.");
        }
        if (properties.getMaxMessages() < 1 || properties.getMaxMessages() > MAX_ALLOWED_MESSAGES) {
            throw new TxEventQueueConfigurationException("txeventq.max-messages must be between 1 and " + MAX_ALLOWED_MESSAGES + ".");
        }

        return new QueueConfiguration(
                jdbcUrl,
                username,
                password,
                queueName.toUpperCase(Locale.ROOT),
                consumerName,
                properties.getMaxMessages());
    }

    private OracleDataSource dataSource(QueueConfiguration configuration) {
        OracleDataSource existing = dataSource;
        if (existing != null) {
            return existing;
        }

        synchronized (this) {
            if (dataSource == null) {
                try {
                    OracleDataSource created = new OracleDataSource();
                    created.setURL(configuration.jdbcUrl());
                    created.setUser(configuration.username());
                    created.setPassword(configuration.password());
                    dataSource = created;
                    LOGGER.debug("Configured a lazy Oracle data source for TxEventQ operations.");
                } catch (SQLException exception) {
                    logSqlFailure("configure the lazy Oracle data source", exception);
                    throw new TxEventQueueConfigurationException("Unable to configure the Oracle data source.");
                }
            }
            return dataSource;
        }
    }

    private String required(String value, String propertyName) {
        if (value == null || value.isBlank()) {
            throw new TxEventQueueConfigurationException(propertyName + " is required when txeventq.enabled=true.");
        }
        return value;
    }

    private void verifyConnection(Connection connection, QueueConfiguration configuration, String operation) throws SQLException {
        if (!connection.isValid(5)) {
            throw new SQLException("Oracle database connection validation failed.");
        }

        LOGGER.info("Connected successfully to Oracle database for TxEventQ {} operation.", operation);
        LOGGER.debug(
                "TxEventQ {} operation details: queue={}, consumer={}, maxMessages={}",
                operation,
                configuration.queueName(),
                configuration.consumerName(),
                configuration.maxMessages());
        LOGGER.debug(
                "Connected Oracle database: product={} version={}",
                connection.getMetaData().getDatabaseProductName(),
                connection.getMetaData().getDatabaseProductVersion());
    }

    private void logSqlFailure(String operation, SQLException exception) {
        SQLException diagnostic = new SQLException(
                "TxEventQ database operation failed. The original SQL exception message is omitted to avoid logging connection details.");
        diagnostic.setStackTrace(exception.getStackTrace());
        LOGGER.error(
                "Unable to {} (SQLState={}, errorCode={}).",
                operation,
                exception.getSQLState(),
                exception.getErrorCode(),
                diagnostic);
    }

    private record QueueConfiguration(
            String jdbcUrl,
            String username,
            String password,
            String queueName,
            String consumerName,
            int maxMessages) {
    }
}
