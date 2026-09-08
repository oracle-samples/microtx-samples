package com.oracle.microtx.samples.payment;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.stereotype.Component;
import java.math.BigDecimal;
import java.sql.*;
import java.util.*;
import javax.sql.DataSource;
@Component
public class PaymentSqlGateway {
  private final DataSource dataSource;
  public PaymentSqlGateway(@Qualifier("paymentReadDataSource") DataSource dataSource){this.dataSource=dataSource;}
  List<Map<String,Object>> query(String sql,Object...args)throws SQLException{try(Connection connection=dataSource.getConnection();PreparedStatement ps=statement(connection,sql,args);ResultSet rs=ps.executeQuery()){ResultSetMetaData md=rs.getMetaData();List<Map<String,Object>> rows=new ArrayList<>();while(rs.next()){Map<String,Object> row=new LinkedHashMap<>();for(int i=1;i<=md.getColumnCount();i++)row.put(camel(md.getColumnLabel(i)),value(rs.getObject(i)));rows.add(row);}return rows;}}
  int update(String sql,Object...args)throws SQLException{try(Connection connection=dataSource.getConnection();PreparedStatement ps=statement(connection,sql,args)){return ps.executeUpdate();}}
  private PreparedStatement statement(Connection connection,String sql,Object...args)throws SQLException{PreparedStatement ps=connection.prepareStatement(sql);for(int i=0;i<args.length;i++)ps.setObject(i+1,args[i]);return ps;}
  private Object value(Object v){if(v instanceof BigDecimal n)return n.doubleValue();if(v instanceof Timestamp t)return t.toInstant().toString();if(v!=null&&v.getClass().getName().startsWith("oracle.sql.TIMESTAMP"))return v.toString();return v;}
  private String camel(String s){StringBuilder b=new StringBuilder();boolean up=false;for(char c:s.toLowerCase().toCharArray()){if(c=='_')up=true;else{b.append(up?Character.toUpperCase(c):c);up=false;}}return b.toString();}
}
