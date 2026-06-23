# Agentic AI: Prompt Profiles and Agent Profiles

Condensed from the Oracle MicroTx Workflows User's Guide (Release 26.1), covering `/api/metadata/ai/prompts` (Prompt Profile / Prompt Template) and `/api/metadata/ai/agents` (Agent Profile).

## Prompt Profile (Prompt Template Definition)

A reusable, structured system instruction with placeholders/variables for dynamic use across workflows — used by GenAI Tasks (single-prompt operations like summarizing or classifying) and by Agentic Planner (dynamic decision-making).

| Field | Notes |
|---|---|
| `name*` | unique, ≤128 chars, letters/numbers/`_`/`-` only, immutable after creation |
| `description` | optional |
| `promptTemplate*` | the prompt text itself, with placeholders like `${workflowId}` or `${workflow.input.X}` |

### Example: planner-style prompt template

A prompt template for an Agentic Planner typically encodes the decision logic as natural-language conditions referencing task names and their outcomes:

> A planner prompt for a loan approval flow might instruct the model to first connect to a database tool to mark an application "under review," then run a document-verification task; if that fails, report a final status of FAILED; if it succeeds, run compliance and processing tasks in parallel, branching further on their outcomes (e.g. triggering a human-verification task on a specific compliance failure), and finally report SUCCESS or FAILED based on the combined results.

The exact task names referenced in the prompt (`document_verification_task`, `compliance_agent`, `human_aml_verification`, etc.) must correspond to `taskReferenceName`s available to the planner (see the Agentic Planner task's `tasks` array in `task-types.md`).

## Agent Profile

A reusable AI agent definition: role, instructions, LLM, tools, MCP servers, memory, execution limits, capabilities, and guardrails — centralized so multiple workflows (via Agentic Tasks) or the conversational chat API can invoke the same agent.

| Field | Notes |
|---|---|
| `name*` | unique, ≤128 chars, letters/numbers/`_`/`-` only. Referenced from Agentic Tasks (`agentProfile`) and the chat API (`agentName`) |
| `description` | optional |
| `role*` | high-level behavior/persona description included in the execution prompt — keep concise and stable; max 200,000 chars |
| `instruction*` | detailed behavioral instructions — what the agent does, how it responds, how it uses tools, constraints; max 400,000 chars |
| `capabilities*` | one or both of: `Workflow` (agent can run within MicroTx via Agentic Tasks, workflow manages execution) and `Conversational` (agent can run as free-form chat via the conversation API) |
| `llmProfile*` | name (and model) of the LLM connector powering the agent. **Note: Agentic Task does not support Cohere models.** |
| `memory` | boolean — applies only to the `Conversational` capability. When enabled (default), the agent uses prior chat context (recent messages + summary) for continuity across turns. Disabling reduces multi-turn relevance. No effect on workflow/Agentic Task execution. |
| `maxMessages` | max chat messages kept in the in-memory context window; older messages evicted beyond this. Default `20`. |
| `promptVariables` | placeholder values referenced in `role`/`instruction` (e.g. `${customerName}`). If the same variable is also set at the Agentic Task level, the **agent profile value takes precedence**. |
| `guardrails` | stop-word rules — each rule has `words` (case-insensitive terms/phrases), `scope` (`INPUT`, `OUTPUT`, or `BOTH`), and `action` (`MASK` → replace with `***`, or `FAIL` → raise a guardrail violation and stop execution). Input guardrails run before the LLM call; output guardrails run after. Invalid/omitted `scope` or `action` → rule not enforced; empty `words` → rule matches nothing. Task-level guardrails (on an Agentic Task) are merged with profile-level ones, with task-level values overriding on conflicting fields. |
| `temperature` | randomness; lower = more deterministic. Default `0.2` |
| `maxTokens` | max tokens the model can generate per response. Default `1024` |
| `topK` | default `40` |
| `topP` | nucleus sampling. Default `0.9` |
| `maxToolCalls` | cap on tool invocations per session, to prevent runaway loops. Default `10` |
| `mcpServers` | array of MCP Server names the agent can use |
| `tools` | array of Internal Tool Configuration names the agent can invoke |

### Example role/instruction pattern

A typical Database Assistant agent might define its `role` as an expert, cautious database assistant whose job is translating natural-language requests into valid SQL, and its `instruction` as a step-by-step procedure: parse the request, construct the appropriate Oracle SQL, and present results in a clear format (e.g. a markdown table).

### Pre-checks before creating an Agent Profile

Verify referenced resources already exist to avoid dangling references that fail at runtime even though the profile metadata write succeeds:
- `llmProfile` → `GET /api/connectors/ai/llm-profiles/{name}`
- each entry in `tools` → `GET /api/connectors/ai/tool-configs/{name}`
- each entry in `mcpServers` → `GET /api/connectors/ai/mcp-servers/{name}`

### Testing before wiring into a workflow

- `POST /api/metadata/ai/test/prompt-profile` — run a prompt string against a chosen LLM profile/model
- `POST /api/metadata/ai/test/agentic-profile` or `/agentic-profile/{name}` — execute an agent profile end-to-end and get the final (non-streaming) reply
- `POST /api/metadata/ai/test/agentic-planner` — simulate a planner run and inspect the `PlannerResponse`

## Conversational Agent Chat

Agent Profiles with the `Conversational` capability can be driven via `POST /api/conversational-agent/chat` (SSE streaming of intermediate and final results, with chat-session context). Chat history is managed per agent/session via `/api/conversational-agent/history/{agentName}` and `/api/conversational-agent/history/{agentName}/{chatSessionId}` (GET to fetch, DELETE to clear).
