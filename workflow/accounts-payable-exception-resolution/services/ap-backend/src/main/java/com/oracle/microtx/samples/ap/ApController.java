package com.oracle.microtx.samples.ap;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

import java.sql.SQLException;
import java.time.Instant;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@RestController
public class ApController {
    private static final int DUPLICATE_WINDOW_DAYS = 90;
    private final SqlGateway db;
    private final XaWriteGateway xaDb;
    private final double approvalThreshold;
    public ApController(SqlGateway db, XaWriteGateway xaDb, @Value("${policy.approval-threshold}") double approvalThreshold) { this.db=db; this.xaDb=xaDb; this.approvalThreshold=approvalThreshold; }

    @GetMapping("/healthz") public Map<String,Object> health() { return Map.of("status","UP", "service","ap-backend", "storage","Oracle XA"); }

    @GetMapping("/evidence/purchase-orders/{poId}") public Map<String,Object> po(@PathVariable String poId) { return one("SELECT po_id, supplier_id, amount, currency, status, description FROM ap_purchase_orders WHERE po_id=?", poId); }
    @GetMapping("/evidence/purchase-orders/{poId}/receipt") public Map<String,Object> receipt(@PathVariable String poId) { return one("SELECT receipt_id, po_id, status, ordered_qty, received_qty, received_at, note FROM ap_goods_receipts WHERE po_id=?", poId); }
    @GetMapping("/evidence/suppliers/{supplierId}") public Map<String,Object> supplier(@PathVariable String supplierId) { return one("SELECT supplier_id, name, status, status_reason, onboarded_at FROM ap_suppliers WHERE supplier_id=?", supplierId); }
    @GetMapping("/evidence/suppliers/{supplierId}/contract") public Map<String,Object> contract(@PathVariable String supplierId) { return one("SELECT supplier_id, contract_id, clause, freight_allowance, currency, text FROM ap_contracts WHERE supplier_id=?", supplierId); }
    @GetMapping("/evidence/suppliers/{supplierId}/bank-verification") public Map<String,Object> bank(@PathVariable String supplierId) { return one("SELECT supplier_id, status, account_last4, previous_account_last4, last_changed_at, verified_at, verified_by, change_channel FROM ap_bank_verifications WHERE supplier_id=?", supplierId); }

    @GetMapping("/evidence/invoices/duplicates")
    public Map<String,Object> duplicatesEndpoint(@RequestParam String supplierId, @RequestParam String invoiceNumber, @RequestParam double amount,
                                         @RequestParam(defaultValue="90") int windowDays) {
        List<Map<String,Object>> matches = duplicateMatches(supplierId, invoiceNumber, amount, windowDays);
        return Map.of("supplierId",supplierId,"invoiceNumber",invoiceNumber,"amount",amount,"windowDays",windowDays,
                "duplicateFound",!matches.isEmpty(),"matches",matches,
                "rule","same supplier AND within window AND (normalised number match OR exact amount match)");
    }

    @PostMapping("/prechecks")
    public Map<String,Object> prechecks(@RequestBody Map<String,Object> request) {
        Map<String,Object> invoice = map(request.get("invoice")); String operationId=str(request.get("operationId")); Map<String,Object> facts=facts(invoice, operationId);
        if (bool(facts, "operationAlreadyPrepared")) {
            return Map.of("status", "ALREADY_PROCESSED", "reasons", List.of("operation_already_prepared"), "facts", facts,
                    "exceptionContext", Map.of("operationAlreadyPrepared", true));
        }
        if (bool(facts, "invoiceAlreadyPreparedByAnotherOperation")) {
            return Map.of("status", "DUPLICATE_OPERATION", "reasons", List.of("invoice_already_scheduled"), "facts", facts,
                    "exceptionContext", Map.of("invoiceAlreadyPreparedByAnotherOperation", true));
        }
        boolean hard = bool(facts,"supplierBlocked") || bool(facts,"duplicateFound");
        boolean review = bool(facts,"bankChangePending") || number(invoice,"amount") >= approvalThreshold;
        boolean exception = !bool(facts,"receiptComplete") || number(facts,"amountVariance") != 0 || review;
        List<String> reasons=new ArrayList<>();
        if(bool(facts,"supplierBlocked"))reasons.add("supplier_blocked"); if(bool(facts,"duplicateFound"))reasons.add("duplicate_invoice");
        if(!bool(facts,"receiptComplete"))reasons.add("receipt_incomplete"); if(number(facts,"amountVariance")!=0)reasons.add("amount_variance");
        if(bool(facts,"bankChangePending"))reasons.add("bank_change_unverified"); if(number(invoice,"amount")>=approvalThreshold)reasons.add("approval_threshold_exceeded");
        Map<String,Object> context = new LinkedHashMap<>();
        context.put("exceptionType", !bool(facts,"receiptComplete") ? "RECEIPT_EXCEPTION" : number(facts,"amountVariance") != 0 ? "AMOUNT_VARIANCE" : null);
        for(String key: List.of("invoiceAmount","poAmount","amountVariance","receiptStatus","duplicateFound")) context.put(key,facts.get(key));
        context.put("requiresHumanReview",review);
        return Map.of("status", hard?"REJECT":exception?"EXCEPTION":"CLEAR", "reasons",reasons,"facts",facts,"exceptionContext",context);
    }

