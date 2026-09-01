#!/bin/bash

# Global variable to control deployment type: "cluster" (default) or "local"
DEPLOYMENT_TYPE="cluster"

# Capture raw environment inputs for warning logs
raw_istio_url="${istio_url-}"
raw_istio_ip="${istio_ip-}"

# istio_url="${istio_url:-127.0.0.1:80}"
istio_url="${istio_url:-https://demo.microtx.dev:443}"

istio_ip="${istio_ip:-127.0.0.1}"

# Common curl options (work on macOS and Oracle Linux)
CURL_COMMON_OPTS=(-L -k)
CURL_RESOLVE_OPTS=()

warn_on_missing_istio_env() {
  if [[ -z "$raw_istio_url" ]]; then
    echo "⚠️ Warning: 'istio_url' was empty or unset. Using default: ${istio_url}"
  fi

  if [[ -z "$raw_istio_ip" ]]; then
    echo "⚠️ Warning: 'istio_ip' was empty or unset. Using default: ${istio_ip}"
  fi
}

is_ipv4() {
  local value="$1"
  [[ "$value" =~ ^([0-9]{1,3}\.){3}[0-9]{1,3}$ ]]
}

configure_curl_options() {
  CURL_RESOLVE_OPTS=()

  if [[ "$DEPLOYMENT_TYPE" != "cluster" ]]; then
    echo "ℹ️ Local mode: using common curl options only (-L -k), no --resolve mapping"
    return
  fi

  local url="$istio_url"
  local scheme=""
  local rest=""
  local authority=""
  local host=""
  local port=""

  if [[ "$url" == *"://"* ]]; then
    scheme="${url%%://*}"
    rest="${url#*://}"
  else
    rest="$url"
    scheme="http"
  fi

  authority="${rest%%/*}"
  host="${authority%%:*}"

  if [[ "$authority" == *:* ]]; then
    port="${authority##*:}"
  else
    if [[ "$scheme" == "https" ]]; then
      port="443"
    else
      port="80"
    fi
  fi

  if [[ "$scheme" == "https" ]]; then
    echo "🔐 HTTPS Istio URL detected."
    if [[ -n "$host" && -n "$port" && -n "$istio_ip" ]] && ! is_ipv4 "$host"; then
      CURL_RESOLVE_OPTS=(--resolve "${host}:${port}:${istio_ip}")
      echo "🔧 curl host override enabled: ${host}:${port}:${istio_ip}"
    else
      echo "ℹ️ curl host override not required (host is IP or host/port/istio_ip missing)."
    fi
  else
    echo "🌐 HTTP Istio URL detected. Using direct URL (no --resolve mapping)."
  fi
}

curl_with_common_opts() {
  curl "${CURL_COMMON_OPTS[@]}" "${CURL_RESOLVE_OPTS[@]}" "$@"
}

# Function to set service endpoints based on deployment type
handle_deployment_type() {
  warn_on_missing_istio_env

  if [[ "$DEPLOYMENT_TYPE" == "cluster" ]]; then
    local normalized_istio_url="${istio_url%/}"
    WF_SERVER_URL="${normalized_istio_url}/workflow-server"
    DOC_MCP_SVC="http://doc-process-mcp-server:8000"
    LOAN_COMPLIANCE_SVC="http://loan-compliance-service:8001"
    LOAN_PROCESSING_AGENT_SVC="http://loan-processing-agent:8002"
    NOTIFICATION_SVC="http://notification-service:8085"
    OCR_SVC="http://ocr-service:8000"
    echo "🚀 Deploying in CLUSTER mode"
    echo "🔗 Effective workflow server url: $WF_SERVER_URL"
  else
    WF_SERVER_URL="http://localhost:9010/workflow-server"
    DOC_MCP_SVC="http://localhost:8010"
    LOAN_COMPLIANCE_SVC="http://localhost:8001"
    LOAN_PROCESSING_AGENT_SVC="http://localhost:8002"
    NOTIFICATION_SVC="http://localhost:8085"
    OCR_SVC="http://localhost:8000"
    echo "🧪 Deploying in LOCAL mode"
    echo "🔗 Effective workflow server url: $WF_SERVER_URL"
  fi

  configure_curl_options

  # Export variables if needed
  export DOC_MCP_SVC
  export LOAN_COMPLIANCE_SVC
  export LOAN_PROCESSING_AGENT_SVC
  export NOTIFICATION_SVC
  export OCR_SVC
}

