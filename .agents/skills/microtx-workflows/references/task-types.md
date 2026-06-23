# Task Types Catalog

Condensed reference for the task types you can put in a `WorkflowDef.tasks[]` array, based on the Oracle MicroTx Workflows User's Guide (Release 26.1). Each entry below shows the `type` value and a representative `inputParameters` shape. Use these as starting templates when authoring or reviewing workflow JSON.

## AGENTIC_TASK — invoke an Agent Profile

Runs a previously-defined Agent Profile (role, instructions, LLM, tools, MCP servers, memory, guardrails all come from the profile). The task supplies only runtime context: extra prompt text, prompt variable values, and input data. Agentic Tasks use task-level idempotency by default (10-minute lock).

```json
{
  "name": "loan_document_verification",
  "taskReferenceName": "document_verification",
  "type": "AGENTIC_TASK",
  "inputParameters": {
    "agentProfile": "loan_document_verification_agent",
    "prompt": "Review the applicant documents and return a verification decision with reasons.",
    "promptVariables": {
      "applicantId": "${workflow.input.applicantId}",
      "loanType": "${workflow.input.loanType}"
    },
    "data": {
      "source": "local",
      "filePath": "${workflow.input.documentPath}"
    }
  }
}
```

Other fields: `idempotencyTimeout` (ms, default 600000), `guardrails` (merged with agent-profile guardrails; task-level values override on conflict). `data.source` can be `WEB`, `OCI`, `LOCAL`, or `TEXT`.

Use for: document verification, AI-assisted analysis/recommendations, knowledge search via tools/MCP, prep for human-in-the-loop approval.

## Agentic Planner — dynamic orchestration

A planner task evaluates runtime context (prompt template, available tasks/tools, prior results) and decides the next action dynamically — useful for adaptive, non-deterministic flows.

```json
{
  "name": "Agentic Planner",
  "taskReferenceName": "agentic_planner",
  "inputParameters": {
    "llmProfile": { "name": "openai-dev-llm-profile", "model": "gpt-4o" },
    "promptTemplate": "loan_process_planner",
    "promptVariables": { "document": "${workflow.input.document}" },
    "data": {
      "loanApplicationText": "${workflow.input.loan_application_text}",
      "document": "${workflow.input.document}"
    },
    "mcpServers": ["doc_mcp"],
    "tasks": [
      {
        "name": "Loan Document Verification Task",
        "taskReferenceName": "document_verification",
        "type": "AGENTIC_TASK",
        "inputParameters": {
          "agentProfile": "loan_document_verification_agent",
          "promptVariables": { "document": "${workflow.input.document}" }
        }
      },
      {
        "name": "Compliance Agent",
        "taskReferenceName": "compliance_agent",
        "type": "HTTP",
        "inputParameters": {
          "http_request": {
            "method": "POST",
            "uri": "http://localhost:8001/api/compliance/check",
            "headers": { "Content-Type": "application/json" },
            "body": { "socialSecurityNumber": "${extract_loan_details.output.ssn}" }
          }
        }
      }
    ]
  }
}
```

The `promptTemplate` references a Prompt Profile that contains the planner's decision logic (conditions, branching rules, final status reporting). The `tasks` array lists the candidate tasks the planner can choose to invoke.

## GENAI_TASK — single LLM call

For summarization, classification, extraction, or other single-prompt operations.

```json
{
  "name": "Summarize_Text",
  "taskReferenceName": "genai_summarize_text",
  "inputParameters": {
    "llmProfile": { "name": "openai-dev", "model": "gpt-4o-mini" },
    "prompt": "Summarize the following content clearly and concisely...",
    "data": { "source": "local", "filePath": "${workflow.input.filePath}" },
    "maxTokens": 4000,
    "temperature": 0.7,
    "top_p": 0.9,
    "top_k": 50
  },
  "type": "GENAI_TASK"
}
```

**Output shape — the result is parsed, not a raw string (verified gotcha):** when the prompt asks for a JSON object, MicroTx parses it and the task's `outputData` **is that object directly**, with the fields at the top level — e.g. `${genai_extract.output.name}`, `${genai_extract.output.amount}`. There is **no** `.result`/`.response`/`.text`/`.content` wrapper around it. So a downstream `INLINE`/`SWITCH` that reads `output.result` (or similar) will see `undefined` and behave as if extraction returned nothing. Reference the fields directly (`${genai_extract.output.<field>}`), or pass the whole `${genai_extract.output}` object into an `INLINE` task and read the fields off it.