    @PostMapping("/planner-decision")
    public Map<String,Object> plannerDecision(@RequestBody Map<String,Object> request) {
        Map<String,Object> output=map(request.get("plannerOutput")); Map<String,Object> finalDecision=finalDecision(output);
        if(finalDecision.isEmpty() || finalDecision.get("decision")==null) throw bad("Agentic Planner output has no final decision in plannerHistory or data");
        return finalDecision;
    }

    @PostMapping("/verify-evidence")
    public Map<String,Object> verify(@RequestBody Map<String,Object> request) {
        Map<String,Object> invoice=map(request.get("invoice")), decision=map(request.get("decision")), facts=facts(invoice, "");
        List<Map<String,Object>> checked=new ArrayList<>(); Object raw=decision.get("evidence");
        if(raw instanceof List<?> evidence) for(Object entry:evidence) {
            Map<String,Object> item=map(entry); String type=str(item.get("type")), claimed=str(item.get("finding")).toUpperCase(), reference=str(item.get("reference"));
            String actual=finding(type,facts); if(actual==null) return invalid("Decision cites unknown evidence type '"+type+"'",facts,checked);
            if(!claimed.equals(actual)) return invalid("Planner claimed "+type+" "+claimed+" but source status is "+actual,facts,checked);
            String id=evidenceId(type,invoice,facts); if(id!=null && !reference.toUpperCase().contains(id.toUpperCase())) return invalid("Planner cited "+type+" '"+reference+"' but the record on file is "+id,facts,checked);
            checked.add(Map.of("type",type,"reference",reference,"claimed",claimed,"actual",actual,"agrees",true));
        }
        Map<String,Object> verified = new LinkedHashMap<>(); verified.put("valid",true); verified.put("reason",null); verified.put("checked",checked); verified.put("facts",facts); return verified;
    }