check_previous_command_failure() {
    if [ $? -ne 0 ]; then
        printf "\nError: %s. Exiting.\n" "$1"
        exit 1
    fi
}

create_llm_profile() {
  API_URL="$WF_SERVER_URL/api/connectors/ai/llm-profiles"
  DATA='{
    "name": "llm-oci",
    "modelProvider": "OCI",
    "description": "database_dev OCI LLM models",
    "apiKey": "-----BEGIN ENCRYPTED PRIVATE KEY-----IFNAQ***IFNAQ=-----END ENCRYPTED PRIVATE KEY-----",
    "models": [
        "cohere.command-plus-latest",
        "xai.grok-3",
        "xai.grok-4",
        "meta.llama-3.1-405b-instruct",
        "meta.llama-3.3-70b-instruct",
        "openai.gpt-4o", 
        "openai.gpt-4o-mini",
        "openai.gpt-4.1",
        "openai.gpt-5",
        "openai.gpt-4o-mini"
    ],
    "ociGenAiConfig": {
      "userId":"ocid1.user.oc1...q4j5ycgvtfi2pgqrxw352rq",
      "tenantId":"ocid1.tenancy.oc1..u3zt4ha6uqms2h2ovxhcgwgmbl3dukqsjxa",
      "region": "us-chicago-1",
      "fingerprint": "bd:d3:01:2d:56:03:da:08:98:76:89:34...:78:0d",
      "passPhrase":"welcome123",
      "compartmentId": "ocid1.compartment.oc1..mirdqdbwdrtkm3ez6b7mnizq",
      "servingMode": "on-demand"
    }
  }'

  # Call API
  response=$(curl_with_common_opts -s -w "%{http_code}" -o /tmp/create_llm_profile_resp.json \
    -X POST "$API_URL" \
    -H "Content-Type: application/json" \
    -H "Accept: */*" \
    -d "$DATA")

  if [ "$response" -eq 200 ]; then
    echo "✅ LLM profile creation successful"
  else
    echo "❌ LLM profile creation failed (code: $response) for API: $API_URL"
    if [ -f /tmp/create_llm_profile_resp.json ]; then
      cat /tmp/create_llm_profile_resp.json
    else
      echo "No response file available (curl failed to create output)"
    fi
    echo "❌ Deploying loan application workflow to server failed"
    exit 1
  fi
}

create_database_profile() {
  # Declare variables
  API_URL="$WF_SERVER_URL/api/connectors/database/database-profiles"
  PROFILE_JSON='{
    "name": "oracle-database",
    "engine": "ORACLE",
    "capabilities": [
      "RELATIONAL",
      "VECTOR",
      "EMBEDDING_GENERATION"
    ],
    "username": "microtx",
    "password": "*******",
    "url": "jdbc:oracle:thin:@tcps://adb.us-ashburn-1.oraclecloud.com:1522/xyz_tpurgent.adb.oraclecloud.com",
    "description": "Oracle Database",
    "walletMetaData": {
      "walletRequired": false
    }
  }'

  # Call API with form
  response=$(curl_with_common_opts -s -w "%{http_code}" -o /tmp/create_database_profile_resp.json \
    "$API_URL" \
    --form "profile=${PROFILE_JSON}")

  if [ "$response" -eq 200 ]; then
    echo "✅ Database profile creation successful"
  else
    echo "❌ Database profile creation failed (code: $response) for API: $API_URL"
    if [ -f /tmp/create_database_profile_resp.json ]; then
      cat /tmp/create_database_profile_resp.json
    else
      echo "No response file available (curl failed to create output)"
    fi
    echo "❌ Deploying loan application workflow to server failed"
    exit 1
  fi
}

