# Workflows: Definitions, Executions, Schedules, Notifications

Condensed from the Oracle MicroTx Workflows User's Guide (Release 26.1). Covers concepts and field semantics behind the REST API endpoints in `openapi.json`.

## Workflow Definitions

A workflow definition is the blueprint: name, version, task list, input/output parameters, timeout config, and metadata. A workflow execution is a running or completed instance of that definition.

Key options when authoring a `WorkflowDef`:

- **name**: required, unique, up to 128 chars, letters/numbers/underscore/hyphen only (no spaces or special chars). Cannot be changed after creation — to "rename," create a new definition.
- **description**: optional, up to 2048 chars.
- **restartable**: enabled by default; allows restarting workflows in COMPLETED, TERMINATED, FAILED, or TIMED_OUT state.
- **timeoutSeconds**: default `0` (no timeout — runs until a final state, possibly days/weeks).
- **timeoutPolicy**:
  - `TIME_OUT_WF` — terminates the workflow and sets status to TIMED_OUT when the timeout is exceeded; the associated task is canceled.
  - `ALERT_ONLY` (default) — records the timeout for monitoring without terminating the workflow.
- **failureWorkflow**: name of a workflow to start automatically if this workflow fails — useful for cleanup/compensation/notification.
- **workflowStatusListenerEnabled**: enable only if a workflow status listener is configured; triggers on lifecycle events (started, paused, resumed, retried, restarted, completed, terminated, finalized).
- **inputParameters** / **outputParameters**: input parameter names callers can pass (referenced in tasks via `${workflow.input.X}`), and output mappings that can reference workflow inputs, variables, or task outputs.
- **schemaVersion**: use `2`.

A workflow must contain at least one task, and each task needs a unique `name` and `taskReferenceName` within the definition (1–128 alphanumeric chars, optionally `_`/`-`, no spaces).

### Minimal example (single GenAI task)

```json
{
  "name": "genai_summarize_task",
  "description": "GenAI Summarize Task",
  "version": 1,
  "tasks": [
    {
      "name": "Summarize_Text",
      "taskReferenceName": "genai_summarize_text",
      "inputParameters": {
        "llmProfile": { "name": "openai-dev", "model": "gpt-4o-mini" },
        "prompt": "Summarize the following content clearly and concisely, highlighting the key points, main ideas, and any important conclusions or actions.",
        "data": { "source": "local", "filePath": "${workflow.input.filePath}" },
        "maxTokens": 4000,
        "temperature": 0.7,
        "top_p": 0.9,
        "top_k": 50
      },
      "type": "GENAI_TASK"
    }
  ],
  "inputParameters": [],
  "outputParameters": {},
  "schemaVersion": 2,
  "restartable": true,
  "workflowStatusListenerEnabled": false,
  "ownerEmail": "example@email.com",
  "timeoutPolicy": "ALERT_ONLY",
  "timeoutSeconds": 0,
  "variables": {},
  "inputTemplate": {},
  "enforceSchema": true,
  "metadata": {}
}
```

Always validate non-trivial definitions via `POST /api/metadata/workflow/validate` before `POST`/`PUT` to `/api/metadata/workflow` — invalid task references, missing names, or duplicate `taskReferenceName`s are common errors.

Deleting a definition (`DELETE /api/metadata/workflow/{name}/{version}`) removes only that version; it does not delete workflow executions already created from it.

## Workflow Executions

### Status model

| Status | Meaning | Typical next actions |
|---|---|---|
| RUNNING | Active, tasks scheduling/executing | Pause, terminate |
| PAUSED | Execution suspended until resumed | Resume, terminate |
| COMPLETED | Finished successfully (terminal) | Delete, archive, restart |
| FAILED | One or more tasks failed (terminal) | Delete, archive, retry, restart |
| TERMINATED | Stopped via API/user/event (terminal) | Delete, archive, retry, restart |
| TIMED_OUT | Exceeded workflow/task timeout (terminal) | Delete, archive, retry, restart |
| DELETED | Removed, no longer available | None |

Notes:
- COMPLETED, FAILED, TERMINATED, TIMED_OUT are terminal — execution does not continue automatically.
- **Retry** resumes from FAILED/TIMED_OUT/CANCELED tasks; not available for COMPLETED workflows.
- **Restart** begins execution again from the start; only for terminal workflows, and only if the definition is `restartable`.
- Pause/Resume only apply while RUNNING/PAUSED.

### Idempotency

MicroTx applies idempotency at two levels:

**Workflow-level**: identified by the combination of `idempotencyKey` + workflow `name` + `version`. If you don't supply an `idempotencyKey`, one is generated automatically and returned in the output for tracking. Resubmitting the same key while:
- the existing execution is **Running** → request is rejected (already in progress)
- the existing execution is **Completed** → the existing execution is returned instead of starting a new one
- the existing execution is **Failed/Terminated/TimedOut** → request is rejected, reporting that a prior execution with that key exists in that status

**Task-level**: applies per-task (e.g. Agentic Tasks default to task-level idempotency) to prevent duplicate side effects on retry/replay, governed by an idempotency lock with a configurable timeout (Agentic Task default: 600000 ms / 10 minutes).

### Running workflows — practical guidance

- Simple case ("run workflow X with these inputs") → `POST /api/workflow/{name}` with the input map as body. Optional query params: `version`, `correlationId`, `priority`, `idempotencyKey`.
- Need correlation IDs, idempotency strategy, or `taskToDomain` routing → `POST /api/workflow` with a full `StartWorkflowRequest`.
- Need the result immediately, no async polling → `POST /api/workflow/execute/{name}/{version}` (synchronous).
- Testing with mock data before wiring real integrations → `POST /api/workflow/test`.

## Schedules

Scheduled workflow definitions run workflows automatically (daily/weekly/monthly/etc. — scheduler must be enabled). CRUD via `/api/scheduler/metadata/scheduleWf` (list/create) and `/api/scheduler/metadata/scheduleWf/{name}` (get/update/delete). Check scheduler availability with `GET /api/scheduler/active`.

## Event Handlers

Event handlers listen for events from supported message brokers and trigger actions on a workflow/task when conditions match — useful for loose coupling between workflows. CRUD via `/api/event` (list/create/update) and `/api/event/{name}` (delete), with lookups by event (`/api/event/{event}`) or name (`/api/event/name/{name}`).

## Workflow Notifications (Human Tasks / Approvals)

When a workflow reaches a `HUMAN` task, MicroTx creates a notification and pauses that branch until the task is updated — used for approvals, exception handling, compliance review, or reviewing AI-generated recommendations before they take effect.

Flow:
1. `GET /api/notifications/human-tasks` (params: `start`, `size`, `sort`, `freeText`) — search pending/in-progress human tasks. Each result includes `workflowInstanceId`, `taskDefName`, `taskId`, `inputData`.
2. Optionally review the full execution via `GET /api/workflow/{workflowId}`.
3. Act on the task: `POST /api/tasks/{workflowId}/{taskRefName}/{status}` (or the `/sync` variant to get the updated workflow back immediately):
   - `status = COMPLETED` → approves; workflow continues per the definition.
   - `status = FAILED` → rejects; include a failure reason in the body. Workflow then follows its failure-handling path (e.g. `failureWorkflow`).