    @PostMapping("/policy/evaluate")
    public Map<String,Object> policy(@RequestBody Map<String,Object> request) {
        Map<String,Object> invoice=map(request.get("invoice")), precheck=map(request.get("precheck")), facts=map(precheck.get("facts"));
        Map<String,Object> planner=map(request.get("plannerDecision")), verification=map(request.get("evidenceVerification")), humanEnvelope=map(request.get("humanDecision"));
        // The demo Human-task UI records its real task status. COMPLETED is the
        // approval signal; Rejected or Failed is a policy rejection. Keep an
        // optional explicit boolean for a future richer review form, but task
        // status remains the authoritative gate.
        Map<String,Object> humanOutput=map(humanEnvelope.get("output"));
        Map<String,Object> human=humanOutput.isEmpty()?humanEnvelope:humanOutput;
        String humanStatus=str(humanEnvelope.get("completionStatus"));
        boolean humanPresent=human.containsKey("approved");
        boolean humanApproved="COMPLETED".equals(humanStatus) && (!humanPresent || bool(human,"approved"));
        List<String> reasons=new ArrayList<>();
        if(!planner.isEmpty() && !bool(verification,"valid")) return policy("REJECT",List.of("evidence_verification_failed: "+str(verification.get("reason"))));
        if(bool(facts,"supplierBlocked")) return policy("REJECT",List.of("supplier_blocked: "+str(invoice.get("supplierId"))));
        if(bool(facts,"duplicateFound")) return policy("REJECT",List.of("duplicate_invoice"));
        if(!bool(facts,"receiptComplete")) return policy("REJECT",List.of("receipt_incomplete: "+str(facts.get("receiptStatus"))));
        if(number(facts,"amountVariance")!=0 && !bool(facts,"freightWithinAllowance")) return policy("REJECT",List.of("amount_variance_not_explained_by_contract"));
        if("REJECT".equals(str(planner.get("decision")))) return policy("REJECT",List.of("investigation_recommends_reject: "+str(planner.get("reason"))));
        if(humanPresent && !bool(human,"approved")) return policy("REJECT",List.of("human_review_declined: "+str(human.get("note"))));
        if("ESCALATE".equals(str(planner.get("decision"))) && !humanApproved) return policy("REJECT",List.of("human_review_not_completed: "+humanStatus));
        if(bool(facts,"bankChangePending") && !humanApproved) return policy("REJECT",List.of("bank_change_unverified"));
        if(number(invoice,"amount")>=approvalThreshold && !humanApproved) return policy("REJECT",List.of("approval_threshold_exceeded"));
        reasons.add("all_gates_passed");
        if(humanApproved && humanPresent) reasons.add("human_approval_recorded: "+str(human.get("reviewer")));
        if(humanApproved && !humanPresent && "ESCALATE".equals(str(planner.get("decision")))) reasons.add("human_review_completed");
        return policy("APPROVE",reasons);
    }

    @GetMapping("/invoices/{invoiceId}") public Map<String,Object> invoice(@PathVariable String invoiceId) { return one("SELECT invoice_id, status, operation_id, amount, currency, scheduled_date, reason, updated_at FROM ap_invoices WHERE invoice_id=?",invoiceId); }

    @PostMapping("/invoices/{invoiceId}/payment-scheduled")
    public Map<String,Object> schedule(@PathVariable String invoiceId, @RequestBody Map<String,Object> request,
                                        @RequestHeader(value="Idempotency-Key",required=false) String idempotencyKey) {
        String operationId=str(request.get("operationId")); String key=idempotencyKey==null||idempotencyKey.isBlank()?operationId:idempotencyKey;
        List<Map<String,Object>> replay=query("SELECT invoice_id FROM ap_payment_operations WHERE idempotency_key=?",key);
        if(!replay.isEmpty()) return invoice(str(replay.get(0).get("invoiceId")));
        try {
            Map<String,Object> current=optional("SELECT status,operation_id FROM ap_invoices WHERE invoice_id=?",invoiceId);
            if("PAYMENT_SCHEDULED".equals(str(current.get("status"))) && !operationId.equals(str(current.get("operationId")))) {
                throw new ResponseStatusException(HttpStatus.CONFLICT, "Invoice already has payment operation "+str(current.get("operationId")));
            }
            int updated=xaDb.update("UPDATE ap_invoices SET status='PAYMENT_SCHEDULED', operation_id=?, amount=?, currency=?, scheduled_date=?, reason=NULL, updated_at=SYSTIMESTAMP WHERE invoice_id=?",operationId,number(request,"amount"),strOr(request.get("currency"),"USD"),request.get("scheduledDate"),invoiceId);
            if(updated==0) xaDb.update("INSERT INTO ap_invoices (invoice_id,status,operation_id,amount,currency,scheduled_date,updated_at) VALUES (?, 'PAYMENT_SCHEDULED', ?, ?, ?, ?, SYSTIMESTAMP)",invoiceId,operationId,number(request,"amount"),strOr(request.get("currency"),"USD"),request.get("scheduledDate"));
            xaDb.update("INSERT INTO ap_payment_operations (idempotency_key, operation_id, invoice_id, created_at) VALUES (?, ?, ?, SYSTIMESTAMP)",key,operationId,invoiceId);
            return invoice(invoiceId);
        } catch(SQLException e) { throw database(e); }
    }

