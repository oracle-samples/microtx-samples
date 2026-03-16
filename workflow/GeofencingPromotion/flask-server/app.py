from flask import Flask, render_template, request, jsonify
from publisher import build_publisher_from_config, OracleTxEvent
from txeventq_config import load_config
import threading
import time
import logging

app = Flask(__name__)

# Configure logging to show INFO logs and above
logging.basicConfig(level=logging.INFO, format='[%(asctime)s] %(levelname)s in %(module)s: %(message)s')
logger = logging.getLogger(__name__)

# Load config and set up publisher
cfg = load_config("config.toml")
publisher = build_publisher_from_config(cfg)

# Shared notification store (can be replaced with a DB-backed cache)
import threading

notifications = {}

# Track last displayed notification and its timestamp for each user
notification_display_state = {}

# Track which user to poll for, and ensure thread safety.
current_polled_user_id = {"user_id": 1}
poll_user_lock = threading.Lock()
latest_event_message = {"message": "", "last_time": 0}


def _oracle_connect_kwargs(cfg):
    """Build connect options for oracledb.connect, compatible with wallet and config."""
    oracle_cfg = cfg.oracle
    connect_kwargs = {
        "user": oracle_cfg.username,
        "password": oracle_cfg.password,
        "dsn": oracle_cfg.connect_descriptor,
        "config_dir": oracle_cfg.wallet_location,
    }
    wallet_password = (oracle_cfg.wallet_password or "").strip() or None
    if wallet_password:
        connect_kwargs["wallet_location"] = oracle_cfg.wallet_location
        connect_kwargs["wallet_password"] = wallet_password
    return connect_kwargs


def _do_db_poll(*, cfg, user_id: int, lookback_seconds: int):
    """Fetch latest notification payload from DB (copied from Streamlit/server/app.py)."""
    import oracledb
    import json
    start = time.time()
    connect_kwargs = _oracle_connect_kwargs(cfg)
    payload = None
    try:
        with oracledb.connect(**connect_kwargs) as con:
            with con.cursor() as cur:
                cur.execute(
                    "SELECT fn_get_latest_notification_json(:userId, :lookbackSec) AS payload FROM dual",
                    userId=int(user_id),
                    lookbackSec=int(lookback_seconds),
                )
                row = cur.fetchone()
                payload = (row[0] if row else None)
    except Exception as e:
        logger.error(f"DB polling: Oracle error during fetch for user_id={user_id}: {e}")
        return {"elapsed_ms": int((time.time() - start) * 1000), "payload": None, "payload_snippet": None, "json": None, "error": str(e)}

    elapsed_ms = int((time.time() - start) * 1000)
    snippet = (str(payload)[:300] if payload is not None else None)

    parsed_json = None
    if payload:
        try:
            parsed_json = json.loads(payload)
        except Exception as e:
            logger.error(f"DB polling: Failed to parse JSON for user_id={user_id}: {e}")
            parsed_json = None

    return {
        "elapsed_ms": elapsed_ms,
        "payload": payload,
        "payload_snippet": snippet,
        "json": parsed_json,
    }


def db_poll_thread(interval=60):
    """Background poller to update notifications for only the selected user."""
    lookback_seconds = getattr(cfg.notifications, "lookback_seconds", 180)
    last_polled_user_id = None
    while True:
        with poll_user_lock:
            user_id = current_polled_user_id["user_id"]
        logger.info(f"Polling for selected user_id={user_id} (interval={interval}s, lookback={lookback_seconds}s)")
        try:
            result = _do_db_poll(cfg=cfg, user_id=user_id, lookback_seconds=lookback_seconds)
            now = time.time()
            if result.get("error"):
                logger.error(f"Polling failed for user_id={user_id}: {result['error']}")
            elif result.get("json"):
                notifications[user_id] = result["json"]
                msg = str(result["json"])
                display_state = notification_display_state.get(user_id, {})
                prev_msg = display_state.get("message")
                # If new message or never set, update and reset timer
                if prev_msg != msg:
                    notification_display_state[user_id] = {"message": msg, "set_time": now}
                    logger.info(f"Display notification updated for user_id={user_id}: {msg}")
                # If same as before, keep showing and do not reset timer
                logger.info(f"Notification polled for user_id={user_id}: {result['json']}")
            else:
                logger.info(f"No notification found for user_id={user_id}.")
            logger.info("Polling cycle completed successfully")
            # Clean up notification data for users no longer polled
            if last_polled_user_id is not None and last_polled_user_id != user_id:
                notifications.pop(last_polled_user_id, None)
                notification_display_state.pop(last_polled_user_id, None)
            last_polled_user_id = user_id
        except Exception as e:
            logger.error(f"Polling cycle error: {e}")
        time.sleep(interval)