create_http_tool() {
  # Declare variables
  API_URL="$WF_SERVER_URL/api/connectors/ai/tool-configs"
  DATA='{
    "name": "custom_http",
    "description": "Custom http tool",
    "category": "API",
    "type": "HTTP",
    "url": ""
  }'

  # Call API
  response=$(curl_with_common_opts -s -w "%{http_code}" -o /tmp/create_http_tool_resp.json \
    -X POST "$API_URL" \
    -H "Content-Type: application/json" \
    -d "$DATA")

  if [ "$response" -eq 200 ]; then
    echo "✅ HTTP tool creation successful"
  else
    echo "❌ HTTP tool creation failed (code: $response) for API: $API_URL"
    if [ -f /tmp/create_http_tool_resp.json ]; then
      cat /tmp/create_http_tool_resp.json
    else
      echo "No response file available (curl failed to create output)"
    fi
    echo "❌ Deploying loan application workflow to server failed"
    exit 1
  fi
}

create_database_tool() {
  # Declare variables
  API_URL="$WF_SERVER_URL/api/connectors/ai/tool-configs"
  DATA='{
    "name": "oracle-database-tool",
    "description": "Tool to access oracle database",
    "category": "DATABASE",
    "databaseProfile": "oracle-database",
    "databaseToolConfig": {
      "allowWrite": true,
      "allowDdl": false
    }
  }'

  # Call API
  response=$(curl_with_common_opts -s -w "%{http_code}" -o /tmp/create_database_tool_resp.json \
    -X POST "$API_URL" \
    -H "Content-Type: application/json" \
    -d "$DATA")

  if [ "$response" -eq 200 ]; then
    echo "✅ Database tool creation successful"
  else
    echo "❌ Database tool creation failed (code: $response) for API: $API_URL"
    if [ -f /tmp/create_database_tool_resp.json ]; then
      cat /tmp/create_database_tool_resp.json
    else
      echo "No response file available (curl failed to create output)"
    fi
    echo "❌ Deploying loan application workflow to server failed"
    exit 1
  fi
}

create_doc_mcp_config() {
  # Declare variables
  DOC_MCP_SVC="${DOC_MCP_SVC:-"http://localhost:8010/"}"
  API_URL="$WF_SERVER_URL/api/connectors/ai/mcp-servers"
  DATA='{
    "name": "doc_mcp",
    "description": "Document verification custom MCP server",
    "transport": "SSE",
    "url": "'"$DOC_MCP_SVC"'",
    "sseEndpoint": "/sse",
    "authzType": "NONE"
  }'

  # Call API
  response=$(curl_with_common_opts -s -w "%{http_code}" -o /tmp/create_doc_mcp_config_resp.json \
    -X POST "$API_URL" \
    -H "Content-Type: application/json" \
    -d "$DATA")

  if [ "$response" -eq 200 ]; then
    echo "✅ doc_mcp config creation successful"
  else
    echo "❌ doc_mcp config creation failed (code: $response) for API: $API_URL"
    if [ -f /tmp/create_doc_mcp_config_resp.json ]; then
      cat /tmp/create_doc_mcp_config_resp.json
    else
      echo "No response file available (curl failed to create output)"
    fi
    echo "❌ Deploying loan application workflow to server failed"
    exit 1
  fi
}

