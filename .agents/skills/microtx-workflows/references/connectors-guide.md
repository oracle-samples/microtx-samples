# Connector Profiles: Field Reference

Condensed from the Oracle MicroTx Workflows User's Guide (Release 26.1), mapped to the `references/openapi.json` connector schemas (`LlmProfile`, `DatabaseProfile`, `ToolConfig`, `McpServer`, `OciProfile`, `SftpProfile`).

Security handling: connector payloads often contain secrets. Never commit, log, echo, or paste back full API keys, passwords, private keys, wallet passwords, bearer tokens, or database URLs with embedded credentials. When showing payloads for review, redact secret fields as `"***"`. Prefer environment-specific secret-management or secure UI entry when available; only send real secret values in the API request after the user provides them for that purpose.

## LLM Connector (`/api/connectors/ai/llm-profiles`)

Stores provider config (provider type, connection details, model names) referenced by name from workflow tasks, agent profiles, and other AI features. Schema is intentionally minimal at the API level (`name`, `model`), with provider-specific connection details supplied per the provider type.

**Supported provider types**: OCI, Ollama, OpenAI, OpenAI-compatible, Oracle Database (for embeddings).

Provider-specific setup notes:
- **OpenAI**: API key from the OpenAI Developer Platform; base URL defaults to `https://api.openai.com/`. Treat the API key as a secret.
- **OCI**: requires an OCI user with API signing key pair (PEM), the public key fingerprint, OCID of user/tenancy, OCI region, compartment OCID, and a chosen serving mode (on-demand or dedicated) for Generative AI models. Treat the private key and passphrase as secrets; do not print or persist them outside the connector request.
- **Ollama**: base URL of the Ollama endpoint (e.g. `http://localhost:11434`), model names, optional API key if the endpoint requires auth. Treat any API key as a secret.
- **Oracle Database (embeddings)**: requires a Database Profile with `EMBEDDING_GENERATION` capability and an embedding model already loaded in the database (see Oracle AI Vector Search docs for loading embedding models). Select this Database Profile as the provider when creating the LLM connector.

Test connectivity via `POST /api/connector/test/llm-profile` before relying on the profile in a workflow.

## Database Profile (`/api/connectors/database/database-profiles`)

Defines connection parameters for SQL tasks, GenAI Ingestion/Retrieve, and TxEventQ tasks.

| Field | Notes |
|---|---|
| `name*` | unique, ≤128 chars, letters/numbers/`_`/`-` only |
| `description` | optional |
| `engine*` | `ORACLE` or `POSTGRES` |
| `username*` / `password*` | DB credentials; redact password in any displayed payload |
| `url*` | full JDBC URL, e.g. `jdbc:oracle:thin:@host:port/service` |
| `maxConnectionPoolSize` | max parallel connections |
| `capabilities*` | one or more of: `RELATIONAL` (SQL queries/transactions), `VECTOR` (similarity search / vector storage), `EMBEDDING_GENERATION` (used as an embedding provider) — `ORACLE` only |
| `wallet` / `walletMetaData*` | Oracle Wallet upload + metadata (`walletRequired`, `walletLocation`, `walletPassword`, `walletFileName`) for secure Oracle connections — `ORACLE` only. Treat wallet contents and wallet password as secrets |

To use a Database Profile as an embedding source for an LLM connector, it must have `EMBEDDING_GENERATION` capability and a model already configured in-database.

Test via `POST /api/connector/test/database-profile`.

## Internal Tool Configurations (`/api/connectors/ai/tool-configs`)

Registers a reusable tool that agent profiles and agentic planners can invoke. The `category`/`type` determine which typed sub-config applies (see `ToolConfig` schema: `ragRetrievalToolConfig`, `agentExecuteToolConfig`, `microTxWorkflowToolConfig`, `fileToolConfig`, `databaseToolConfig`).

