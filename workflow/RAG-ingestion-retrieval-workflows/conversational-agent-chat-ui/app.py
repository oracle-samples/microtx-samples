import json
import os
import time
from typing import Any, Dict, Iterator, List, Optional

import requests
import streamlit as st

st.set_page_config(page_title="MicroTx Agent Chat", layout="wide")


# ----------------------------
# Config
# ----------------------------
DEFAULT_BASE_URL = os.getenv("WORKFLOW_SERVER_URL", "http://localhost:9010/workflow-server")
HARDCODED_AGENTS = [
    "medical_history_agent"
]
API_PREFIX = "/api/conversational-agent"

st.title("MicroTx Workflow Server - Conversational Agent UI")


# ----------------------------
# Helpers
# ----------------------------

def build_url(base_url: str, path: str) -> str:
    return f"{base_url.rstrip('/')}{path}"


def sse_events(resp: requests.Response) -> Iterator[str]:
    """
    Minimal SSE parser: yields the 'data:' payload lines.
    Works for typical 'text/event-stream' responses.
    """
    for raw_line in resp.iter_lines(decode_unicode=True):
        if not raw_line:
            continue
        line = raw_line.strip()
        if line.startswith("data:"):
            yield line[len("data:") :].strip()


def try_parse_json(text: str) -> Any:
    try:
        return json.loads(text)
    except Exception:
        return text


def http_get_json(url: str) -> Any:
    r = requests.get(url, timeout=60)
    r.raise_for_status()
    return try_parse_json(r.text)


def http_delete(url: str) -> Any:
    r = requests.delete(url, timeout=60)
    r.raise_for_status()
    return try_parse_json(r.text) if r.text else {"status": "deleted"}


def normalize_agent_list(raw: Any) -> List[str]:
    if isinstance(raw, list):
        return [str(a).strip() for a in raw if str(a).strip()]
    if isinstance(raw, str):
        return [a.strip() for a in raw.split(",") if a.strip()]
    return []


def summarize_text(text: str, max_len: int = 32) -> str:
    if not text:
        return ""
    text = " ".join(text.split())
    return text if len(text) <= max_len else f"{text[: max_len - 3]}..."


def format_message_text(text: str) -> str:
    if text is None:
        return ""
    if not isinstance(text, str):
        text = str(text)
    text = text.replace("\\r\\n", "\\n").replace("\\r", "\\n")
    return text.replace("\\n", "<br>")


def normalize_sessions(data: Any) -> List[Dict[str, str]]:
    sessions: List[Dict[str, str]] = []

    if isinstance(data, dict):
        if isinstance(data.get("sessions"), list):
            data = data["sessions"]
        elif isinstance(data.get("chatSessions"), list):
            data = data["chatSessions"]
        else:
            # Map of session_id -> session data
            for k, v in data.items():
                if isinstance(v, (dict, list)):
                    summary = ""
                    if isinstance(v, dict):
                        summary = (
                            v.get("summary")
                            or v.get("description")
                            or v.get("title")
                            or v.get("lastMessage")
                            or ""
                        )
                    sessions.append(
                        {
                            "id": str(k),
                            "summary": summarize_text(str(summary)),
                        }
                    )
            return sessions

    if isinstance(data, list):
        for item in data:
            if isinstance(item, str):
                sessions.append({"id": item, "summary": ""})
            elif isinstance(item, dict):
                session_id = (
                    item.get("chatSessionId")
                    or item.get("sessionId")
                    or item.get("id")
                    or item.get("chat_session_id")
                    or ""
                )
                summary = (
                    item.get("summary")
                    or item.get("description")
                    or item.get("title")
                    or item.get("lastMessage")
                    or ""
                )
                if not summary and isinstance(item.get("messages"), list):
                    last_msg = item["messages"][-1] if item["messages"] else {}
                    summary = (
                        last_msg.get("content")
                        or last_msg.get("message")
                        or last_msg.get("text")
                        or ""
                    )
                sessions.append(
                    {
                        "id": str(session_id) if session_id else str(item),
                        "summary": summarize_text(str(summary)),
                    }
                )
            else:
                sessions.append({"id": str(item), "summary": ""})

    return sessions