create_prompt_loan_application_nl_2_json() {
  API_URL="$WF_SERVER_URL/api/metadata/ai/prompts"
  promptTemplate="Your task is to extract loan application details from the input text: \`\${loan_application_text}\`.\\n\\n**Constraints:**\\n- Your output must be only the raw JSON object, with no extra commentary, explanations, or markdown formatting.\\n- Extract the following fields: \`name\`, \`email\`, \`ssn\`, \`loanAmount\`, and \`tenure\`.\\n- If the text is not a loan application, the JSON should have a \`status\` of 'FAILED' and a \`message\` explaining why.\\n- If the text is a loan application, the \`status\` must be 'SUCCESS'. Use \`null\` for any specific field that cannot be found.\\n- \`loanAmount\` must be a number, and \`tenure\` must be an integer (in years).\\n\\n**Example Output Format:**\\n\`\`\`json\\n{\\n  \\\"status\\\": \\\"SUCCESS\\\",\\n  \\\"message\\\": null,\\n  \\\"name\\\": \\\"Jane Doe\\\",\\n  \\\"email\\\": \\\"jane.doe@example.com\\\",\\n  \\\"ssn\\\": \\\"xxx-xx-xxxx\\\",\\n  \\\"loanAmount\\\": 1000,\\n  \\\"tenure\\\": 2\\n}\\n\`\`\`"

  DATA='{
    "name": "loan_application_nl_2_json",
    "description": "Extract structured loan application details from natural language text.",
    "promptTemplate": "'"$promptTemplate"'"
  }'

  response=$(curl_with_common_opts -s -w "%{http_code}" -o /tmp/create_loan_app_prompt_resp.json \
    -X POST "$API_URL" \
    -H "Content-Type: application/json" \
    -d "$DATA")

  if [ "$response" -eq 200 ]; then
    echo "✅ loan_application_nl_2_json prompt creation successful"
  else
    echo "❌ loan_application_nl_2_json prompt creation failed (code: $response) for API: $API_URL"
    if [ -f /tmp/create_loan_app_prompt_resp.json ]; then
      cat /tmp/create_loan_app_prompt_resp.json
    else
      echo "No response file available (curl failed to create output)"
    fi
    echo "❌ Deploying loan application workflow to server failed"
    exit 1
  fi
}

create_prompt_loan_process_planner() {
  API_URL="$WF_SERVER_URL/api/metadata/ai/prompts"
  promptTemplate="You are an AI planner for a loan approval workflow. Your goal is to decide the next tool to call based on the results of previous steps. Follow the conditions below exactly.\n\n1.  **First step:** Connect to oracle database using the tool 'oracle-database-tool' and change status of Loan application with APPLICATION_ID=\${workflowId} to UNDER_REVIEW. UPDATE LOAN_APPLICATIONS SET APPLICATION_STATUS = 'UNDER_REVIEW' WHERE APPLICATION_ID = workflowId; then, if no tasks have been run, call the \`document_verification_task\`.\n2.  **After document verification:**\n    * If \`document_verification_task\` failed, the process stops. Respond with a final status of 'FAILED'.\n    * If it succeeded, call the \`compliance_agent\` and \`loan_processing_agent\` in parallel.\n 3.  **After compliance and processing:**\n  * If \`compliance_agent\` failed due to an 'AML_CHECK', call \`notify_aml_check_failure_to_admin\` and \`human_aml_verification\` in parallel.\n    * For any other failure, the process stops. Respond with a final status of 'FAILED'.\n    * If all tasks succeed, the process is complete. Respond with a final status of 'SUCCESS'.\n\n**Output Instructions:**\nYour response must only be a JSON object describing the next action. It should specify the \`status\` and a list of \`next_tools_to_call\`. If the process is finished, the list should be empty."

  DATA='{
    "name": "loan_process_planner",
    "description": "Plans the next steps in a loan approval workflow based on the outcome of previous tasks.",
    "promptTemplate": "'"$promptTemplate"'"
  }'

  response=$(curl_with_common_opts -s -w "%{http_code}" -o /tmp/create_loan_app_prompt_resp.json \
    -X POST "$API_URL" \
    -H "Content-Type: application/json" \
    -d "$DATA")

  if [ "$response" -eq 200 ]; then
    echo "✅ loan_process_planner prompt creation successful"
  else
    echo "❌ loan_process_planner prompt creation failed (code: $response) for API: $API_URL"
    if [ -f /tmp/create_loan_app_prompt_resp.json ]; then
      cat /tmp/create_loan_app_prompt_resp.json
    else
      echo "No response file available (curl failed to create output)"
    fi
    echo "❌ Deploying loan application workflow to server failed"
    exit 1
  fi
}