| Category | Use when | Key config |
|---|---|---|
| **API** | Agent must call external HTTP endpoints | `type: HTTP`, `url`, optional `apiKey` (bearer token, encrypted at rest); redact `apiKey` |
| **Database** | Agent must run DB operations | `databaseProfile` name (existing Database Profile); `databaseToolConfig` has `allowWrite`, `allowDdl` flags to control permitted operations |
| **Agent** | One agent/tool invokes another Agent Profile (mainly for conversational sub-agents) | `agentExecuteToolConfig`: `agentProfileName*`, `inputData*` |
| **Workflow** | Tool starts one of a set of allowed workflows (mainly for conversational agents) | `microTxWorkflowToolConfig`: `allowedWorkflows*` (array of workflow refs) |
| **DateTime** | Built-in date/time utility tool | no extra config |
| **Calculator** | Built-in calculator tool | no extra config |
| **File** | Reads/writes files from MicroTx local storage (base path = `conductor.connector.storage-path`) | `fileToolConfig`: `baseDir`, `maxChunkSizeBytes`, `maxFileSizeBytes`, `overlapBytes` |
| **RAG search** | Agent retrieves from a vector/RAG store — same parameters as GenAI Retrieve | `ragRetrievalToolConfig`: `llmProfile*`, `embeddingModelProfile*`, `tableName`, `dimensions`, `indexType`, `distanceType`, `topK`, `llmParams` |

## MCP Server (`/api/connectors/ai/mcp-servers`)

Registers an external Model Context Protocol server. At runtime, MicroTx discovers the tools the MCP server exposes and makes them available to agentic planner tasks, agent profiles (Agentic Task and conversational chat).

| Field | Notes |
|---|---|
| `name*` | unique identifier referenced from agent profiles / planner tasks |
| `transport*` | `STDIO` or `SSE` (also supports HTTP-based transport per the guide) |
| `command` / `args` / `env` | for `STDIO` transport — the server runs as a local process *inside the MicroTx Workflow server container*. All runtime dependencies (e.g. Node.js/npm/npx for an npx-based MCP server) must be present in that container image. If the MCP server runs elsewhere (separate container/pod/host/managed service), use `SSE`/HTTP instead. |
| `url` / `sseEndpoint` | for `SSE` transport — endpoint of the remote MCP server |
| `authzType` / `apiKey` | authentication — supports API token, or token propagation if enabled in the environment. Redact `apiKey` |
| `version` | MCP server/protocol version if applicable |

Test via `POST /api/connector/test/mcp-server`.

## Cloud Profile (OCI) (`/api/connectors/oci/oci-profiles`)

Used by SFTP tasks to connect to OCI Object Storage (e.g. as a destination for downloaded files).

| Field | Notes |
|---|---|
| `name*` | unique identifier |
| `userOcid` | OCID of the OCI user |
| `tenancyOcid` | OCID of the tenancy containing the bucket |
| `fingerprint` | fingerprint of the uploaded public key |
| `privateKey` / `privateKeyPassphrase` | PEM private key (paired with the uploaded public key) and optional passphrase. Redact both |
| `regionId` | e.g. `us-phoenix-1` |

## SFTP Profile (`/api/connectors/sftp/sftp-profiles`)

| Field | Notes |
|---|---|
| `name*` | unique identifier |
| `userName*` | SFTP username |
| `host*` / `port*` | SFTP server address (default port usually 22) |
| `privateKey` / `privateKeyPassphrase` | key-based auth credentials. Redact both |

Test via `POST /api/connector/test/sftp-profile` (lists current directory `.` to confirm connectivity).

## Storage

`/api/storage` is direct file-storage management (upload/list/delete), not a connector profile — there's no separate "Storage Profile" CRUD resource. The base path for local file storage is set by `conductor.connector.storage-path` in `application.properties`. Files uploaded here can be referenced by Agentic Tasks (`data.source: "local"`, `data.filePath`) and GenAI Ingestion tasks.
