#!/bin/bash

# Global variable to control deployment type: "cluster" (default) or "local"
DEPLOYMENT_TYPE="cluster"

# Function to set service endpoints based on deployment type
handle_deployment_type() {
  if [[ "$DEPLOYMENT_TYPE" == "cluster" ]]; then
    WF_SERVER_URL="$istio_url/workflow-server"
    DOC_MCP_SVC="http://doc-process-mcp-server:8000"
    LOAN_COMPLIANCE_SVC="http://loan-compliance-service:8001"
    LOAN_PROCESSING_AGENT_SVC="http://loan-processing-agent:8002"
    NOTIFICATION_SVC="http://notification-service:8085"
    OCR_SVC="http://ocr-service:8000"
  else
    WF_SERVER_URL="http://localhost:9010/workflow-server"
    DOC_MCP_SVC="http://localhost:8010"
    LOAN_COMPLIANCE_SVC="http://localhost:8001"
    LOAN_PROCESSING_AGENT_SVC="http://localhost:8002"
    NOTIFICATION_SVC="http://localhost:8085"
    OCR_SVC="http://localhost:8000"
  fi

  # Export variables if needed
  export DOC_MCP_SVC
  export LOAN_COMPLIANCE_SVC
  export LOAN_PROCESSING_AGENT_SVC
  export NOTIFICATION_SVC
  export OCR_SVC
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
  response=$(curl -s -w "%{http_code}" -o /tmp/create_llm_profile_resp.json \
    -L \
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
  response=$(curl -s -w "%{http_code}" -o /tmp/create_database_profile_resp.json \
    -L "$API_URL" \
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
    "type": "HTTP"
  }'

  # Call API
  response=$(curl -s -w "%{http_code}" -o /tmp/create_http_tool_resp.json \
    -L \
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
    "url": "",
    "apiKey": "",
    "databaseProfile": "oracle-database"
  }'

  # Call API
  response=$(curl -s -w "%{http_code}" -o /tmp/create_database_tool_resp.json \
    -L \
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
  response=$(curl -s -w "%{http_code}" -o /tmp/create_doc_mcp_config_resp.json \
    -L \
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

  response=$(curl -s -w "%{http_code}" -o /tmp/create_loan_app_prompt_resp.json \
    -L \
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

  response=$(curl -s -w "%{http_code}" -o /tmp/create_loan_app_prompt_resp.json \
    -L \
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
    "llmProfile": {
        "name": "llm-oci",
        "model": "openai.gpt-4o"
    },
    "memory": true,
    "maxMessages": 20,
    "maxToolCalls": 10
  }'

  response=$(curl -s -w "%{http_code}" -o /tmp/create_loan_doc_verif_agent_resp.json \
    -L \
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
    "llmProfile": {
      "name": "llm-oci",
      "model": "openai.gpt-4o"
    },
    "memory": true,
    "maxMessages": 20,
    "maxToolCalls": 10
  }'

  response=$(curl -s -w "%{http_code}" -o /tmp/create_oracle_db_agent_resp.json \
    -L \
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

create_simple_tas_for_loan_processing_agent(){
  API_URL="$WF_SERVER_URL/api/metadata/taskdefs"
  TASKDEF_DATA='[
    {
      "name": "loan_processing_agent_task",
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

  response=$(curl -s -w "%{http_code}" -o /tmp/create_loan_processing_agent_task_resp.json \
    -L \
    -X POST "$API_URL" \
    -H "Content-Type: application/json" \
    -d "$TASKDEF_DATA")

  if [ "$response" -eq 200 ]; then
    echo "✅ loan_processing_agent_task definition creation successful"
  else
    echo "❌ loan_processing_agent_task definition creation failed (code: $response) for API: $API_URL"
    if [ -f /tmp/create_loan_processing_agent_task_resp.json ]; then
      cat /tmp/create_loan_processing_agent_task_resp.json
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

  response=$(curl -s -w "%{http_code}" -o /tmp/deploy_create_loan_app_table_workflow_resp.json \
    -L \
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

  response=$(curl -s -w "%{http_code}" -o /tmp/deploy_create_loan_app_workflow.json \
    -L \
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

  # Delete workflows first (dependencies)
  curl -s -X DELETE "$WF_SERVER_URL/api/metadata/workflow/acme_bank_loan_processing_workflow_v3/1" || true
  curl -s -X DELETE "$WF_SERVER_URL/api/metadata/workflow/Create_Table_For_Loan_Application/1" || true

  # Delete task definitions
  curl -s -X DELETE "$WF_SERVER_URL/api/metadata/taskdefs/loan_processing_agent_task" || true

  # Delete agents
  curl -s -X DELETE "$WF_SERVER_URL/api/metadata/ai/agents/loan_document_verification_agent" || true
  curl -s -X DELETE "$WF_SERVER_URL/api/metadata/ai/agents/oracle_db_agent" || true

  # Delete prompts
  curl -s -X DELETE "$WF_SERVER_URL/api/metadata/ai/prompts/loan_application_nl_2_json" || true
  curl -s -X DELETE "$WF_SERVER_URL/api/metadata/ai/prompts/loan_process_planner" || true

  # Delete MCP servers
  curl -s -X DELETE "$WF_SERVER_URL/api/connectors/ai/mcp-servers/doc_mcp" || true

  # Delete tools
  curl -s -X DELETE "$WF_SERVER_URL/api/connectors/ai/tool-configs/custom_http" || true
  curl -s -X DELETE "$WF_SERVER_URL/api/connectors/ai/tool-configs/oracle-database-tool" || true

  # Delete profiles
  curl -s -X DELETE "$WF_SERVER_URL/api/connectors/database/database-profiles/oracle-database" || true
  curl -s -X DELETE "$WF_SERVER_URL/api/connectors/ai/llm-profiles/llm-oci" || true

  echo "✅ Cleanup completed"
}

start() {
  handle_deployment_type
  echo "Do you want to cleanup all the profiles, connectors, workflows and redeploy the workflow ? Warning: this will clear all the data related to loan application and reset to default data."
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
  create_simple_tas_for_loan_processing_agent
  deploy_create_loan_app_table_workflow
  deploy_create_loan_app_workflow
}

# Start of script execution
start