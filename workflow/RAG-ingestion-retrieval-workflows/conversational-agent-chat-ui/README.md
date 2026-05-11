# MicroTx Conversational Agent Chat UI

This Streamlit app is an optional chat client for the medical-history RAG sample. It calls the MicroTx conversational-agent API and is preconfigured to use the `medical_history_agent` profile.

Before running this app:
1. Run the medical QA ingestion workflow so the vector table is populated.
2. Create the `medical_history_retrieval` RAG retrieval tool config.
3. Create the `medical_history_agent` agent profile and attach the retrieval tool.

See the parent README for the tool config and agent profile payloads.

## Run

```bash
cd RAG-ingestion-retrieval-workflows/conversational-agent-chat-ui
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
export WORKFLOW_SERVER_URL="http://localhost:9010/workflow-server"
streamlit run app.py
```

Set `WORKFLOW_SERVER_URL` to your Workflow Server base URL. The app sends chat requests to:

```text
${WORKFLOW_SERVER_URL}/api/conversational-agent/chat
```

The app also uses the conversational-agent history APIs to list, load, and delete chat sessions for the selected agent.

## Direct API shape

Customers can create their own chat UI by calling the same API:

```json
{
  "agentName": "medical_history_agent",
  "chatSessionId": "session-001",
  "userInput": "What cardiovascular risk factors are present for patient Donnell534 Dicki44?"
}
```

Use a stable `chatSessionId` for follow-up questions in the same conversation.
