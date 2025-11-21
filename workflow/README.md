# About MicroTx Workflows

Oracle Transaction Manager for Microservices - Workflows for Agentic AI (MicroTx Workflows) is an orchestration engine designed specifically for building and managing microservices applications.

Evolving from Netflix Conductor (an open-source workflow engine), MicroTx Workflows offers developers a powerful foundation featuring no-code workflow modeling, durable execution, and comprehensive APIs for modeling, managing, and monitoring workflows. Its architecture provides built-in reliability, availability, and scalability, making it well-suited for enterprise-scale scenarios.

What sets MicroTx Workflows apart is its integration of GenAI and agentic AI system features that elevate traditional workflow automation. Agentic AI systems are characterized by autonomy, goal-oriented behavior, decision making, planning, learning, adaptation, and support for collaboration across multiple agents. These capabilities allow MicroTx Workflows to not only automate processes but also to dynamically reason, plan, and execute tasks to meet complex business goals. For example, in a loan application approval process, MicroTx Workflows can autonomously gather relevant documents, assess eligibility criteria using AI, request additional information, and escalate cases for manual review when necessary—all within a single, adaptable flow. Similarly, for support escalation management, MicroTx Workflows can intelligently route tickets, recommend solutions using Generative AI, involve multiple support agents, and track outcomes to optimize future responses.

AI and agentic flow enhancements in MicroTx Workflows let developers integrate intelligent and reusable AI functions without the need to write complex glue code.

With components such as the Agentic Planner, GenAI tasks, agent-based execution, and memory support, MicroTx Workflows can dynamically adapt to new information and user input. Integration with external systems is simplified through the Model Context Protocol (MCP), and you can easily connect to external agents using HTTP or system tasks.

Altogether, MicroTx Workflows empowers developers to build smarter, adaptable workflows that go beyond automation—enabling true agentic behavior and the seamless integration of AI. This means organizations can rapidly develop intelligent business processes that adjust to real-world complexity, improve operational efficiency, and deliver better outcomes for users.

## Register or Import Workflows in MicroTx Workflow Server

Use this guide to register or import any workflow JSON from the samples in this repository into the MicroTx Workflow server.

### Steps

1. Open the navigation menu and click Definitions.
2. Click the Workflows tab.
3. The Workflows list page opens. All the workflows that you have defined are displayed in a table.
4. Click + to create a new workflow.
5. The Workflow Builder is displayed.
   - Right pane: the Workflow tab displays all the details of the workflow.
   - Left pane: the components of the workflow are depicted visually.
6. You can either build a workflow using the Workflow Builder or import an existing workflow using JSON.
7. To import a workflow using JSON:
   - Click the JSON tab on the right pane.
   - Copy and paste the contents of the workflow JSON file from this repository.
   - The diagram is generated automatically. Clicking any task in the diagram displays its details.

### References
- Create a workflow using the Workflow Builder:
  https://docs-uat.us.oracle.com/en/database/oracle/transaction-manager-for-microservices/25.3/aiwfg/create-workflow-using-worflow-builder.html
- Define a workflow using JSON:
  https://docs-uat.us.oracle.com/en/database/oracle/transaction-manager-for-microservices/25.3/aiwfg/define-workflow-using-json.html

## Where to find sample workflow JSON files in this repo
- Getting started
  - [getting-started/sample-workflow.json](./getting-started/sample-workflow.json)
- Payment processing using XA transaction
  - [payment-processing-using-xa-transaction/xa-transaction-wf.json](./payment-processing-using-xa-transaction/xa-transaction-wf.json)
  - [payment-processing-using-xa-transaction/xa-failure-wf.json](./payment-processing-using-xa-transaction/xa-failure-wf.json)
- Order processing using Saga
  - [order-processing-saga/workflows/order_processing_saga_workflow.json](./order-processing-saga/workflows/order_processing_saga_workflow.json)
  - [order-processing-saga/workflows/order_processing_compensation_workflow.json](./order-processing-saga/workflows/order_processing_compensation_workflow.json)
  - Postman mocks: [order-processing-saga/postman/Order Processing Saga.postman_collection.json](./order-processing-saga/postman/Order%20Processing%20Saga.postman_collection.json)
- Loan application
  - [loan-application/workflows/create_table_workflow.json](./loan-application/workflows/create_table_workflow.json)
  - [loan-application/workflows/acme_bank_loan_processing_workflow_v3.json](./loan-application/workflows/acme_bank_loan_processing_workflow_v3.json)
- RAG ingestion and retrieval (Medical QA)
  - [RAG-ingestion-retrieval-workflows/ingestion-wf.json](./RAG-ingestion-retrieval-workflows/ingestion-wf.json)
  - [RAG-ingestion-retrieval-workflows/retrieve-wf.json](./RAG-ingestion-retrieval-workflows/retrieve-wf.json)
