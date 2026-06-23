# AGENTS.md

## Project Overview

This repository contains Oracle Transaction Manager for Microservices (MicroTx) sample applications and MicroTx Workflow samples. It demonstrates XA, LRA, TCC, and workflow-based agentic/AI examples.

Main areas:

- `xa/`: XA banking/transfer samples, mostly Java services plus Node.js samples, SQL, Docker Compose, and Helm charts.
- `tcc/`: TCC travel booking samples in Java, Node.js/TypeScript, and Python, with Docker Compose and Helm charts.
- `lra/`: LRA trip/cinema booking samples, mostly Java and some Node.js.
- `workflow/`: MicroTx Workflow JSON definitions and services for loan application, RAG, geofencing, invoice, getting started, XA payment, and saga.
- `.agents/skills/`: repo-local agent skills. `microtx-workflows` contains workflow-server operating instructions plus reference docs/OpenAPI.
- `docs/quickstart/`: Minikube and OKE quick-start documentation.
- `helmcharts/`: shared/minikube Helm values.

Main technologies: Java/Maven, Spring Boot, Helidon/MicroProfile, Node.js/TypeScript/Express, Python Flask/FastAPI/Streamlit, shell, Docker, Docker Compose, Helm, SQL/PLSQL, and MicroTx Workflow JSON.

## Setup Commands

There is no verified repo-wide dependency installation command. Install deps in the sample directory you are changing.

For Node.js/TypeScript samples with `package.json`:

```sh
cd <sample-dir>
npm install
```

For Python samples with `requirements.txt`:

```sh
cd <sample-dir>
python3 -m venv .venv
. .venv/bin/activate
pip install -r requirements.txt
```

For Java/Maven samples:

```sh
cd <sample-dir>
mvn clean package
```

Some workflow loan-application services include Maven wrappers:

```sh
cd workflow/loan-application/doc-process-mcp-server
./mvnw clean package
```

Cluster docs list Docker or Podman, `kubectl`, `helm`, `istioctl`, and optionally `minikube`; see `docs/quickstart/prerequisites.md`.

## Build, Test, Lint, and Format Commands

No repo-wide build, test, lint, or format command was found. Prefer the nearest `README.md`, `package.json`, `pom.xml`, `requirements.txt`, or service script.

Node.js/TypeScript samples expose these scripts:

```sh
npm run tsc
npm run dev
npm run prod
```

Java samples commonly document:

```sh
mvn clean package
```

Loan application Spring Boot services provide wrappers and image scripts:

```sh
cd workflow/loan-application/doc-process-mcp-server
./mvnw clean package
./mvnw test
./build.sh
```

```sh
cd workflow/loan-application/loan-compliance-service
./mvnw clean package
./mvnw test
./build.sh
```

Loan application image archive build:

```sh
cd workflow/loan-application
./build_loan_app_images.sh
./build_loan_app_images.sh -s ocr-microservice
```

Python samples do not have a verified repo-wide test runner. One visible local example is:

```sh
cd workflow/loan-application/loan-processing-agent
python3 test.py
```

No ESLint, Prettier, Ruff, Black, Checkstyle, Spotless, or pre-commit config was found at inspected depths. Do not invent lint or format commands.

## Code Style and Conventions

- Follow the style already present in the touched sample rather than applying a repo-wide style.
- Java samples use Maven layouts under `src/main/java`, `src/main/resources`, and sometimes `src/test/java`. Spring Boot often targets Java 17; some Helidon/MicroProfile samples target Java 11.
- Java package names vary by sample, including `com.oracle...`, `com.example...`, and `io.helidon...`; keep new code in the existing package structure.
- TypeScript samples compile to `build/`, use CommonJS, `strict: true`, `esModuleInterop: true`, and `experimentalDecorators: true` in `tsconfig.json`.
- Workflow definitions are JSON files under `workflow/**`; preserve schema, task names, connector names, and sample-specific IDs unless changing them.
- For MicroTx Workflow Server tasks, read `.agents/skills/microtx-workflows/SKILL.md`; consult its `references/` files for exact workflow, connector, agentic AI, task-type, and REST API details.
- Build outputs such as `target/`, `build/`, `dist/`, virtualenvs, IDE files, and Python caches are ignored by `.gitignore`; do not commit them.
- Some prebuilt JARs and image/data assets are tracked intentionally; do not replace them unless required.

## Agent Workflow Rules

- Make minimal, focused changes scoped to the sample or docs being requested.
- Prefer existing patterns, scripts, and directory conventions over new abstractions.
- Run the narrowest relevant validation first, then broader documented checks when practical.
- Do not modify generated files, lockfiles, vendored dependencies, prebuilt artifacts, or snapshots unless required.
- Do not add new dependencies without clear justification and without updating the appropriate local package file.
- Preserve public APIs, REST routes, workflow names, JSON contracts, image names, Helm values, and sample behavior unless asked to change them.
- When changing docs or sample commands, verify paths against the repo layout.
- Keep `.agents/skills/**` changes focused: update skill instructions and references together when API behavior or workflow-server guidance changes.

## Safety and Repository Hygiene

- Do not commit secrets, tokens, private keys, database passwords, OCI config, wallets, kubeconfigs, or local-only config.
- Be careful around scripts/config that demonstrate connector, database, OCI, or LLM profile setup; keep placeholders and never add real credentials.
- Do not rewrite git history or force push.
- Do not run destructive commands such as `rm -rf`, database resets, namespace deletion, Helm uninstall, `minikube delete`, or force pushes unless requested.
- Treat scripts that call `kubectl`, `helm`, `istioctl`, `minikube`, Docker, Podman, or workflow-server APIs as environment-changing. Confirm intent before running them.

## PR / Finish Checklist

Before finishing, confirm:

- Changed files are relevant to the requested sample or documentation.
- Formatting/linting was run where a verified command exists, or the limitation
  is documented.
- Tests or build commands run are listed in the final response.
- Skipped checks, missing tooling, external service requirements, or assumptions
  are documented.
- No secrets, local paths, generated outputs, or unrelated lockfile changes were
  introduced.
