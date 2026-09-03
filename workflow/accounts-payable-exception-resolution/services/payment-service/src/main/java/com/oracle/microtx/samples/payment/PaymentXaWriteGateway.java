package com.oracle.microtx.samples.payment;

import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.context.annotation.Lazy;
import org.springframework.stereotype.Component;
import org.springframework.web.context.annotation.RequestScope;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.SQLException;

/** Writes to payment instructions use this MicroTx-managed XA connection only. */
@Component
@RequestScope
public class PaymentXaWriteGateway {
  private final Connection connection;
  public PaymentXaWriteGateway(@Qualifier("microTxSqlConnection") @Lazy Connection connection){this.connection=connection;}
  int update(String sql,Object...args)throws SQLException{try(PreparedStatement statement=connection.prepareStatement(sql)){for(int i=0;i<args.length;i++)statement.setObject(i+1,args[i]);return statement.executeUpdate();}}
}