create_agent_profile_for_loan_document_verification_agent() {
  OCR_SVC="${OCR_SVC:-"http://localhost:8000"}/ocr"
  API_URL="$WF_SERVER_URL/api/metadata/ai/agents"
  role="Loan application documents verification agent"
  instruction="You are a loan application document verification agent. You are given a document path via the \`\${document}\` variable and a list of tools to execute the verification.\\n\\n- **Step 1: Extract Details.** Use the \`custom-http\` tool to make a GET request to this uri: '${OCR_SVC}'. Set the query parameter \`filepath\` to the value of \`\${document}\`'.\\n\\n- **Step 2: Verify Identity.** Using the \`identification_number\` and \`type\` extracted from the response of Step 1, Use tool to execute the verification.\\n- **Final Output:** Your response should only contain a JSON object and no commentary. Respond with a \`status\` of 'success' or 'failure' and include the key details returned from the verification step."

  DATA='{
    "name": "loan_document_verification_agent",
    "description": "Loan Documents Verification Agent",
    "role": "'"$role"'",
    "instruction": "'"$instruction"'",
    "tools": [
        "custom_http"
    ],
    "mcpServers": [
        "doc_mcp"
    ],
    "capabilities": [
        "WORKFLOW"
    ],
    "llmProfile": {
        "name": "llm-oci",
        "model": "openai.gpt-4o"
    },
    "promptVariables": {},
    "temperature": 0.2,
    "maxTokens": 1024,
    "top_p": 0.9,
    "top_k": 40,
    "guardrails": {},
    "memory": true,
    "maxMessages": 20,
    "maxToolCalls": 10
  }'

  response=$(curl_with_common_opts -s -w "%{http_code}" -o /tmp/create_loan_doc_verif_agent_resp.json \
    -X POST "$API_URL" \
    -H "Content-Type: application/json" \
    -d "$DATA")

  if [ "$response" -eq 200 ]; then
    echo "✅ loan_document_verification_agent profile creation successful"
  else
    echo "❌ loan_document_verification_agent profile creation failed (code: $response) for API: $API_URL"
    if [ -f /tmp/create_loan_doc_verif_agent_resp.json ]; then
      cat /tmp/create_loan_doc_verif_agent_resp.json
    else
      echo "No response file available (curl failed to create output)"
    fi
    echo "❌ Deploying loan application workflow to server failed"
    exit 1
  fi
}

create_agent_profile_for_oracle_db_agent(){
  API_URL="$WF_SERVER_URL/api/metadata/ai/agents"
  description="An agent designed to interact with an Oracle database using the 'oracle-database' connector. It can execute SQL queries to retrieve, analyze, and modify data based on user requests."
  role="You are an expert Oracle Database Assistant. Your primary function is to help users interact with the database by translating their natural language requests into valid SQL queries. You are precise, knowledgeable, and cautious, especially with data modification commands."
  instruction="Your primary task is to parse the user's request and convert it into a valid Oracle SQL query.\\n1. Analyze the user's request to understand their goal (e.g., retrieve data, describe a table, count rows).\\n2. Construct the appropriate SQL query using Oracle syntax.\\n5. Present the results from the database to the user in a clear and easy-to-understand format (e.g., a markdown table for data)."
  DATA='{
    "name": "oracle_db_agent",
    "description": "'"$description"'",
    "role": "'"$role"'",
    "instruction": "'"$instruction"'",
    "tools": [
      "custom_http"
    ],
    "mcpServers": [],
    "capabilities": [
        "WORKFLOW"
    ],
    "llmProfile": {
      "name": "llm-oci",
      "model": "openai.gpt-4o"
    },
    "promptVariables": {},
    "temperature": 0.2,
    "maxTokens": 1024,
    "top_p": 0.9,
    "top_k": 40,
    "guardrails": {},
    "memory": true,
    "maxMessages": 20,
    "maxToolCalls": 10
  }'

  response=$(curl_with_common_opts -s -w "%{http_code}" -o /tmp/create_oracle_db_agent_resp.json \
    -X POST "$API_URL" \
    -H "Content-Type: application/json" \
    -d "$DATA")

  if [ "$response" -eq 200 ]; then
    echo "✅ oracle_db_agent profile creation successful"
  else
    echo "❌ oracle_db_agent profile creation failed (code: $response) for API: $API_URL"
    if [ -f /tmp/create_oracle_db_agent_resp.json ]; then
      cat /tmp/create_oracle_db_agent_resp.json
    else
      echo "No response file available (curl failed to create output)"
    fi
    echo "❌ Deploying loan application workflow to server failed"
    exit 1
  fi
}

