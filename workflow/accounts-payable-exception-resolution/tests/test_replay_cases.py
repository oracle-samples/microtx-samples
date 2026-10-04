"""Deterministic regression replay for the compact AP runtime.

This mirrors the workflow's important control sequence: mandatory prechecks,
planner only for an exception, verification of planner-cited facts, one
business-policy evaluation,
short XA-like local writes, then separately reconciled settlement. The planner
below is scripted so CI tests contracts rather than an LLM's wording.
"""

import json
import os
import uuid

import pytest
import requests

REPO_ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
TEST_DATA = os.path.join(REPO_ROOT, "test-data")
AP = os.getenv("AP_BACKEND_URL", os.getenv("AP_URL", "http://localhost:8083"))
PAYMENT = os.getenv("PAYMENT_URL", "http://localhost:8084")
BANK = os.getenv("BANK_URL", "http://localhost:8085")
SERVICES = {"ap-backend": AP, "payment-service": PAYMENT, "bank-mock": BANK}
SETTLE_TIMEOUT_SECONDS = float(os.getenv("SETTLE_TIMEOUT_SECONDS", "3"))


def _services_down():
    down = []
    for name, url in SERVICES.items():
        try:
            if requests.get(f"{url}/healthz", timeout=2).status_code != 200:
                down.append(name)
        except requests.RequestException:
            down.append(name)
    return down


pytestmark = pytest.mark.skipif(bool(_services_down()), reason="Services are not running: %s" % ", ".join(_services_down() or ["-"]))


def load_case(filename):
    with open(os.path.join(TEST_DATA, filename), encoding="utf-8") as handle:
        return json.load(handle)


def scripted_planner(invoice, precheck):
    """Use only dynamic read-only evidence; basic AP controls are already done."""
    supplier_id = invoice["supplierId"]
    facts = precheck["facts"]
    evidence, risks = [], []
    if facts["amountVariance"] != 0:
        contract = requests.get(f"{AP}/evidence/suppliers/{supplier_id}/contract", timeout=5).json()
        within = 0 <= facts["amountVariance"] <= float(contract["freightAllowance"])
        evidence.append({"type": "contract", "reference": f"{contract['contractId']} {contract['clause']}",
                         "finding": "FREIGHT_WITHIN_ALLOWANCE" if within else "FREIGHT_EXCEEDS_ALLOWANCE"})
        if not within:
            risks.append("amount_variance_unexplained")
    if not facts["receiptComplete"]:
        supplier = requests.get(f"{AP}/evidence/suppliers/{supplier_id}", timeout=5).json()
        evidence.append({"type": "supplier", "reference": supplier_id, "finding": supplier["status"]})
        risks.append("goods_receipt_incomplete")
        if supplier["status"] != "ACTIVE":
            risks.append("supplier_blocked")
    if facts["bankChangePending"]:
        bank = requests.get(f"{AP}/evidence/suppliers/{supplier_id}/bank-verification", timeout=5).json()
        evidence.append({"type": "bank_verification", "reference": supplier_id, "finding": bank["status"]})
        risks.append("supplier_bank_change_unverified")
    if precheck["exceptionContext"].get("requiresHumanReview") and not risks:
        risks.append("precheck_requires_human_review")
    return {"status": "SUCCESS", "decision": "ESCALATE" if risks else "APPROVE",
            "evidence": evidence, "unresolvedRisks": risks,
            "reason": "Exception investigation completed from the supplied precheck context."}


