"""bank-mock - the external settlement rail. Not an XA participant.

A bank will not join your XA transaction. Settlement therefore happens after
the transaction commits, as its own durable operation with a stable business
identity, idempotent request handling, and a status you can go back and read.

The one behaviour this service exists to prove:

    A TIMEOUT IS NOT A FAILURE.

POST /settlements?simulateTimeout=true RECORDS the settlement and only then
sleeps past the caller's timeout. The caller gives up and sees an error. The
money moved anyway. Retrying blindly at that point is how you pay a supplier
twice; the correct recovery is to reconcile by operation id, which is what
GET /settlements/{operationId} and the workflow's Reconcile_Settlement task do.
"""

import asyncio
import os
from datetime import datetime, timezone
from typing import Any, Dict, Optional

from fastapi import FastAPI, Header, HTTPException, Query, Response
from pydantic import BaseModel

app = FastAPI(title="bank-mock", version="1.0.0",
              description="Non-XA settlement rail with timeout simulation.")

SERVICE_PORT = int(os.getenv("PORT", "8085"))
# How long to sleep after recording, when a timeout is simulated. Must be
# comfortably longer than the caller's read timeout.
TIMEOUT_SLEEP_SECONDS = float(os.getenv("SETTLEMENT_TIMEOUT_SLEEP_SECONDS", "15"))

# operationId -> settlement record.
SETTLEMENTS: Dict[str, Dict[str, Any]] = {}


class SettlementRequest(BaseModel):
    operationId: str
    instructionId: Optional[str] = None
    supplierId: Optional[str] = None
    amount: float
    currency: str = "USD"


@app.get("/healthz")
def healthz() -> Dict[str, str]:
    return {"status": "UP", "service": "bank-mock"}


@app.post("/settlements")
async def settle(
    req: SettlementRequest,
    response: Response,
    simulateTimeout: bool = Query(default=False),
    idempotency_key: Optional[str] = Header(default=None, alias="Idempotency-Key"),
) -> Dict[str, Any]:
    key = idempotency_key or req.operationId

    if key in SETTLEMENTS:
        response.headers["Idempotent-Replay"] = "true"
        return SETTLEMENTS[key]

    settlement = {
        "operationId": req.operationId,
        "settlementId": f"STL-{abs(hash(key)) % 900000 + 100000}",
        "instructionId": req.instructionId,
        "amount": req.amount,
        "currency": req.currency,
        "status": "SETTLED",
        "settledAt": datetime.now(timezone.utc).isoformat(),
    }
    # Record BEFORE sleeping. This ordering is the whole point: by the time the
    # caller's clock runs out, the settlement already exists.
    SETTLEMENTS[key] = settlement

    if simulateTimeout:
        await asyncio.sleep(TIMEOUT_SLEEP_SECONDS)

    return settlement


@app.get("/settlements/{operation_id}")
def get_settlement(operation_id: str) -> Dict[str, Any]:
    """Reconciliation lookup. Answers 'did it actually happen?' after a timeout."""
    settlement = SETTLEMENTS.get(operation_id)
    if not settlement:
        raise HTTPException(status_code=404,
                            detail=f"No settlement for {operation_id}")
    return {"operationId": operation_id, "status": settlement["status"],
            "settlementId": settlement["settlementId"],
            "amount": settlement["amount"], "currency": settlement["currency"],
            "settledAt": settlement["settledAt"]}


@app.get("/settlements")
def list_settlements() -> Dict[str, Any]:
    """Used by the replay test to assert a timeout produced no second payment."""
    return {"count": len(SETTLEMENTS), "settlements": list(SETTLEMENTS.values())}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=SERVICE_PORT)
