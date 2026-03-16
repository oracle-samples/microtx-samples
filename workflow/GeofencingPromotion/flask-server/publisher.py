from __future__ import annotations

import json
import logging
import os
from dataclasses import dataclass
from datetime import datetime, timezone
from typing import Protocol


@dataclass(frozen=True)
class OracleTxEvent:
    # NOTE:
    # For the MicroTx workflow trigger, we need an eventId (DB identity from location_event)
    # plus userId. In this demo, eventId is taken from seeded location_event rows.
    eventId: int
    userId: int
    timestamp: str
    sourceSystem: str
    latitude: float | None = None
    longitude: float | None = None
    notificationBaseUri: str = "https://httpbun.com/payload"
    eventType: str = "USER_ENTERED_LOCATION"

    @staticmethod
    def now(*, event_id: int, user_id: int, source_system: str, latitude: float = None, longitude: float = None) -> "OracleTxEvent":
        # Using Zulu time format to match the example (e.g. 2026-03-09T14:02:33Z)
        ts = datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")
        return OracleTxEvent(
            eventId=event_id,
            userId=user_id,
            timestamp=ts,
            sourceSystem=source_system,
            latitude=latitude,
            longitude=longitude,
        )

    def to_json(self) -> str:
        d = {
            "eventId": self.eventId,
            "userId": self.userId,
            "timestamp": self.timestamp,
            "sourceSystem": self.sourceSystem,
            "eventType": self.eventType,
            "notificationBaseUri": self.notificationBaseUri,
        }
        # Only include latitude/longitude if present
        if self.latitude is not None:
            d["latitude"] = self.latitude
        if self.longitude is not None:
            d["longitude"] = self.longitude
        return json.dumps(
            d,
            separators=(",", ":"),
            ensure_ascii=False,
        )


class Publisher(Protocol):
    def publish_oracle_tx(self, msg: OracleTxEvent) -> None: ...


class LogOnlyPublisher:
    def __init__(self) -> None:
        self._enabled = os.getenv("LOG_PUBLISHER_ENABLED", "true").lower() == "true"

    def publish_oracle_tx(self, msg: OracleTxEvent) -> None:
        if self._enabled:
            logging.getLogger(__name__).info("[LogOnlyPublisher] published=%s", msg.to_json())


class TxEventQPublisher:
    """Enqueue messages into a TEQ/TxEventQ topic.

    Implementation: uses python-oracledb + DBMS_AQ.ENQUEUE to enqueue a JMS text message.
    """

    def __init__(
        self,
        *,
        username: str,
        password: str,
        connect_descriptor: str,
        wallet_location: str | None,
        wallet_password: str | None,
        topic_name: str,
        publisher_name: str,
    ) -> None:
        self.username = username
        self.password = password
        self.connect_descriptor = connect_descriptor
        self.wallet_location = wallet_location
        self.wallet_password = wallet_password
        self.topic_name = topic_name
        self.publisher_name = publisher_name

    def _connect(self):
        import oracledb

        logger = logging.getLogger(__name__)

        # Wallet-based TCPS connections require the wallet directory to be used
        # for tnsnames.ora/sqlnet.ora resolution.
        #
        # IMPORTANT:
        # `server/test_oracledb.py` succeeds because it passes `config_dir` and,
        # when needed, also passes `wallet_location` + `wallet_password`.
        #
        # This publisher should behave the same.
        # Prefer the explicit wallet password from config/env if present.
        # Some Autonomous wallets are encrypted; in that case providing
        # wallet_location + wallet_password is required to connect.
        wallet_password = (
            (self.wallet_password or "").strip()
            or (os.getenv("ORACLE_WALLET_PASSWORD") or "").strip()
            or (os.getenv("WALLET_PASSWORD") or "").strip()
            or (os.getenv("ORACLE_WALLET_PWD") or "").strip()
            or None
        )
        if self.wallet_location:
            os.environ["TNS_ADMIN"] = self.wallet_location
            try:
                oracledb.defaults.config_dir = self.wallet_location
            except Exception:  # noqa: BLE001
                pass

        logger.info(
            "Connecting to Oracle (user=%s, dsn=%s, wallet=%s)",
            self.username,
            self.connect_descriptor,
            self.wallet_location or "<none>",
        )

        # Match the working connection approach used in server/test_oracledb.py:
        # pass config_dir so the wallet's tnsnames.ora/sqlnet.ora are reliably found.
        connect_kwargs = {
            "user": self.username,
            "password": self.password,
            "dsn": self.connect_descriptor,
        }
        if self.wallet_location:
            connect_kwargs["config_dir"] = self.wallet_location
            # If the wallet is encrypted, python-oracledb requires these.
            # NOTE: If config.toml contains a wallet_password, load_config()
            # already maps it to ORACLE_WALLET_PASSWORD env override, but we
            # also support reading it directly via environment variables.
            if wallet_password:
                connect_kwargs["wallet_location"] = self.wallet_location
                connect_kwargs["wallet_password"] = wallet_password

        con = oracledb.connect(**connect_kwargs)

        logger.info("Connected to Oracle")
        return con

    def publish_oracle_tx(self, msg: OracleTxEvent) -> None:
        logger = logging.getLogger(__name__)
        payload_text = msg.to_json()

        plsql = """
DECLARE
  enqueue_options    DBMS_AQ.ENQUEUE_OPTIONS_T;
  message_properties DBMS_AQ.MESSAGE_PROPERTIES_T;
  msgid              RAW(16);

  l_msg SYS.AQ$_JMS_TEXT_MESSAGE;
BEGIN
  -- Create a JMS text message payload
  l_msg := SYS.AQ$_JMS_TEXT_MESSAGE.construct;
  l_msg.set_text(:p_text);

  -- Identify publisher agent (optional but matches Java sample behavior)
  message_properties.sender_id := SYS.AQ$_AGENT(:p_publisher_name, NULL, 0);

  DBMS_AQ.ENQUEUE(
    queue_name         => :p_queue_name,
    enqueue_options    => enqueue_options,
    message_properties => message_properties,
    payload            => l_msg,
    msgid              => msgid
  );
END;"""

        queue_name = f"{self.username.upper()}.{self.topic_name.upper()}"

        logger.info(
            "Enqueueing to %s (publisher_agent=%s) payload=%s",
            queue_name,
            self.publisher_name,
            payload_text,
        )

        with self._connect() as con:
            with con.cursor() as cur:
                cur.execute(
                    plsql,
                    p_text=payload_text,
                    p_queue_name=queue_name,
                    p_publisher_name=self.publisher_name,
                )
            con.commit()

        logger.info("Published notification")


def build_publisher_from_config(cfg) -> Publisher:
    # Lazy import to avoid requiring config for module import
    publisher_kind = os.getenv("PUBLISHER_KIND", "txeventq").lower()
    if publisher_kind in {"log", "stdout"}:
        return LogOnlyPublisher()

    return TxEventQPublisher(
        username=cfg.oracle.username,
        password=cfg.oracle.password,
        connect_descriptor=cfg.oracle.connect_descriptor,
        wallet_location=cfg.oracle.wallet_location,
        wallet_password=cfg.oracle.wallet_password,
        topic_name=cfg.txeventq.topic_name,
        publisher_name=cfg.txeventq.publisher_name,
    )