def normalize_messages(data: Any) -> List[Dict[str, str]]:
    if isinstance(data, dict):
        if isinstance(data.get("messages"), list):
            data = data["messages"]
        elif isinstance(data.get("chatHistory"), list):
            data = data["chatHistory"]
        elif "userInput" in data or "assistantResponse" in data:
            msgs = []
            if data.get("userInput"):
                msgs.append({"role": "user", "content": str(data["userInput"])})
            if data.get("assistantResponse"):
                msgs.append(
                    {"role": "assistant", "content": str(data["assistantResponse"])}
                )
            return msgs
        else:
            return [{"role": "assistant", "content": json.dumps(data)}]

    messages: List[Dict[str, str]] = []
    if isinstance(data, list):
        for item in data:
            if isinstance(item, dict):
                if "user" in item and "agent" not in item:
                    role = "user"
                    content = item.get("user", "")
                elif "agent" in item and "user" not in item:
                    role = "assistant"
                    content = item.get("agent", "")
                else:
                    role = (
                        item.get("role")
                        or item.get("sender")
                        or item.get("type")
                        or "assistant"
                    )
                    content = (
                        item.get("content")
                        or item.get("message")
                        or item.get("text")
                        or item.get("value")
                        or ""
                    )
                if isinstance(content, str):
                    content = content.strip()
                    if content.startswith('"') and content.endswith('"'):
                        content = content[1:-1]
                if content:
                    messages.append({"role": str(role), "content": str(content)})
            else:
                messages.append({"role": "assistant", "content": str(item)})
    return messages


def fetch_agent_sessions(base_url: str, agent_name: str) -> List[Dict[str, str]]:
    history_url = build_url(base_url, f"{API_PREFIX}/history/{agent_name}")
    data = http_get_json(history_url)
    return normalize_sessions(data)


def fetch_session_messages(
    base_url: str, agent_name: str, chat_session_id: str
) -> List[Dict[str, str]]:
    session_url = build_url(
        base_url, f"{API_PREFIX}/history/{agent_name}/{chat_session_id}"
    )
    data = http_get_json(session_url)
    return normalize_messages(data)


def get_session_key(agent_name: str, chat_session_id: str) -> str:
    return f"{agent_name}::{chat_session_id}"


def generate_new_session_id() -> str:
    return time.strftime("session-%Y%m%d-%H%M%S")


# ----------------------------
# UI State
# ----------------------------
if "ui_messages" not in st.session_state:
    st.session_state.ui_messages = []

if "current_agent" not in st.session_state:
    st.session_state.current_agent = ""

if "current_session_id" not in st.session_state:
    st.session_state.current_session_id = ""

if "session_cache" not in st.session_state:
    st.session_state.session_cache = {}

if "agent_sessions" not in st.session_state:
    st.session_state.agent_sessions = []

if "available_agents" not in st.session_state:
    st.session_state.available_agents = HARDCODED_AGENTS[:]

if "session_id_input" not in st.session_state:
    st.session_state.session_id_input = ""


# ----------------------------
# Sidebar
# ----------------------------
with st.sidebar:
    st.header("Agent Navigation")
    base_url = DEFAULT_BASE_URL

    st.divider()
    st.subheader("Available Agents")
    agent_names = st.session_state.available_agents

    selected_agent = ""
    if agent_names:
        selected_agent = st.selectbox(
            "Agent",
            options=agent_names,
            index=0,
            key="selected_agent",
        )

        if selected_agent and selected_agent != st.session_state.current_agent:
            st.session_state.current_agent = selected_agent
            new_id = generate_new_session_id()
            st.session_state.current_session_id = new_id
            st.session_state.session_id_input = new_id
            st.session_state.ui_messages = []
            try:
                st.session_state.agent_sessions = fetch_agent_sessions(
                    base_url, selected_agent
                )
            except Exception as e:
                st.error(str(e))
                st.session_state.agent_sessions = []

    st.divider()
    st.subheader("Sessions")

    col_refresh, col_new = st.columns([1, 3])
    with col_refresh:
        if st.button(
            "Refresh",
            type="secondary",
            icon=":material/refresh:",
            help="Refresh",
        ):
            if selected_agent:
                try:
                    st.session_state.agent_sessions = fetch_agent_sessions(
                        base_url, selected_agent
                    )
                except Exception as e:
                    st.error(str(e))
                    st.session_state.agent_sessions = []
    with col_new:
        if st.button("New chat", type="primary", icon=":material/add_comment:"):
            new_id = generate_new_session_id()
            st.session_state.current_session_id = new_id
            st.session_state.session_id_input = new_id
            st.session_state.ui_messages = []

    sessions = st.session_state.agent_sessions
    if sessions:
        for sess in sessions:
            sid = sess.get("id", "")
            summary = sess.get("summary", "")
            short_summary = summarize_text(summary, max_len=28) if summary else ""
            label = short_summary if short_summary else "(no description)"

            col1, col2 = st.columns([2, 1], gap="small")
            with col1:
                if st.button(
                    label,
                    key=f"load_{sid}",
                    help=summary if summary else None,
                ):
                    try:
                        messages = fetch_session_messages(base_url, selected_agent, sid)
                        st.session_state.ui_messages = messages
                        st.session_state.current_session_id = sid
                        st.session_state.session_id_input = sid
                        st.session_state.session_cache[
                            get_session_key(selected_agent, sid)
                        ] = messages
                    except Exception as e:
                        st.error(str(e))
            with col2:
                if st.button("Delete", key=f"del_{sid}"):
                    try:
                        delete_url = build_url(
                            base_url, f"{API_PREFIX}/history/{selected_agent}/{sid}"
                        )
                        http_delete(delete_url)
                        st.success(f"Deleted {sid}.")
                        if sid == st.session_state.current_session_id:
                            st.session_state.current_session_id = ""
                            st.session_state.ui_messages = []
                        st.session_state.agent_sessions = fetch_agent_sessions(
                            base_url, selected_agent
                        )
                    except Exception as e:
                        st.error(str(e))
    else:
        st.caption("No sessions found for this agent.")

    st.divider()
    st.subheader("Delete Agent History")
    delete_confirm = st.checkbox("Delete all sessions for this agent")
    if st.button("Delete agent history", disabled=not delete_confirm):
        if selected_agent:
            try:
                delete_url = build_url(
                    base_url, f"{API_PREFIX}/history/{selected_agent}"
                )
                http_delete(delete_url)
                st.success("Deleted all agent history.")
                st.session_state.agent_sessions = []
                st.session_state.current_session_id = ""
                st.session_state.ui_messages = []
            except Exception as e:
                st.error(str(e))


