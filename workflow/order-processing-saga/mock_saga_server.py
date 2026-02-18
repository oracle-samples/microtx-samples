"""Mock Order Processing Saga server.

This Flask-based mock server exposes the same endpoints as the
`Order Processing Saga` Postman collection, including both the main
workflow and compensation (rollback) APIs. It uses in-memory state
to simulate the saga progression for a given orderId, which makes it
easy to automate end-to-end workflows from Postman or test scripts.

Endpoints (relative to a single base URL):

Main workflow
------------
- POST /api/orders                 -> Receive Order
- POST /api/payments              -> Execute Payment
- POST /api/inventory/debit       -> Debit Inventory
- POST /api/shipments             -> Deliver Order

Compensation workflow
---------------------
- POST /api/payments/refund       -> Refund Payment
- POST /api/inventory/credit      -> Release Inventory (Credit)
- POST /api/orders/cancel         -> Cancel Order

Usage:
  python mock_saga_server.py

"""

from __future__ import annotations

from dataclasses import dataclass, field
from datetime import datetime
from typing import Any, Dict, List

from flask import Flask, jsonify, request


app = Flask(__name__)


@dataclass
class OrderState:
    order_id: str
    items: List[Dict[str, Any]] = field(default_factory=list)
    amount: float = 0.0
    delivery_address: str | None = None
    status: str = "NEW"
    history: List[Dict[str, Any]] = field(default_factory=list)


# Simple in-memory state store keyed by orderId
ORDERS: Dict[str, OrderState] = {}


def now_iso() -> str:
    return datetime.utcnow().isoformat() + "Z"


@app.route("/api/orders", methods=["POST"])
def receive_order():
    payload = request.get_json(force=True, silent=True) or {}
    order_id = payload.get("orderId")

    if not order_id:
        return (
            jsonify({"error": "InvalidRequest", "message": "orderId is required"}),
            400,
        )

    items = payload.get("items", [])
    amount = float(payload.get("amount", 0))
    delivery_address = payload.get("deliveryAddress")

    state = ORDERS.get(order_id) or OrderState(order_id=order_id)
    state.items = items
    state.amount = amount
    state.delivery_address = delivery_address
    state.status = "RECEIVED"
    state.history.append({"event": "ORDER_RECEIVED", "at": now_iso(), "payload": payload})
    ORDERS[order_id] = state

    return (
        jsonify(
            {
                "orderId": order_id,
                "status": "RECEIVED",
                "message": "Order has been successfully received and is pending payment.",
                "receivedAt": now_iso(),
            }
        ),
        201,
    )


@app.route("/api/payments", methods=["POST"])
def execute_payment():
    payload = request.get_json(force=True, silent=True) or {}
    order_id = payload.get("orderId")
    if not order_id:
        return (
            jsonify({"error": "InvalidRequest", "message": "orderId is required"}),
            400,
        )

    amount = float(payload.get("amount", 0))
    state = ORDERS.get(order_id)
    if not state:
        state = OrderState(order_id=order_id, amount=amount)
        ORDERS[order_id] = state

    state.amount = amount
    state.status = "PAID"
    state.history.append({"event": "PAYMENT_EXECUTED", "at": now_iso(), "payload": payload})

    # Transaction id is purely synthetic for mocking purposes
    transaction_id = f"txn_{order_id}_{int(datetime.utcnow().timestamp())}"

    return (
        jsonify(
            {
                "transactionId": transaction_id,
                "orderId": order_id,
                "status": "PAID",
                "amount": amount,
                "paymentMethod": "Credit Card",
            }
        ),
        200,
    )


@app.route("/api/inventory/debit", methods=["POST"])
def debit_inventory():
    payload = request.get_json(force=True, silent=True) or {}
    order_id = payload.get("orderId")
    if not order_id:
        return (
            jsonify({"error": "InvalidRequest", "message": "orderId is required"}),
            400,
        )

    items = payload.get("items", [])
    state = ORDERS.get(order_id)
    if not state:
        state = OrderState(order_id=order_id, items=items)
        ORDERS[order_id] = state

    state.items = items

    # Header / payload controls for simulating failure.
    # 1. If the x-mock-response-code header is present and is NOT 200,
    #    we simulate a failure for this endpoint using that HTTP status.
    # 2. Otherwise, fall back to the existing simulateOutOfStock flag
    #    in the request body.

    # Header names are case-insensitive; Flask's request.headers handles this.
    mock_code_header = request.headers.get("x-mock-response-code")
    mock_status: int | None = None
    if mock_code_header is not None:
        try:
            mock_status = int(mock_code_header)
        except ValueError:
            # If the header is not a valid integer, treat it as no override.
            mock_status = None

    # If a non-200 mock status is specified, simulate failure using that code.
    if mock_status is not None and mock_status != 200:
        state.history.append({"event": "INVENTORY_DEBIT_FAILED", "at": now_iso(), "payload": payload})
        return (
            jsonify(
                {
                    "error": "InventoryConflict",
                    "message": "Simulated failure for inventory debit via x-mock-response-code.",
                    "mockStatus": mock_status,
                }
            ),
            mock_status,
        )

    state.status = "INVENTORY_UPDATED"
    state.history.append({"event": "INVENTORY_DEBITED", "at": now_iso(), "payload": payload})

    return (
        jsonify(
            {
                "orderId": order_id,
                "status": "INVENTORY_UPDATED",
                "itemsDebited": items,
                "message": "Inventory has been successfully updated for the order.",
            }
        ),
        200,
    )


