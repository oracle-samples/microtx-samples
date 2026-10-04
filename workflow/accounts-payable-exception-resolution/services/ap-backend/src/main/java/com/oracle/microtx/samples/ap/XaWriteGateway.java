package com.oracle.microtx.samples.ap;

import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.context.annotation.Lazy;
import org.springframework.stereotype.Component;
import org.springframework.web.context.annotation.RequestScope;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.SQLException;

/** The one gateway used for writes enlisted in the workflow's short XA transaction. */
@Component
@RequestScope
public class XaWriteGateway {
    private final Connection connection;

    public XaWriteGateway(@Qualifier("microTxSqlConnection") @Lazy Connection connection) {
        this.connection = connection;
    }

    public int update(String sql, Object... args) throws SQLException {
        try (PreparedStatement statement = connection.prepareStatement(sql)) {
            for (int i = 0; i < args.length; i++) statement.setObject(i + 1, args[i]);
            return statement.executeUpdate();
        }
    }
}