# ----------------------------
# Main Chat Area
# ----------------------------
agent_name = st.session_state.current_agent
chat_session_id = st.session_state.current_session_id

st.subheader("Chat")

if not agent_name:
    st.info("Select an agent to begin.")
else:
    if not chat_session_id:
        chat_session_id = generate_new_session_id()
        st.session_state.current_session_id = chat_session_id
        st.session_state.session_id_input = chat_session_id
    st.markdown(f"**Agent:** {agent_name} &nbsp;&nbsp; **Session:** {chat_session_id}")

# Render existing local UI chat
for m in st.session_state.ui_messages:
    with st.chat_message(m.get("role", "assistant")):
        st.markdown(format_message_text(m.get("content", "")), unsafe_allow_html=True)

user_input = st.chat_input("Type your message...")
if user_input and agent_name:
    if not chat_session_id:
        chat_session_id = generate_new_session_id()
        st.session_state.current_session_id = chat_session_id

    st.session_state.ui_messages.append({"role": "user", "content": user_input})
    with st.chat_message("user"):
        st.markdown(user_input)

    chat_url = build_url(base_url, f"{API_PREFIX}/chat")
    payload: Dict[str, Any] = {
        "agentName": agent_name,
        "chatSessionId": chat_session_id,
        "userInput": user_input,
    }
    headers = {
        "Content-Type": "application/json",
        "Accept": "text/event-stream",
    }

    with st.chat_message("assistant"):
        placeholder = st.empty()
        accumulated = ""

        try:
            with requests.post(
                chat_url,
                headers=headers,
                data=json.dumps(payload),
                stream=True,
                timeout=300,
            ) as resp:
                resp.raise_for_status()

                for data in sse_events(resp):
                    parsed = try_parse_json(data)
                    if isinstance(parsed, dict):
                        chunk = (
                            parsed.get("content")
                            or parsed.get("message")
                            or parsed.get("delta")
                            or parsed.get("text")
                        )
                        if chunk is None:
                            chunk = json.dumps(parsed, ensure_ascii=False)
                    else:
                        chunk = str(parsed)

                    if accumulated:
                        accumulated += "\n"
                    accumulated += chunk
                    placeholder.markdown(
                        format_message_text(accumulated), unsafe_allow_html=True
                    )

        except requests.HTTPError as e:
            st.error(f"HTTP error: {e}")
        except requests.RequestException as e:
            st.error(f"Request error: {e}")

    st.session_state.ui_messages.append({"role": "assistant", "content": accumulated})
    st.session_state.session_cache[
        get_session_key(agent_name, chat_session_id)
    ] = st.session_state.ui_messages
    if agent_name and chat_session_id:
        try:
            st.session_state.agent_sessions = fetch_agent_sessions(base_url, agent_name)
        except Exception:
            existing = st.session_state.agent_sessions
            if not any(s.get("id") == chat_session_id for s in existing):
                st.session_state.agent_sessions = [
                    {"id": chat_session_id, "summary": summarize_text(user_input)}
                ] + existing

# Debug panel removed from main UI. Add back if needed.