@app.route("/api/shipments", methods=["POST"])
def deliver_order():
    payload = request.get_json(force=True, silent=True) or {}
    order_id = payload.get("orderId")
    if not order_id:
        return (
            jsonify({"error": "InvalidRequest", "message": "orderId is required"}),
            400,
        )

    delivery_address = payload.get("deliveryAddress")
    state = ORDERS.get(order_id)
    if not state:
        state = OrderState(order_id=order_id, delivery_address=delivery_address)
        ORDERS[order_id] = state

    state.delivery_address = delivery_address
    state.status = "SHIPPED"
    state.history.append({"event": "SHIPMENT_CREATED", "at": now_iso(), "payload": payload})

    shipment_id = f"shp_{order_id}_{int(datetime.utcnow().timestamp())}"
    tracking_number = "1Z999AA10123456784"

    return (
        jsonify(
            {
                "shipmentId": shipment_id,
                "trackingNumber": tracking_number,
                "orderId": order_id,
                "status": "SHIPPED",
                "estimatedDelivery": datetime.utcnow().date().isoformat(),
                "message": "Shipment has been created and is pending pickup.",
            }
        ),
        202,
    )


@app.route("/api/payments/refund", methods=["POST"])
def refund_payment():
    payload = request.get_json(force=True, silent=True) or {}
    order_id = payload.get("orderId")
    if not order_id:
        return (
            jsonify({"error": "InvalidRequest", "message": "orderId is required"}),
            400,
        )

    state = ORDERS.get(order_id) or OrderState(order_id=order_id)
    state.status = "REFUNDED"
    state.history.append({"event": "PAYMENT_REFUNDED", "at": now_iso(), "payload": payload})
    ORDERS[order_id] = state

    refund_id = f"ref_{order_id}_{int(datetime.utcnow().timestamp())}"

    return (
        jsonify(
            {
                "refundId": refund_id,
                "orderId": order_id,
                "status": "REFUNDED",
                "message": "Payment has been successfully refunded.",
            }
        ),
        200,
    )


@app.route("/api/inventory/credit", methods=["POST"])
def release_inventory():
    payload = request.get_json(force=True, silent=True) or {}
    order_id = payload.get("orderId")
    if not order_id:
        return (
            jsonify({"error": "InvalidRequest", "message": "orderId is required"}),
            400,
        )

    items = payload.get("items", [])
    state = ORDERS.get(order_id) or OrderState(order_id=order_id)
    state.status = "INVENTORY_RESTORED"
    state.history.append({"event": "INVENTORY_CREDITED", "at": now_iso(), "payload": payload})
    ORDERS[order_id] = state

    return (
        jsonify(
            {
                "orderId": order_id,
                "status": "INVENTORY_RESTORED",
                "message": "Inventory has been credited back successfully.",
            }
        ),
        200,
    )


@app.route("/api/orders/cancel", methods=["POST"])
def cancel_order():
    payload = request.get_json(force=True, silent=True) or {}
    order_id = payload.get("orderId")
    if not order_id:
        return (
            jsonify({"error": "InvalidRequest", "message": "orderId is required"}),
            400,
        )

    state = ORDERS.get(order_id) or OrderState(order_id=order_id)
    state.status = "CANCELLED"
    state.history.append({"event": "ORDER_CANCELLED", "at": now_iso(), "payload": payload})
    ORDERS[order_id] = state

    return (
        jsonify(
            {
                "orderId": order_id,
                "status": "CANCELLED",
                "message": "The order has been successfully cancelled.",
            }
        ),
        200,
    )


@app.route("/internal/orders/<order_id>", methods=["GET"])
def get_order_state(order_id: str):
    """Helper endpoint to inspect in-memory saga state during testing."""

    state = ORDERS.get(order_id)
    if not state:
        return jsonify({"error": "NotFound", "message": "Unknown orderId"}), 404

    return jsonify(
        {
            "orderId": state.order_id,
            "status": state.status,
            "amount": state.amount,
            "items": state.items,
            "deliveryAddress": state.delivery_address,
            "history": state.history,
        }
    )


if __name__ == "__main__":
    # Host/port can be overridden via environment variables if needed.
    app.run(host="0.0.0.0", port=8485, debug=True)
