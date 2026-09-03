package com.oracle.microtx.samples.ap;

import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.ResultSetMetaData;
import java.sql.SQLException;
import java.time.OffsetDateTime;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import javax.sql.DataSource;

/** Ordinary AP reads and non-XA rejection writes. */
@Component
public class SqlGateway {
    private final DataSource dataSource;
    public SqlGateway(@Qualifier("apReadDataSource") DataSource dataSource) { this.dataSource = dataSource; }
    public List<Map<String, Object>> query(String sql, Object... args) throws SQLException {
        try (Connection connection = dataSource.getConnection(); PreparedStatement ps = statement(connection, sql, args); ResultSet rs = ps.executeQuery()) {
            ResultSetMetaData md = rs.getMetaData(); List<Map<String,Object>> rows = new ArrayList<>();
            while (rs.next()) { Map<String,Object> row = new LinkedHashMap<>(); for (int i=1;i<=md.getColumnCount();i++) row.put(camel(md.getColumnLabel(i)), value(rs.getObject(i))); rows.add(row); }
            return rows;
        }
    }
    public int update(String sql, Object... args) throws SQLException { try (Connection connection = dataSource.getConnection(); PreparedStatement ps = statement(connection,sql,args)) { return ps.executeUpdate(); } }
    private PreparedStatement statement(Connection connection, String sql, Object... args) throws SQLException { PreparedStatement ps=connection.prepareStatement(sql); for(int i=0;i<args.length;i++) ps.setObject(i+1,args[i]); return ps; }
    private Object value(Object value) {
        if(value instanceof BigDecimal n) return n.doubleValue();
        if(value instanceof java.sql.Timestamp t) return t.toInstant().toString();
        if(value instanceof java.sql.Date d) return d.toLocalDate().toString();
        // Oracle returns TIMESTAMP WITH TIME ZONE as oracle.sql.TIMESTAMPTZ,
        // which Jackson cannot serialize directly.
        if(value != null && value.getClass().getName().startsWith("oracle.sql.TIMESTAMP")) return value.toString();
        return value;
    }
    private String camel(String name) { StringBuilder b=new StringBuilder(); boolean upper=false; for(char c:name.toLowerCase().toCharArray()){if(c=='_'){upper=true;}else{b.append(upper?Character.toUpperCase(c):c);upper=false;}} return b.toString(); }
}
