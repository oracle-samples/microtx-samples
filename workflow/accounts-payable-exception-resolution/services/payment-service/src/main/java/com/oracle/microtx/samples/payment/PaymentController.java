package com.oracle.microtx.samples.payment;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;
import java.sql.SQLException;
import java.util.*;
@RestController
public class PaymentController {
  private final PaymentSqlGateway db; private final PaymentXaWriteGateway xaDb; private final boolean defaultFailure;
  public PaymentController(PaymentSqlGateway db,PaymentXaWriteGateway xaDb,@Value("${payment.simulate-failure:false}") boolean defaultFailure){this.db=db;this.xaDb=xaDb;this.defaultFailure=defaultFailure;}
  @GetMapping("/healthz") Map<String,Object> health(){return Map.of("status","UP","service","payment-service","storage","Oracle XA");}
  @PostMapping("/payment-instructions") Map<String,Object> create(@RequestBody Map<String,Object> request,@RequestParam(defaultValue="false") boolean simulateFailure,@RequestHeader(value="Idempotency-Key",required=false) String idempotencyKey){
    String operationId=str(request.get("operationId")); String key=idempotencyKey==null||idempotencyKey.isBlank()?operationId:idempotencyKey; Map<String,Object> existing=optional("SELECT instruction_id,operation_id,invoice_id,supplier_id,amount,currency,status,created_at FROM payment_instructions WHERE idempotency_key=?",key); if(!existing.isEmpty())return existing;
    String instructionId="PI-"+UUID.nameUUIDFromBytes(key.getBytes()).toString().substring(0,8).toUpperCase();
    double amount=number(request.get("amount")); String invoiceId=str(request.get("invoiceId")); String supplierId=str(request.get("supplierId")); String currency=strOr(request.get("currency"),"USD");
    try{
      xaDb.update("INSERT INTO payment_instructions (instruction_id,idempotency_key,operation_id,invoice_id,supplier_id,amount,currency,status,created_at) VALUES (?, ?, ?, ?, ?, ?, ?, 'CREATED', SYSTIMESTAMP)",instructionId,key,operationId,invoiceId,supplierId,amount,currency);
      // Deliberately fail only after this branch has written. This makes the
      // rollback demo prove that TCS removes BOTH participant writes.
      if(simulateFailure||defaultFailure)throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR,"Simulated payment-service failure (injected after XA write)");
      // This write is deliberately still uncommitted until TCS commits the XA
      // branch. A normal read-pool connection cannot observe it, so return the
      // request's durable instruction identity rather than re-querying here.
      return Map.of("instructionId",instructionId,"operationId",operationId,
          "invoiceId",invoiceId,"supplierId",supplierId,"amount",amount,
          "currency",currency,"status","CREATED");
    }catch(SQLException e){throw database(e);}
  }
  @GetMapping("/payment-instructions/{operationId}") Map<String,Object> instruction(@PathVariable String operationId){Map<String,Object> r=optional("SELECT instruction_id,operation_id,invoice_id,supplier_id,amount,currency,status,created_at FROM payment_instructions WHERE operation_id=?",operationId);if(r.isEmpty())throw new ResponseStatusException(HttpStatus.NOT_FOUND,"No payment instruction for "+operationId);return r;}
  @GetMapping("/payment-instructions") Map<String,Object> list(){List<Map<String,Object>> all=query("SELECT instruction_id,operation_id,invoice_id,supplier_id,amount,currency,status,created_at FROM payment_instructions ORDER BY created_at");return Map.of("count",all.size(),"instructions",all);}
  private Map<String,Object> optional(String sql,Object...args){List<Map<String,Object>> rows=query(sql,args);return rows.isEmpty()?Map.of():rows.get(0);} private List<Map<String,Object>> query(String sql,Object...args){try{return db.query(sql,args);}catch(SQLException e){throw database(e);}}
  private double number(Object v){return v instanceof Number n?n.doubleValue():Double.parseDouble(str(v));}private String str(Object v){return v==null?"":v.toString();}private String strOr(Object v,String fallback){String s=str(v);return s.isBlank()?fallback:s;}private ResponseStatusException database(Exception e){return new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR,"Database operation failed",e);}
}