create_simple_task_for_loan_processing_agent(){
  API_URL="$WF_SERVER_URL/api/metadata/taskdefs"
  TASKDEF_DATA='[
    {
      "name": "Loan_Offer_Underwriter",
      "description": "Loan processing agent based on LanGraph written in Python",
      "retryCount": 3,
      "timeoutSeconds": 120,
      "inputKeys": [],
      "outputKeys": [],
      "timeoutPolicy": "TIME_OUT_WF",
      "retryLogic": "FIXED",
      "retryDelaySeconds": 5,
      "responseTimeoutSeconds": 30,
      "inputTemplate": {},
      "rateLimitPerFrequency": 0,
      "rateLimitFrequencyInSeconds": 1,
      "ownerEmail": "you@example.com",
      "backoffScaleFactor": 1,
      "totalTimeoutSeconds": 0,
      "enforceSchema": false
    }
  ]'

  response=$(curl_with_common_opts -s -w "%{http_code}" -o /tmp/create_Loan_Offer_Underwriter_resp.json \
    -X POST "$API_URL" \
    -H "Content-Type: application/json" \
    -d "$TASKDEF_DATA")

  if [ "$response" -eq 200 ]; then
    echo "✅ Loan_Offer_Underwriter definition creation successful"
  else
    echo "❌ Loan_Offer_Underwriter definition creation failed (code: $response) for API: $API_URL"
    if [ -f /tmp/create_Loan_Offer_Underwriter_resp.json ]; then
      cat /tmp/create_Loan_Offer_Underwriter_resp.json
    else
      echo "No response file available (curl failed to create output)"
    fi
    echo "❌ Deploying loan application workflow to server failed"
    exit 1
  fi
}

deploy_create_loan_app_table_workflow(){
  INPUT_FILE_PATH="./workflows/create_table_workflow.json"
  API_URL="$WF_SERVER_URL/api/metadata/workflow"

  if [ ! -f "$INPUT_FILE_PATH" ]; then
    echo "❌ Workflow input file not found: $INPUT_FILE_PATH"
    echo "❌ Deploying loan application workflow to server failed"
    exit 1
  fi

  response=$(curl_with_common_opts -s -w "%{http_code}" -o /tmp/deploy_create_loan_app_table_workflow_resp.json \
    -X POST "$API_URL" \
    -H "Content-Type: application/json" \
    -d @"$INPUT_FILE_PATH")

  if [ "$response" -eq 200 ]; then
    echo "✅ Loan application table creation workflow deployed successfully"
  else
    echo "❌ Loan application table creation workflow deployment failed (code: $response)"
    cat /tmp/deploy_create_loan_app_table_workflow_resp.json
    echo "❌ Deploying loan application workflow to server failed"
    exit 1
  fi
}

deploy_create_loan_app_workflow(){
  INPUT_FILE_PATH="./workflows/acme_bank_loan_processing_workflow_v3.json"
  API_URL="$WF_SERVER_URL/api/metadata/workflow"

  if [ ! -f "$INPUT_FILE_PATH" ]; then
    echo "❌ Workflow input file not found: $INPUT_FILE_PATH"
    echo "❌ Deploying loan application workflow to server failed"
    exit 1
  fi

  response=$(curl_with_common_opts -s -w "%{http_code}" -o /tmp/deploy_create_loan_app_workflow.json \
    -X POST "$API_URL" \
    -H "Content-Type: application/json" \
    -d @"$INPUT_FILE_PATH")

  if [ "$response" -eq 200 ]; then
    echo "✅ Loan application workflow deployed successfully"
  else
    echo "❌ Loan application workflow deployment failed (code: $response)"
    cat /tmp/deploy_create_loan_app_workflow.json
    echo "❌ Deploying loan application workflow to server failed"
    exit 1
  fi
}