When consuming a GENAI object inside an `INLINE` evaluator, make the parser defensive — accept the object as-is when the expected fields are already present on it, and only fall back to JSON-parsing a string (stripping ``` fences) if you were handed text. For fields used later in **exact equality** checks (e.g. `scope == "home purchase"`), instruct the model in the prompt to emit a controlled value (map "buying a house/home/property" → exactly `"home purchase"`); free-form extraction like `"house purchase"` will silently miss the rule. Set `temperature: 0` for deterministic extraction.

## GENAI_INGESTION — chunk, embed, and store documents

Splits documents into chunks, generates embeddings, and stores them in a vector-capable database table (for RAG).

```json
{
  "name": "sample_genai_ingest",
  "taskReferenceName": "genai_ingestion_ref",
  "inputParameters": {
    "embeddingModelProfile": { "name": "oci-cohere-embedding", "model": "cohere.embed-multilingual-image-v3.0" },
    "dataStoreProfile": "oracle-atp-123",
    "tableName": "test_vectors",
    "data": { "source": "local", "filePath": "document.pdf" },
    "dimensions": "512",
    "chunkSize": "512",
    "minChunkSizeChars": "80",
    "minChunkLengthToEmbed": "5",
    "maxNumChunks": "10000",
    "keepSeparator": true,
    "indexType": "HNSW",
    "distanceType": "cosine"
  },
  "type": "GENAI_INGESTION"
}
```

`dataStoreProfile` references a Database Profile (with `VECTOR` and/or `EMBEDDING_GENERATION` capability).

## GENAI_RETRIEVE — RAG query

Embeds a query, retrieves top-K nearest chunks from a vector table, and (with `llmProfile`) can generate a response grounded in the retrieved context.

```json
{
  "name": "genai_retrieve",
  "taskReferenceName": "genai_retrieve_ref",
  "inputParameters": {
    "llmProfile": { "name": "openai-dev", "model": "gpt-4o-mini" },
    "maxTokens": 4000,
    "embeddingModelProfile": { "name": "oci-cohere-embedding", "model": "cohere.embed-multilingual-image-v3.0" },
    "dataStoreProfile": "oracle-atp",
    "tableName": "test_vectors",
    "topK": 5,
    "query": "${workflow.input.query}",
    "ragType": "naive",
    "dimensions": "512",
    "indexType": "HNSW",
    "distanceType": "COSINE"
  },
  "type": "GENAI_RETRIEVE"
}
```

## GRPC — call a gRPC service

```json
{
  "name": "grpc_0",
  "taskReferenceName": "grpc_0",
  "type": "GRPC",
  "inputParameters": {
    "host": "localhost",
    "port": 50051,
    "serviceName": "example.echo.EchoService",
    "methodName": "Echo",
    "payload": { "message": "hello" },
    "mode": "REFLECTION"
  }
}
```

`mode: "REFLECTION"` uses server reflection to resolve the service/method without a pre-compiled stub.

## SFTP — file transfer

```json
{
  "name": "Download files from SFTP Server to OCI Object Storage Bucket",
  "taskReferenceName": "download_files_SFTP_server",
  "inputParameters": {
    "operation": "DOWNLOAD",
    "sourceSftpProfileName": "sftp-profile-name",
    "sourceDirectory": "/home/ubuntu/inbound",
    "fileNamePattern": "^.*\\.xml$",
    "destinationType": "OCI_BUCKET",
    "ociNamespace": "oabcs1",
    "ociBucketName": "microtx",
    "ociProfile": "phoenix0",
    "idempotencyStrategy": "skipIfExists",
    "maximumFileTransfer": 5
  },
  "type": "SFTP"
}
```

`sourceSftpProfileName` references an SFTP Profile; `ociProfile` references a Cloud (OCI) Profile when the destination is OCI Object Storage.

## HTTP — call a REST endpoint

```json
{
  "name": "Send Email notification",
  "taskReferenceName": "email_notify",
  "inputParameters": {
    "method": "POST",
    "uri": "http://notification-service:8085/email-service/sendMail",
    "headers": { "Content-Type": "application/json" },
    "body": {
      "from": "microtx.user@localhost",
      "to": "microtx.user@microtx.com",
      "cc": "",
      "subject": "Loan approval request!",
      "body": "Please approve loan req ${workflow.workflowId}",
      "isEmailBodyText": true
    }
  },
  "type": "HTTP"
}
```

## SQL — execute database statements

```json
{
  "name": "oracleTask",
  "taskReferenceName": "oracle_refer",
  "inputParameters": {
    "databaseProfile": "MyDatabaseProfile",
    "sqlStatement": "insert into accounts (account_id,name,amount) values (?,?,?)",
    "type": "UPDATE",
    "parameters": [
      "${workflow.input.oracle.accountName}",
      "${workflow.input.oracle.accountName}",
      "${workflow.input.oracle.accountBalance}"
    ]
  },
  "type": "SQL"
}
```

`databaseProfile` references a Database Profile. `type` (within `inputParameters`) is the SQL operation kind, e.g. `UPDATE`, `QUERY`.

## TRANSACTION — MicroTx distributed transaction control

Used to begin/commit/rollback an XA, Saga, or TCC transaction against a MicroTx transaction coordinator from within a workflow.

```json
{
  "name": "begin_tx",
  "taskReferenceName": "begin_tx",
  "inputParameters": {
    "transaction_request": {
      "coordinatorUrl": "http://192.0.2.1:9000/api/v1",
      "transactionType": "XA",
      "action": "BEGIN"
    }
  },
  "type": "TRANSACTION"
}
```

`transactionType`: `XA`, `SAGA`, or `TCC`. `action`: `BEGIN`, `COMMIT`, `ROLLBACK` (consistent with the MicroTx Workflow skill's broader transaction concepts).

## TXEVENTQ_PUBLISH — publish to Oracle TxEventQ

```json
{
  "name": "txeventq_publish_1234",
  "taskReferenceName": "txeventq_publish_sample",
  "inputParameters": {
    "databaseProfile": "sample_db_profile_name",
    "topic": "sample_queue",
    "value": "This is the message I want to send. A simple hello.",
    "publisherAgentName": "Workflow_Publisher_sampleName",
    "enableIdempotency": true,
    "idempotentTableName": "fenced_task_idempotency_lock"
  },
  "type": "TXEVENTQ_PUBLISH"
}
```

## HUMAN — pause for manual approval

```json
{
  "name": "human_aml_verification_task",
  "taskReferenceName": "human_aml_verification",
  "type": "HUMAN",
  "inputParameters": {
    "applicant": "${extract_loan_details.output}"
  }
}
```

The workflow pauses at this task until it's completed/failed via `/api/tasks/{workflowId}/{taskRefName}/{status}` — see `workflows-guide.md` § Workflow Notifications.

## Other task/operator types (brief)

- **INLINE** — runs a small inline script/expression against task input without an external call; useful for lightweight data transforms (parse + validate + branch logic in one place). Verified usage: set `inputParameters.evaluatorType` to `"graaljs"` and put the script in `inputParameters.expression`; other input params are referenced inside the script as `$.<paramName>` (e.g. pass `"genai": "${genai_extract.output}"` and read `$.genai`). The expression's **return value is wrapped under `.result`** — i.e. downstream tasks and `outputParameters` read it as `${<ref>.output.result...}` (e.g. `${evaluate.output.result.gate}`), not `${<ref>.output...}`. Return a plain object (e.g. `(function(){ ... return {gate:'VALID', ...}; })();`). A clean pattern for "abort vs. continue": have the INLINE emit a string field (e.g. `gate: "VALID"|"INVALID"`), then a `SWITCH` with `evaluatorType: "value-param"` keys off `${evaluate.output.result.gate}`, routing the abort case to a `TERMINATE` task whose `inputParameters` set `terminationStatus: "COMPLETED"` and `workflowOutput` to the failure object.
- **WAIT** — pauses the workflow until a signal, duration, or external event resumes it.
- **KAFKA_PUBLISH** — publishes a message to a Kafka topic.
- **START_WORKFLOW** (Start Workflow Task) — starts another workflow (sub-workflow) as part of this workflow's execution.
- **JSON_JQ_TRANSFORM** — applies a `jq` expression to transform task input/output JSON.
- **JSON RPC** — invokes a JSON-RPC method on a remote service (analogous shape to HTTP task, but JSON-RPC envelope).

For exact schemas of these less-common types, check `references/openapi.json` or ask the user to share the relevant page of the PDF guide if precision matters.

## Worker / Simple Task Definitions

Distinct from the built-in system/operator types above, **task definitions** (`TaskDef`, via `/api/metadata/taskdefs`) describe reusable *worker* tasks — units of work executed by external workers that poll the queue (`/api/tasks/poll/{tasktype}`). Create via `POST /api/metadata/taskdefs` (supports bulk), update via `PUT`, fetch via `GET /api/metadata/taskdefs/{tasktype}`, search via `/api/metadata/taskdefs/search`, delete via `DELETE /api/metadata/taskdefs/{tasktype}`. Configure timeouts on the task definition (`timeoutSeconds`, `responseTimeoutSeconds`, retry settings) — this is the mechanism referenced by "Configure Timeout for Tasks" in the guide.
