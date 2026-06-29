---
name: microtx-workflows
description: Use this skill for any task involving Oracle MicroTx Workflow Server (Conductor-based) — defining, updating, or deleting workflow definitions; managing connectors (LLM, Database, Internal Tools/MCP, MCP Server, Storage, SFTP, OCI/Cloud); managing Agentic AI metadata (Prompt Templates / Prompt Profiles, Agent Profiles); starting/running/searching/removing workflow executions and console-visible execution entries; and getting or approving workflow human-task notifications. Trigger this whenever the user mentions the MicroTx Workflow Server, CONDUCTOR_SERVER_URL, workflow-server REST API, LLM/MCP/SFTP/OCI/database profiles in this context, agent profiles, prompt profiles, human tasks/approvals, or asks to create/run/inspect/remove a workflow execution against this API.
---

# Oracle MicroTx Workflows Skill

Helps define, update, run, and manage workflows and their supporting resources (connectors, agentic AI profiles) on the Oracle MicroTx Workflow Server — a Netflix Conductor-based orchestration engine with Oracle's agentic AI extensions.

## Setup: get the server URL first

Before making any API call, ask the user for `CONDUCTOR_SERVER_URL` if not already provided in the conversation. Default: `http://127.0.0.1/workflow-server/api`.

All paths below are relative to this base URL (the OpenAPI spec's paths already include `/api/...`, so concatenate base-without-trailing-`/api` + path, or just confirm the exact base with the user if ambiguous — e.g. if base is `http://127.0.0.1/workflow-server/api`, then a path documented as `/api/metadata/workflow` becomes `http://127.0.0.1/workflow-server/api/metadata/workflow`).

Authentication: only assume "no auth" for explicit local/loopback development URLs such as `127.0.0.1`, `localhost`, or a user-confirmed local tunnel. For any remote, shared, cluster, or production-looking URL, ask the user what authentication is required before making API calls. Never invent auth headers, and never print, store, or commit credentials supplied for connector/API setup.

## Full API reference

The complete OpenAPI spec is bundled at `references/openapi.json` (117 endpoints). Load it when you need exact request/response schemas, parameter names, or to discover an endpoint not covered in the cheat-sheet below. Use `grep`/`jq`/Python to query it rather than viewing the whole file (it's large).

## User's Guide references (concepts, field semantics, JSON examples)

Condensed from the Oracle MicroTx Workflows User's Guide (Release 26.1). Read the relevant file when you need more than the cheat-sheet — field-level semantics, status models, idempotency rules, guardrails, or ready-to-adapt JSON examples per task type:

- `references/workflows-guide.md` — workflow definition options, execution status model, idempotency (workflow- and task-level), schedules, event handlers, and the human-task notification/approval flow.
- `references/task-types.md` — catalog of task types (`AGENTIC_TASK`, Agentic Planner, `GENAI_TASK`, `GENAI_INGESTION`, `GENAI_RETRIEVE`, `GRPC`, `SFTP`, `HTTP`, `SQL`, `TRANSACTION`, `TXEVENTQ_PUBLISH`, `HUMAN`, and others) with example `inputParameters` JSON to use as templates.
- `references/connectors-guide.md` — field-by-field reference for LLM, Database, Internal Tool, MCP Server, Cloud (OCI), and SFTP profiles, including provider-specific setup notes (OpenAI/OCI/Ollama/Oracle DB embeddings) and tool-config categories.
- `references/agentic-ai-guide.md` — Prompt Profile and Agent Profile fields, guardrail rules, memory/capabilities semantics, and pre-checks/testing endpoints before wiring an agent into a workflow.

## Cheat sheet: core operations

### 1. Workflows (definitions)

| Action | Method & Path |
|---|---|
| List all (with blueprint) | `GET /api/metadata/workflow` |
| Get one by name | `GET /api/metadata/workflow/{name}` |
| Create new | `POST /api/metadata/workflow` (body: WorkflowDef) |
| Create or update (upsert) | `PUT /api/metadata/workflow` (body: **array** of WorkflowDef — bulk) |
| Validate before saving | `POST /api/metadata/workflow/validate` (body: single WorkflowDef) |
| Delete (specific version) | `DELETE /api/metadata/workflow/{name}/{version}` |
| Search definitions | `GET /api/metadata/workflow/search` |
| Latest versions only | `GET /api/metadata/workflow/latest-versions` |

**WorkflowDef** key fields: `name*`, `version`, `description`, `tasks*` (array of WorkflowTask), `timeoutSeconds*`, `inputParameters`, `outputParameters`, `failureWorkflow`, `restartable`, `schemaVersion` (use `2`).

Always validate (`POST /metadata/workflow/validate`) before creating/updating a non-trivial workflow definition, and show the user the JSON before submitting — workflow defs are easy to get subtly wrong (task references, switch cases, dynamic forks). Note the body-shape difference (verified): `validate` takes a **single** WorkflowDef object, but the `PUT` upsert takes an **array** (`[ {...} ]`) and reports per-def results as `{"bulkSuccessfulResults":[...], "bulkErrorResults":{...}}` — check `bulkErrorResults` is empty to confirm the write. "Deploying" a workflow on this server is just this metadata write; there is no separate deploy step.

For task-type JSON templates (`AGENTIC_TASK`, `GENAI_TASK`, `SQL`, `HTTP`, `HUMAN`, etc.), see `references/task-types.md`.

**Staging the definition file safely:** when you stage a workflow definition to feed `curl --data-binary @file`, use a fresh temporary file rather than a predictable path such as `/tmp/<name>.json`. Predictable names can clobber unrelated files and are more exposed to symlink/path-confusion issues. Use `mktemp`, then write the JSON with a single-quoted heredoc:

```bash
payload_file="$(mktemp "${TMPDIR:-/tmp}/microtx-workflow.XXXXXX.json")"
cat > "$payload_file" <<'JSON'
{ ...workflow definition... }
JSON
```

A single-quoted heredoc (`<<'JSON'`) preserves the JSON verbatim — no shell expansion of `$`, `${...}`, or backticks, which workflow definitions are full of (`${workflow.input.x}`, INLINE graaljs scripts). Remove the temporary file after the API call if it contains sensitive workflow inputs. If you must use the `Write` tool, pick a fresh unique filename or read the existing path first before overwriting it.

### 2. Connectors

All connector resources follow the same CRUD shape: `GET` (list/search), `GET /{name}` (one), `POST` (create), `PUT /{name}` (update), `DELETE /{name}`.

Treat connector payloads as secret-bearing whenever they include API keys, passwords, private keys, wallet fields, database URLs, or bearer tokens. Do not echo full payloads containing secrets back to the user; show redacted JSON (`"***"`) for review and send the real values only in the API request when the user has supplied them for that purpose.

| Connector type | Base path |
|---|---|
| LLM | `/api/connectors/ai/llm-profiles` |
| Database | `/api/connectors/database/database-profiles` |
| Internal Tools | `/api/connectors/ai/tool-configs` |
| MCP Server | `/api/connectors/ai/mcp-servers` |
| Storage | `/api/storage` (see note below) |
| SFTP | `/api/connectors/sftp/sftp-profiles` |
| Cloud (OCI) | `/api/connectors/oci/oci-profiles` |

**Storage** is not a profile-based connector like the others — `/api/storage` (GET list, POST upload, DELETE /{filename}, DELETE all) handles file storage directly. If the user wants a persistent storage *profile* (vs. ad-hoc file ops), clarify what they mean — the API doesn't expose a storage-profile CRUD resource the same way it does for SFTP/OCI/DB. Require explicit confirmation immediately before storage deletion, especially `deleteAll`.

Key schema fields per connector (see `references/openapi.json` `components.schemas` for full detail):

- **LlmProfile**: `name`, `model`
- **DatabaseProfile**: `name`, `engine*`, `capabilities*`, `username*`, `password*`, `url*`, `wallet`, `walletMetaData*` (Oracle wallet support), `maxConnectionPoolSize`
- **McpServer**: `name`, `transport*`, `url`, `command`, `args`, `env`, `sseEndpoint`, `authzType`, `apiKey`, `version`
- **SftpProfile**: `name`, `userName`, `privateKey`/`privateKeyPassphrase`, `host*`, `port*`
- **OciProfile**: `name`, `privateKey`, `privateKeyPassphrase`, `regionId`, `userOcid`, `tenancyOcid`, `fingerprint`
- **ToolConfig** (Internal Tools): `name`, `category*`, `type`, plus one of the typed sub-configs: `ragRetrievalToolConfig`, `agentExecuteToolConfig`, `microTxWorkflowToolConfig`, `fileToolConfig`, `databaseToolConfig` — pick based on `category`/`type`

**Test connectivity before creating** when practical:
- `POST /api/connector/test/{testType}` where testType is `llm-profile` or `mcp-server`
- `POST /api/connector/test/sftp-profile`
- `POST /api/connector/test/database-profile`

### 3. Agentic AI

| Resource | Base path |
|---|---|
| Prompt Profile (Prompt Template) | `/api/metadata/ai/prompts` |
| Agent Profile | `/api/metadata/ai/agents` |

Standard CRUD: `GET` (search/list), `GET /{name}`, `POST` (create), `PUT /{name}` (update), `DELETE /{name}`.

- **PromptProfile**: `name`, `description`, `promptTemplate*`
- **AgentProfile**: `name`, `description`, `role*`, `instruction*`, `llmProfile*`, `tools` (array of ToolConfig names), `mcpServers` (array of MCP server names), `memory`, `maxMessages`, `maxToolCalls`, `capabilities*`, `promptVariables`, `temperature`, `maxTokens`, `topK`, `topP`, `guardrails`

Before creating an Agent Profile, check that referenced `llmProfile`, `tools`, and `mcpServers` already exist (list them via their respective connector endpoints) — dangling references will likely fail at runtime even if the metadata write succeeds.

**Testing agentic AI** (useful before wiring into a workflow):
- `POST /api/metadata/ai/test/prompt-profile` — test a prompt string against an LLM profile
- `POST /api/metadata/ai/test/agentic-profile` or `/agentic-profile/{name}` — execute an agent profile and get the final reply
- `POST /api/metadata/ai/test/agentic-planner` — simulate the Agentic Planner

### 4. Running workflows

| Action | Method & Path |
|---|---|
| Start by name (simple) | `POST /api/workflow/{name}` — body is input map (`{}` if none); query params: `version`, `correlationId`, `priority`, `idempotencyKey` |
| Start with full request | `POST /api/workflow` — body: StartWorkflowRequest |
| Execute synchronously | `POST /api/workflow/execute/{name}/{version}` |
| Test with mock data | `POST /api/workflow/test` |
| Get status/details | `GET /api/workflow/{workflowId}` |
| Pause / Resume | `PUT /api/workflow/{workflowId}/pause` / `/resume` |
| Retry / Restart / Rerun | `POST /api/workflow/{workflowId}/retry` / `/restart` / `/rerun` |
| Terminate | `DELETE /api/workflow/{workflowId}` |
| Terminate + remove | `DELETE /api/workflow/{workflowId}/terminate-remove` |
| Search executions | `GET /api/workflow/search` or `search-v2` |
| Running by name | `GET /api/workflow/running/{name}` |
| By correlation id | `GET /api/workflow/{name}/correlated/{correlationId}` |

**StartWorkflowRequest** key fields: `name*`, `version`, `correlationId`, `input`, `taskToDomain`, `priority`, `idempotencyKey`, `idempotencyStrategy`.

For the simple case ("run workflow X with these inputs"), prefer `POST /api/workflow/{name}` with the input map as the body — it's the most direct path. Use the full `StartWorkflowRequest` (`POST /api/workflow`) only when correlation IDs, idempotency, or `taskToDomain` routing are needed.

**Passing input — get this right or inputs silently vanish (verified gotcha):**
- `POST /api/workflow/{name}` — body is the **raw input map** directly, e.g. `{"loan_request":"..."}`. Returns the `workflowId` as a plain string.
- `POST /api/workflow` and `POST /api/workflow/execute/{name}/{version}` — body is a **`StartWorkflowRequest`**, so the input must be nested under an `input` key: `{"name":"...","version":1,"input":{"loan_request":"..."}}`. If you send a raw map to these endpoints, the server accepts it but **drops the input** — the run records `input: {"variables":{}}` and every `${workflow.input.X}` resolves to `null`. The symptom is a workflow that "works" but sees all-null inputs (e.g. a GENAI prompt rendered with `Loan request:\nnull`). When debugging null inputs, first check the recorded `input` on the execution and confirm you used the matching body shape.

**"Execute synchronously" is not synchronous for async tasks (verified gotcha):** `POST /api/workflow/execute/{name}/{version}` returns as soon as it hits the first async-completed task. Workflows containing `GENAI_TASK`, `AGENTIC_TASK`, or other long-running steps come back with `status: RUNNING` and no output. Don't treat its immediate response as the result — **poll** `GET /api/workflow/{workflowId}?includeTasks=true` until `status` leaves `RUNNING`/`PAUSED`/`SCHEDULED` (a GENAI step typically needs ~15–25s). The final decision is in the execution's `output`; `includeTasks=true` also lets you inspect each task's `inputData`/`outputData` when debugging.

### 5. Removing workflow executions

When the user asks to remove executions, runs, processes, or console entries, operate only on execution/runtime data. **Do not delete or update workflow definitions** (`/api/metadata/workflow...`) unless the user explicitly asks to remove a definition by exact name/version.

Before any destructive workflow call, restate the exact target and get confirmation in the current turn. This includes workflow definition name/version, workflow ID, execution removal/termination, connector/profile name, storage filename or `deleteAll`, chat-history agent/session, and human-task failure/rejection.

Use supported workflow APIs first:

1. Find IDs with `GET /api/workflow/search?query=workflowType={name}&size=...` or use the exact `workflowId` supplied by the user.
2. After confirmation, for terminal executions call `DELETE /api/workflow/{workflowId}/remove?archiveWorkflow=false`. For running executions, call `DELETE /api/workflow/{workflowId}/terminate-remove?archiveWorkflow=false&reason=...`.
3. Verify each ID with `GET /api/workflow/{workflowId}`. A `404` means the runtime execution record is gone.
4. Verify the definition is untouched with `GET /api/metadata/workflow/{name}` when a workflow name is known.

**Console still shows the execution after `/remove` (Oracle indexing gotcha):** On local MicroTx deployments with `CONDUCTOR_INDEXING_TYPE=oracle`, `/api/workflow/search` and the UI console can show an orphaned row from `WORKFLOW_INDEX` even after `GET /api/workflow/{workflowId}` returns `404`. `search-v2` may return `501 not supported for Oracle indexing`, and `POST /api/admin/consistency/verifyAndRepair/{workflowId}` may fail if `WorkflowRepairService is disabled`.

If the user explicitly wants the console entry gone too, and this is a local/dev Oracle-backed deployment, prefer supported API/admin repair paths when available. Use direct SQL only as a last resort for an orphaned search-index row:

1. Confirm the exact `workflowId` and workflow name in `/api/workflow/search`.
2. Confirm `GET /api/workflow/{workflowId}` returns `404`.
3. Connect to the MicroTx schema and check table names before deleting:
   ```sql
   SELECT /* LLM in use is <model> */ COUNT(*) AS workflow_rows
   FROM WORKFLOW
   WHERE WORKFLOW_ID = '<workflowId>';

   SELECT /* LLM in use is <model> */ COUNT(*) AS index_rows
   FROM WORKFLOW_INDEX
   WHERE WORKFLOW_ID = '<workflowId>';
   ```
4. Show the counts to the user and get explicit approval immediately before SQL deletion.
5. Delete only the orphaned index row when `workflow_rows = 0`, `index_rows > 0`, and the user has approved the exact `workflowId`:
   ```sql
   DELETE /* LLM in use is <model> */ FROM WORKFLOW_INDEX
   WHERE WORKFLOW_ID = '<workflowId>';
   COMMIT;
   ```
6. Re-run `/api/workflow/search?query=workflowId={workflowId}` and confirm it returns zero results.

Do not claim or attempt to erase all evidence of activity. Do not purge audit logs, application logs, Kubernetes logs, security events, or unrelated rows. The scope is removal of the execution record and any stale console/search-index row for the exact workflow ID(s) the user named.

### 6. Human task notifications / approvals

| Action | Method & Path |
|---|---|
| Search pending/in-progress human tasks | `GET /api/notifications/human-tasks` (params: `start`, `size`, `sort`, `freeText`) |
| Approve / complete a human task | `POST /api/tasks/{workflowId}/{taskRefName}/{status}` — body: output data map; `status` is typically `COMPLETED` (or `FAILED` to reject) |
| Approve synchronously, get updated workflow | `POST /api/tasks/{workflowId}/{taskRefName}/{status}/sync` |

**HumanTask** fields: `taskId`, `status`, `taskDefName`, `workflowInstanceId`, `scheduledTime`, `updateTime`, `inputData`, `workflowName`.

Typical approval flow: search human tasks → identify the one to act on (`workflowInstanceId` + `taskDefName` give you `workflowId`/`taskRefName`) → `POST /api/tasks/{workflowId}/{taskRefName}/COMPLETED` with the approval decision in the body.

## Working with the user

- Always confirm `CONDUCTOR_SERVER_URL` once per session (or reuse if already established earlier in the conversation).
- For create/update operations on workflows, connectors, or agent/prompt profiles, show the JSON payload to the user before issuing the `POST`/`PUT` — redact secret values before displaying.
- For destructive operations, confirm the exact target immediately before calling. Cover definition name/version, workflow ID, connector/profile name, storage filename or `deleteAll`, chat-history agent/session, human-task failure/rejection, and any direct SQL cleanup.
- If an endpoint isn't covered above, grep `references/openapi.json` for the resource name to find the exact path and schema rather than guessing.
- Use `curl` via bash for actual calls; pretty-print JSON responses (`python3 -m json.tool` or `jq`) when summarizing for the user.
