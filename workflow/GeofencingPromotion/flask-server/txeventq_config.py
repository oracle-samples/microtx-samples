from __future__ import annotations

from dataclasses import dataclass
from pathlib import Path
from typing import Any, Optional

import os


try:
    import tomllib  # py311+
except ModuleNotFoundError:  # pragma: no cover
    import tomli as tomllib


@dataclass(frozen=True)
class OracleConfig:
    username: str
    password: str
    connect_descriptor: str
    wallet_location: Optional[str]
    wallet_password: Optional[str]


@dataclass(frozen=True)
class TxEventQConfig:
    topic_name: str
    publisher_name: str
    subscriber_name: str


@dataclass(frozen=True)
class WorkflowServerConfig:
    base_url: str


@dataclass(frozen=True)
class NotificationsConfig:
    poll_interval_seconds: int = 60
    lookback_seconds: int = 180


@dataclass(frozen=True)
class AppConfig:
    oracle: OracleConfig
    txeventq: TxEventQConfig
    workflow_server: WorkflowServerConfig
    notifications: NotificationsConfig
    default_user_id: int = 1


def _get(d: dict[str, Any], path: str, default: Any = None) -> Any:
    cur: Any = d
    for part in path.split("."):
        if not isinstance(cur, dict) or part not in cur:
            return default
        cur = cur[part]
    return cur


def load_config(config_path: str | Path = Path(__file__).with_name("config.toml")) -> AppConfig:
    """Load app config from server/config.toml with env var overrides.

    Env overrides:
      ORACLE_USERNAME, ORACLE_PASSWORD, ORACLE_CONNECT_DESCRIPTOR, ORACLE_WALLET_LOCATION, ORACLE_WALLET_PASSWORD
      TXEVENTQ_TOPIC_NAME, TXEVENTQ_PUBLISHER_NAME, TXEVENTQ_SUBSCRIBER_NAME
      WORKFLOW_SERVER_BASE_URL
      NOTIFICATIONS_POLL_INTERVAL_SECONDS, NOTIFICATIONS_LOOKBACK_SECONDS
      APP_DEFAULT_USER_ID
    """

    config_path = Path(config_path)
    data: dict[str, Any] = {}
    if config_path.exists():
        data = tomllib.loads(config_path.read_text(encoding="utf-8"))

    # Helper: treat empty string as None to avoid passing "" as a secret
    def empty_to_none(s):
        return s if (s is not None and str(s).strip()) else None

    oracle = OracleConfig(
        username=empty_to_none(os.getenv("ORACLE_USERNAME") or _get(data, "oracle.username")),
        password=empty_to_none(os.getenv("ORACLE_PASSWORD") or _get(data, "oracle.password")),
        connect_descriptor=empty_to_none(os.getenv("ORACLE_CONNECT_DESCRIPTOR") or _get(data, "oracle.connect_descriptor")),
        wallet_location=empty_to_none(os.getenv("ORACLE_WALLET_LOCATION") or _get(data, "oracle.wallet_location")),
        wallet_password=empty_to_none(
            os.getenv("ORACLE_WALLET_PASSWORD")
            or _get(data, "oracle.wallet_password")
            or os.getenv("WALLET_PASSWORD")
        ),
    )

    tx = TxEventQConfig(
        topic_name=os.getenv("TXEVENTQ_TOPIC_NAME") or _get(data, "oracle.topic_name") or _get(data, "txeventq.topic_name"),
        publisher_name=os.getenv("TXEVENTQ_PUBLISHER_NAME")
        or _get(data, "oracle.publisher_name")
        or _get(data, "txeventq.publisher_name")
        or "my_subscription",
        subscriber_name=os.getenv("TXEVENTQ_SUBSCRIBER_NAME")
        or _get(data, "oracle.subscriber_name")
        or _get(data, "txeventq.subscriber_name")
        or "my_subscriber",
    )

    default_user_id_raw = os.getenv("APP_DEFAULT_USER_ID") or _get(data, "app.default_user_id") or 1
    default_user_id = int(default_user_id_raw)

    workflow_server = WorkflowServerConfig(
        base_url=(os.getenv("WORKFLOW_SERVER_BASE_URL") or _get(data, "workflow_server.base_url") or "http://localhost:9010").rstrip(
            "/"
        )
    )

    notifications = NotificationsConfig(
        poll_interval_seconds=int(
            os.getenv("NOTIFICATIONS_POLL_INTERVAL_SECONDS")
            or _get(data, "notifications.poll_interval_seconds")
            or 60
        ),
        lookback_seconds=int(
            os.getenv("NOTIFICATIONS_LOOKBACK_SECONDS")
            or _get(data, "notifications.lookback_seconds")
            or 180
        ),
    )

    # Allow UI-only runs (PUBLISHER_KIND=log) without DB configuration.
    publisher_kind = os.getenv("PUBLISHER_KIND", "txeventq").lower()
    if publisher_kind not in {"log", "stdout"}:
        missing = []
        if not oracle.username:
            missing.append("oracle.username")
        if not oracle.password:
            missing.append("oracle.password")
        if not oracle.connect_descriptor:
            missing.append("oracle.connect_descriptor")
        if not tx.topic_name:
            missing.append("txeventq.topic_name")
        if missing:
            raise ValueError(
                "Missing required config values: " + ", ".join(missing) + ". "
                "Create server/config.toml (see server/README_PYTHON.md)."
            )

    return AppConfig(
        oracle=oracle,
        txeventq=tx,
        workflow_server=workflow_server,
        notifications=notifications,
        default_user_id=default_user_id,
    )