    @PostMapping("/invoices/{invoiceId}/reject")
    public Map<String,Object> reject(@PathVariable String invoiceId,@RequestBody Map<String,Object> request) {
        try { int n=db.update("UPDATE ap_invoices SET status='REJECTED', operation_id=?, reason=?, updated_at=SYSTIMESTAMP WHERE invoice_id=?",request.get("operationId"),str(request.get("reason")),invoiceId);
            if(n==0) db.update("INSERT INTO ap_invoices (invoice_id,status,operation_id,reason,updated_at) VALUES (?, 'REJECTED', ?, ?, SYSTIMESTAMP)",invoiceId,request.get("operationId"),str(request.get("reason"))); return invoice(invoiceId);
        } catch(SQLException e) { throw database(e); }
    }

    private Map<String,Object> facts(Map<String,Object> invoice, String operationId) {
        String supplierId=str(invoice.get("supplierId")), poId=str(invoice.get("poId")); double amount=number(invoice,"amount");
        Map<String,Object> supplier=optional("SELECT supplier_id,status FROM ap_suppliers WHERE supplier_id=?",supplierId), po=optional("SELECT po_id,amount FROM ap_purchase_orders WHERE po_id=?",poId), receipt=optional("SELECT receipt_id,status FROM ap_goods_receipts WHERE po_id=?",poId), bank=optional("SELECT status,last_changed_at FROM ap_bank_verifications WHERE supplier_id=?",supplierId), contract=optional("SELECT contract_id,freight_allowance FROM ap_contracts WHERE supplier_id=?",supplierId), existing=optional("SELECT status,operation_id FROM ap_invoices WHERE invoice_id=?",str(invoice.get("invoiceId")));
        Double poAmount=po.isEmpty()?null:number(po,"amount"); Double variance=poAmount==null?null:Math.round((amount-poAmount)*100d)/100d; double allowance=contract.isEmpty()?0:number(contract,"freightAllowance"); List<Map<String,Object>> matches=duplicateMatches(supplierId,str(invoice.get("invoiceNumber")),amount,DUPLICATE_WINDOW_DAYS);
        boolean scheduled="PAYMENT_SCHEDULED".equals(str(existing.get("status"))); boolean sameOperation=scheduled && !operationId.isBlank() && operationId.equals(str(existing.get("operationId")));
        if(scheduled && !sameOperation) matches.add(Map.of("invoiceId",str(invoice.get("invoiceId")),"operationId",str(existing.get("operationId")),"matchedOn","paymentPreparationState"));
        Map<String,Object> f=new LinkedHashMap<>(); f.put("supplierStatus",supplier.isEmpty()?"NOT_FOUND":supplier.get("status")); f.put("supplierBlocked","BLOCKED".equals(supplier.get("status"))); f.put("receiptId",receipt.get("receiptId")); f.put("receiptStatus",receipt.isEmpty()?"NOT_FOUND":receipt.get("status")); f.put("receiptComplete","COMPLETE".equals(receipt.get("status"))); f.put("bankVerificationStatus",bank.isEmpty()?"NOT_FOUND":bank.get("status")); f.put("bankChangePending","PENDING".equals(bank.get("status"))); f.put("bankLastChangedAt",bank.get("lastChangedAt")); f.put("duplicateFound",!matches.isEmpty()); f.put("duplicateMatches",matches); f.put("existingOperationId",existing.get("operationId")); f.put("operationAlreadyPrepared",sameOperation); f.put("invoiceAlreadyPreparedByAnotherOperation",scheduled&&!sameOperation); f.put("poId",poId); f.put("poAmount",poAmount); f.put("invoiceAmount",amount); f.put("amountVariance",variance); f.put("contractId",contract.get("contractId")); f.put("freightAllowance",allowance); f.put("freightWithinAllowance",variance!=null&&variance>=0&&variance<=allowance); return f;
    }
    private List<Map<String,Object>> duplicateMatches(String supplier,String invoiceNumber,double amount,int days) { return query("SELECT invoice_id,invoice_number,supplier_id,po_id,amount,currency,paid_at,payment_ref, CASE WHEN REGEXP_REPLACE(UPPER(invoice_number),'[^A-Z0-9]','')=REGEXP_REPLACE(UPPER(?),'[^A-Z0-9]','') THEN 'invoiceNumber' ELSE 'amount' END AS matched_on FROM ap_paid_invoices WHERE supplier_id=? AND paid_at >= TRUNC(SYSDATE)-? AND (REGEXP_REPLACE(UPPER(invoice_number),'[^A-Z0-9]','')=REGEXP_REPLACE(UPPER(?),'[^A-Z0-9]','') OR amount=?)",invoiceNumber,supplier,days,invoiceNumber,amount); }
    private String finding(String type,Map<String,Object> f) { return switch(type) { case "purchase_order" -> f.get("poAmount")==null?"NOT_FOUND":number(f,"amountVariance")==0?"AMOUNT_MATCH":"AMOUNT_VARIANCE"; case "goods_receipt" -> str(f.get("receiptStatus")); case "supplier" -> str(f.get("supplierStatus")); case "contract" -> f.get("contractId")==null?"NOT_FOUND":bool(f,"freightWithinAllowance")?"FREIGHT_WITHIN_ALLOWANCE":"FREIGHT_EXCEEDS_ALLOWANCE"; case "bank_verification" -> str(f.get("bankVerificationStatus")); case "duplicate_check" -> bool(f,"duplicateFound")?"DUPLICATE_FOUND":"NONE_FOUND"; default -> null; }; }
    private String evidenceId(String type,Map<String,Object> invoice,Map<String,Object> f) { return switch(type) {case "purchase_order"->str(f.get("poId"));case "goods_receipt"->str(f.get("receiptId"));case "supplier","bank_verification"->str(invoice.get("supplierId"));case "contract"->str(f.get("contractId"));default->null;}; }
    private Map<String,Object> finalDecision(Map<String,Object> output) { Object history=output.get("plannerHistory"); if(history instanceof List<?> h) for(int i=h.size()-1;i>=0;i--){Map<String,Object> data=map(map(h.get(i)).get("data"));if(data.containsKey("decision"))return data;} Map<String,Object> data=map(output.get("data")); return data.containsKey("decision")?data:output.containsKey("decision")?output:Map.of(); }
    private Map<String,Object> policy(String status,List<String> reasons){return Map.of("status",status,"reasons",reasons,"approvalThreshold",approvalThreshold,"evaluatedBy","ap-backend");}
    private Map<String,Object> one(String sql,Object... args){Map<String,Object> r=optional(sql,args);if(r.isEmpty())throw new ResponseStatusException(HttpStatus.NOT_FOUND,"Record not found");return r;}
    private Map<String,Object> optional(String sql,Object... args){List<Map<String,Object>> rows=query(sql,args);return rows.isEmpty()?Map.of():rows.get(0);}
    private List<Map<String,Object>> query(String sql,Object... args){try{return db.query(sql,args);}catch(SQLException e){throw database(e);}}
    @SuppressWarnings("unchecked") private Map<String,Object> map(Object value){return value instanceof Map<?,?> m?(Map<String,Object>)m:Map.of();}
    private boolean bool(Map<String,Object> m,String key){Object v=m.get(key);return v instanceof Boolean b?b:Boolean.parseBoolean(str(v));}
    private double number(Map<String,Object> m,String key){Object v=m.get(key);return v instanceof Number n?n.doubleValue():v==null?0:Double.parseDouble(v.toString());}
    private String str(Object v){return v==null?"":v.toString();} private String strOr(Object v,String otherwise){String s=str(v);return s.isBlank()?otherwise:s;}
    private ResponseStatusException bad(String message){return new ResponseStatusException(HttpStatus.UNPROCESSABLE_ENTITY,message);} private ResponseStatusException database(Exception e){return new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR,"Database operation failed",e);}
    private Map<String,Object> invalid(String reason,Map<String,Object> facts,List<Map<String,Object>> checked){Map<String,Object> r=new LinkedHashMap<>();r.put("valid",false);r.put("reason",reason);r.put("checked",checked);r.put("facts",facts);return r;}
}