cleanup() {
  echo "🧹 Cleaning up existing profiles, connectors, workflows..."

  cleanup_delete() {
    local resource_name="$1"
    local url="$2"
    local response_file
    local error_file
    local http_code
    local curl_exit

    response_file=$(mktemp /tmp/cleanup_delete_resp.XXXXXX)
    error_file=$(mktemp /tmp/cleanup_delete_err.XXXXXX)

    echo "🗑️ Deleting ${resource_name}"
    echo "   URL: ${url}"

    http_code=$(curl_with_common_opts -sS --fail-with-body -w "%{http_code}" -o "$response_file" \
      -X DELETE "$url" 2>"$error_file")
    curl_exit=$?

    echo "   HTTP code: ${http_code:-N/A}"

    if [ -s "$response_file" ]; then
      echo "   Response:"
      cat "$response_file"
      printf "\n"
    else
      echo "   Response: <empty>"
    fi

    if [ "$curl_exit" -ne 0 ]; then
      echo "❌ Cleanup failed for ${resource_name} (curl_exit: ${curl_exit}, http_code: ${http_code})"
      if [ -s "$error_file" ]; then
        echo "   curl stderr:"
        cat "$error_file"
      fi
    else
      echo "✅ Cleanup request completed for ${resource_name}"
    fi

    rm -f "$response_file" "$error_file"
  }

  # Delete workflows first (dependencies)
  cleanup_delete "workflow acme_bank_loan_processing_workflow_v3" "$WF_SERVER_URL/api/metadata/workflow/acme_bank_loan_processing_workflow_v3/1"
  cleanup_delete "workflow Create_Table_For_Loan_Application" "$WF_SERVER_URL/api/metadata/workflow/Create_Table_For_Loan_Application/1"

  # Delete task definitions
  cleanup_delete "task definition Loan_Offer_Underwriter" "$WF_SERVER_URL/api/metadata/taskdefs/Loan_Offer_Underwriter"

  # Delete agents
  cleanup_delete "agent loan_document_verification_agent" "$WF_SERVER_URL/api/metadata/ai/agents/loan_document_verification_agent"
  cleanup_delete "agent oracle_db_agent" "$WF_SERVER_URL/api/metadata/ai/agents/oracle_db_agent"

  # Delete prompts
  cleanup_delete "prompt loan_application_nl_2_json" "$WF_SERVER_URL/api/metadata/ai/prompts/loan_application_nl_2_json"
  cleanup_delete "prompt loan_process_planner" "$WF_SERVER_URL/api/metadata/ai/prompts/loan_process_planner"

  # Delete MCP servers
  cleanup_delete "MCP server doc_mcp" "$WF_SERVER_URL/api/connectors/ai/mcp-servers/doc_mcp"

  # Delete tools
  cleanup_delete "tool custom_http" "$WF_SERVER_URL/api/connectors/ai/tool-configs/custom_http"
  cleanup_delete "tool oracle-database-tool" "$WF_SERVER_URL/api/connectors/ai/tool-configs/oracle-database-tool"

  # Delete profiles
  cleanup_delete "database profile oracle-database" "$WF_SERVER_URL/api/connectors/database/database-profiles/oracle-database"
  cleanup_delete "LLM profile llm-oci" "$WF_SERVER_URL/api/connectors/ai/llm-profiles/llm-oci"

  echo "✅ Cleanup completed"
}

start() {
  handle_deployment_type
  echo "Do you want to cleanup all the profiles, connectors, workflows and redeploy the workflow ?"
  echo "Warning: This will clear all the data related to loan application and reset to default data. If you are running this first time, ignore this warning."
  select yn in "Yes" "No"; do
      case $yn in
          Yes ) cleanup; break;;
          No ) break;;
      esac
  done

  create_llm_profile
  create_database_profile
  create_http_tool
  create_database_tool
  create_doc_mcp_config
  create_prompt_loan_application_nl_2_json
  create_prompt_loan_process_planner

  create_agent_profile_for_loan_document_verification_agent
  create_agent_profile_for_oracle_db_agent
  create_simple_task_for_loan_processing_agent
  deploy_create_loan_app_table_workflow
  deploy_create_loan_app_workflow
}

# Start of script execution
start