def get_notification_for_user(user_id: int):
    return notifications.get(user_id, None)


@app.route("/")
def index():
    user_id = request.args.get("user_id", 1)
    user_id = int(user_id)
    # Update the current polled user for background polling thread
    with poll_user_lock:
        current_polled_user_id["user_id"] = user_id
    display_info = notification_display_state.get(user_id, {})
    now = time.time()
    notif = None
    # Only show if message exists and time is within 120s
    if (
        display_info
        and display_info.get("message")
        and (now - display_info.get("set_time", 0) < 120)
    ):
        # Try to parse as original notification dict (if saved as str(dict))
        try:
            notif = eval(display_info["message"])
        except Exception:
            notif = display_info["message"]
    latest_event = latest_event_message["message"] if time.time() - latest_event_message["last_time"] < 120 else ""
    return render_template(
        "index.html",
        user_id=user_id,
        notification=notif,
        event_message=latest_event,
    )


@app.route("/publish_event", methods=["POST"])
def publish_event():
    data = request.json
    user_id = int(data.get("user_id"))
    event_id = int(data.get("event_id"))

    # Seeded events: event_id -> (lat, lon)
    seeded_event_latlon = {
        1: (37.775000, -122.419000),  # Downtown Mall (Alice)
        2: (37.775030, -122.418970),  # Downtown Mall (Bob)
        3: (37.777500, -122.415000),  # VIP Lounge (Carol)
        4: (37.777600, -122.415100),  # VIP Lounge (Dave)
        # You can add more as necessary
    }
    no_offer_latlon = (37.780000, -122.430000)

    if event_id == -1:
        lat, lon = no_offer_latlon
        # For "No offers" location: eventId = userId
        synthetic_event_id = user_id
        logger.info(f"Publishing No Offers/Out-of-Geofence event for user_id={user_id} with event_id={synthetic_event_id}, lat={lat}, lon={lon}")
        event = OracleTxEvent.now(
            event_id=synthetic_event_id,
            user_id=user_id,
            source_system="mobile-app",
            latitude=lat,
            longitude=lon
        )
    else:
        lat, lon = seeded_event_latlon.get(event_id, (None, None))
        logger.info(f"Publishing event for user_id={user_id}, event_id={event_id}, lat={lat}, lon={lon}")
        event = OracleTxEvent.now(
            event_id=event_id,
            user_id=user_id,
            source_system="mobile-app",
            latitude=lat,
            longitude=lon
        )
    try:
        logger.info(f"Preparing to publish event: user_id={user_id}, event_id={event_id}, latitude={lat}, longitude={lon}")
        publisher.publish_oracle_tx(event)
        # Clear notification for the user when new event is published
        notification_display_state.pop(user_id, None)
        latest_event_message["message"] = "Sent user location"
        latest_event_message["last_time"] = time.time()
        logger.info(f"Geofence event published: user_id={user_id} event_id={event_id}")
        return jsonify({"status": "success"})
    except Exception as e:
        logger.error(f"Failed to publish geofence event: user_id={user_id} event_id={event_id} error={e}")
        return jsonify({"status": "error", "reason": str(e)}), 500


@app.route("/fetch_notification", methods=["GET"])
def fetch_notification():
    user_id = int(request.args.get("user_id", 1))
    # Also update the current polled user for background polling thread if changed.
    with poll_user_lock:
        prev_user = current_polled_user_id["user_id"]
        if prev_user != user_id:
            logger.info(f"(fetch_notification) Forcing poller user_id change from {prev_user} -> {user_id}")
            current_polled_user_id["user_id"] = user_id
    notif = get_notification_for_user(user_id)
    if notif:
        logger.info(f"(fetch_notification) Returned notification for user_id={user_id}")
        return jsonify(notif)
    else:
        logger.info(f"(fetch_notification) No notification found for user_id={user_id}")
        return jsonify({"message": "No notification found."})


if __name__ == "__main__":
    # Start polling thread using interval from config
    t = threading.Thread(target=db_poll_thread, args=(cfg.notifications.poll_interval_seconds,), daemon=True)
    t.start()
    app.run(debug=True, port=8800)