def run_case(case, human_decision=None):
    operation_id, invoice = case["operationId"], case["invoice"]
    result = {"operationId": operation_id, "invoiceId": invoice["invoiceId"], "paymentScheduled": False,
              "settlementStatus": "NONE", "humanDecision": None, "plannerStatus": "NOT_RUN"}
    precheck = requests.post(f"{AP}/prechecks", timeout=10, json={"invoice": invoice}).json()
    result["precheck"] = precheck
    if precheck["status"] == "REJECT":
        requests.post(f"{AP}/invoices/{invoice['invoiceId']}/reject", timeout=5,
                      json={"operationId": operation_id, "reason": "; ".join(precheck["reasons"])}).raise_for_status()
        result.update({"policyStatus": "NOT_EVALUATED", "policyReasons": precheck["reasons"],
                       "outcome": "INVOICE_REJECTED_BY_PRECHECK"})
        return result

    decision, verification = None, None
    if precheck["status"] == "EXCEPTION":
        decision = scripted_planner(invoice, precheck)
        verification = requests.post(f"{AP}/verify-evidence", timeout=10,
                                     json={"invoice": invoice, "decision": decision}).json()
        result.update({"plannerStatus": decision["decision"], "decision": decision, "verification": verification})
        if decision["decision"] == "ESCALATE":
            result["humanDecision"] = human_decision
    policy = requests.post(f"{AP}/policy/evaluate", timeout=10, json={
        "invoice": invoice, "precheck": precheck, "plannerDecision": decision,
        "evidenceVerification": verification, "humanDecision": result["humanDecision"]}).json()
    result["policyStatus"], result["policyReasons"] = policy["status"], policy["reasons"]
    if policy["status"] == "REJECT":
        requests.post(f"{AP}/invoices/{invoice['invoiceId']}/reject", timeout=5,
                      json={"operationId": operation_id, "reason": "; ".join(policy["reasons"])}).raise_for_status()
        result["outcome"] = "INVOICE_REJECTED_BY_POLICY"
        return result
    if policy["status"] == "REQUIRE_REVIEW":
        result["outcome"] = "MANUAL_REVIEW_REQUIRED"
        return result
    headers = {"Idempotency-Key": operation_id, "X-Transaction-Id": f"TX-{uuid.uuid5(uuid.NAMESPACE_OID, operation_id)}"}
    requests.post(f"{AP}/invoices/{invoice['invoiceId']}/payment-scheduled", timeout=10, headers=headers,
                  json={"operationId": operation_id, "amount": invoice["amount"], "currency": invoice["currency"]}).raise_for_status()
    instruction = requests.post(f"{PAYMENT}/payment-instructions", timeout=10, headers=headers,
                                json={"operationId": operation_id, "invoiceId": invoice["invoiceId"], "supplierId": invoice["supplierId"], "amount": invoice["amount"], "currency": invoice["currency"]})
    instruction.raise_for_status()
    result.update({"paymentScheduled": True, "instructionId": instruction.json()["instructionId"], "settlementCallTimedOut": False})
    try:
        requests.post(f"{BANK}/settlements", timeout=SETTLE_TIMEOUT_SECONDS, headers={"Idempotency-Key": operation_id},
                      params={"simulateTimeout": str(bool(invoice.get("simulateSettlementTimeout"))).lower()},
                      json={"operationId": operation_id, "instructionId": result["instructionId"], "supplierId": invoice["supplierId"], "amount": invoice["amount"], "currency": invoice["currency"]})
    except requests.Timeout:
        result["settlementCallTimedOut"] = True
    reconciliation = requests.get(f"{BANK}/settlements/{operation_id}", timeout=10)
    result["settlementStatus"] = reconciliation.json()["status"] if reconciliation.ok else "UNKNOWN"
    result["outcome"] = "PAYMENT_SETTLED" if result["settlementStatus"] == "SETTLED" else "SETTLEMENT_UNCONFIRMED"
    return result


APPROVED = {"approved": True, "reviewer": "ap.reviewer@example.com", "note": "Confirmed new account by callback to known contact"}


@pytest.mark.parametrize("filename,human,planner,policy,outcome", [
    ("01-clean.json", None, "NOT_RUN", "APPROVE", "PAYMENT_SETTLED"),
    ("02-freight-variance.json", None, "APPROVE", "APPROVE", "PAYMENT_SETTLED"),
    ("03-bank-change.json", APPROVED, "ESCALATE", "APPROVE", "PAYMENT_SETTLED"),
    ("04-duplicate.json", None, "NOT_RUN", "NOT_EVALUATED", "INVOICE_REJECTED_BY_PRECHECK"),
    ("05-partial-receipt.json", APPROVED, "ESCALATE", "REJECT", "INVOICE_REJECTED_BY_POLICY"),
    ("06-payment-timeout.json", None, "NOT_RUN", "APPROVE", "PAYMENT_SETTLED"),
])
def test_case_reaches_expected_outcome(filename, human, planner, policy, outcome):
    result = run_case(load_case(filename), human)
    assert result["plannerStatus"] == planner
    assert result["policyStatus"] == policy
    assert result["outcome"] == outcome
    if planner != "NOT_RUN":
        assert result["verification"]["valid"] is True


def test_precheck_keeps_duplicate_and_baseline_matching_out_of_the_planner():
    duplicate = run_case(load_case("04-duplicate.json"))
    assert duplicate["precheck"]["facts"]["duplicateFound"] is True
    assert duplicate["plannerStatus"] == "NOT_RUN"
    variance = run_case(load_case("02-freight-variance.json"))
    assert variance["precheck"]["exceptionContext"]["exceptionType"] == "AMOUNT_VARIANCE"
    assert variance["decision"]["evidence"][0]["type"] == "contract"


def test_human_approval_is_contextual_but_cannot_bypass_hard_controls():
    result = run_case(load_case("05-partial-receipt.json"), APPROVED)
    assert result["humanDecision"]["approved"] is True
    assert any(reason.startswith("supplier_blocked") for reason in result["policyReasons"])
    assert result["paymentScheduled"] is False


def test_verification_rejects_a_planner_fact_that_contradicts_source():
    invoice = load_case("05-partial-receipt.json")["invoice"]
    dishonest = {"status": "SUCCESS", "decision": "APPROVE", "evidence": [
        {"type": "supplier", "reference": "SUP-VERTEX", "finding": "ACTIVE"}], "unresolvedRisks": [], "reason": "Everything is fine."}
    verified = requests.post(f"{AP}/verify-evidence", timeout=10, json={"invoice": invoice, "decision": dishonest}).json()
    assert verified["valid"] is False
    assert "BLOCKED" in verified["reason"]


def test_settlement_timeout_reconciles_one_payment():
    case = load_case("06-payment-timeout.json")
    case["operationId"] = f"{case['operationId']}-{uuid.uuid4().hex[:8]}"
    result = run_case(case)
    assert result["settlementCallTimedOut"] is True
    assert result["settlementStatus"] == "SETTLED"
    settlements = requests.get(f"{BANK}/settlements", timeout=5).json()["settlements"]
    assert len([item for item in settlements if item["operationId"] == case["operationId"]]) == 1
