# Medical QA — Retrieval Augmented Generation (RAG) over patient records

## What this sample is
A two-workflow sample that:
- Ingests a local document into a vector store using an embedding model.
- Answers natural-language questions by retrieving relevant chunks and using an LLM to generate an answer.

This folder includes a small Synthea-like dataset and a helper script to build a single file of patient records.

## What's in this folder
- `ingestion-wf.json` — Ingestion workflow (`ingest_data`) that chunks, embeds, and stores vectors in `test_vectors`
- `retrieve-wf.json` — Query workflow (`medical_history_qa`) that performs retrieve-and-generate
- `data/` — Sample data
  - `patients.csv`, `conditions.csv`, `observations.csv` — Source CSVs
  - `patient_records.json` — Generated record bundle (default `filePath` for ingestion)
- `script/transform_data.py` — Helper to transform CSVs into `patient_records.json`

## Business problem
Clinical data is largely unstructured across multiple sources (EHR notes, lab results, histories). Clinicians and analysts need to ask targeted questions and get evidence-grounded answers. RAG enables grounded Q&A over local data by retrieving semantically relevant document chunks and synthesizing a concise answer with an LLM.

## How it works (high level)
1. Ingest data to vectors (ingestion workflow: `ingest_data`)
   - Configuration (from `ingestion-wf.json`):
     - `embeddingModelProfile`: `oci_models` with `model: cohere.embed-multilingual-image-v3.0`
     - `dataStoreProfile`: `oracle-atp`
     - `tableName`: `test_vectors`
     - `data.source`: `local`
     - `data.filePath`: `data/patient_records.json`
     - Chunking: `chunkSize: 512`, `minChunkSizeChars: 80`, `minChunkLengthToEmbed: 5`, `maxNumChunks: 10000`
     - Index: `HNSW`, `distanceType: COSINE`
     - `dimensions: 512` (must match the embedding model)
   - Effect: Reads local file, chunks text, creates embeddings, and upserts into `test_vectors`.

2. Ask questions (RAG query workflow: `medical_history_qa`)
   - Configuration (from `retrieve-wf.json`):
     - `llmProfile`: `oci_models` with `model: openai.gpt-4.1`
     - `embeddingModelProfile`: `oci_models` with `model: cohere.embed-multilingual-image-v3.0`
     - `dataStoreProfile`: `oracle-atp`, `tableName: test_vectors`
     - Retrieval: `topK: 5`, `ragType: naive`, `indexType: HNSW`, `distanceType: COSINE`, `dimensions: "512"`
     - Generation: `temperature: 0.8`, `maxTokens: 1024`, `top_k: 40`
   - Effect: Embeds the query, retrieves nearest chunks from `test_vectors`, and has the LLM synthesize an answer.

## Inputs and outputs
- Ingestion (`ingest_data`)
  - Inputs: none
  - Outputs: N/A (populates `test_vectors` in `oracle-atp`)
  - Example start payload:
```json
{}
```

- RAG query (`medical_history_qa`)
  - Inputs:
    - `query` — natural-language question
  - Outputs:
    - `answer` — string (mapped from `query_rag_task.output.response`)
  - Example start payload:
```json
{
  "query": "Summarize current renal function for patient XYZ"
}
```

## Prerequisites
- Data store profile `oracle-atp` configured in your workflow runtime:
  - Network connectivity and credentials to your Oracle Autonomous Database (or compatible vector store).
  - A vectors table named `test_vectors` (the ingestion may create or upsert depending on your connector capabilities).
- GenAI provider profiles configured as referenced in both workflows:
  - `oci_models` profile pointing to:
    - Embeddings: `cohere.embed-multilingual-image-v3.0` (512 dims)
    - LLM: `openai.gpt-4.1`
  - If you use different providers/models, update `ingestion-wf.json` and `retrieve-wf.json` accordingly (including `dimensions` and `tableName` compatibility).
- Register both workflows in your workflow engine.

## Using the included sample data
1. Generate `patient_records.json` from CSVs (optional if it already exists)
   - From repo root:
```bash
cd workflow/medicalQA-RAGagent
python3 script/transform_data.py
```
   - This script reads `data/patients.csv`, `data/conditions.csv`, and `data/observations.csv`, and produces `data/patient_records.json`.
   - Note: The output file name is `patient_records.json`. Ensure the ingestion workflow `data.filePath` matches this name and path (`data/patient_records.json`).

2. Run the ingestion workflow
   - Start `ingest_data` with empty input `{}`.
   - Verify vectors are stored in your `test_vectors` table within `oracle-atp`.

3. Ask a question via the RAG workflow
   - Start `medical_history_qa` with a payload like:
```json
{
  "query": "What cardiovascular risk factors are present for patient <PatientIdOrName>?"
}
```
   - The workflow returns `answer` containing the synthesized response.

## Bring Your Own Document (BYO doc)
To replace the sample content with your own document and run end-to-end ingestion + RAG:

1. Place your document under this folder's `data/` directory
   - Examples:
     - `data/my_notes.txt` — plain text
     - `data/my_records.jsonl` — newline-delimited JSON with a `text` field per line
     - `data/my_records.json` — JSON array of objects with a `text` field
   - If your source is PDF/Word, convert to text first (e.g., to `.txt` or `.jsonl` with `text` fields).

2. Point the ingestion workflow to your file
   - Edit `ingestion-wf.json`:
     - Set `"filePath": "data/my_notes.txt"` (or your filename under `data/`)
     - Ensure `dimensions` matches your chosen embedding model.
     - Optionally adjust `chunkSize`, `minChunkSizeChars`, `minChunkLengthToEmbed`, and `maxNumChunks`.

3. Re-register or update the ingestion workflow in your engine if required.

4. Run ingestion
   - Start `ingest_data` with:
```json
{}
```
   - Confirm vectors are written to `test_vectors`.

5. Run the RAG workflow on your data
   - Start `medical_history_qa` with:
```json
{
  "query": "Your question about your document contents"
}
```

6. Optional: Use the provided script for structured data
   - If you have structured CSVs similar to Synthea, adapt `script/transform_data.py` to produce a single consolidated text file (one patient/profile per record) and set that as `filePath`.

Notes:
- The ingestion connector typically accepts plain text or JSON (JSONL preferred at scale). If using JSON/JSONL, provide a `text` field per record. If your runtime expects a specific schema, align to that schema.
- Keep the `tableName` stable (default `test_vectors`), or update both workflows if you change it.

## Example queries and sample responses
1. Why is this patient Donnell534 Dicki44 at risk for cardiovascular complications?
Ans: Donnell534 Dicki44 is at risk for cardiovascular complications due to several factors: history of myocardial infarction and acute non-ST segment elevation myocardial infarction; history of coronary artery bypass grafting; elevated cholesterol and LDL levels (e.g., cholesterol 314.5 mg/dL, LDL 259.8 mg/dL); obesity (previous BMI in the obese range; recent BMI 28.0 kg/m2, still overweight); prediabetes; essential hypertension; ex-smoker status; age (born 1955); and periods of social isolation. These risk factors increase the likelihood of further cardiovascular events and complications.

2. Summarize the current health conditions and diagnostics of patient Ezequiel972 Hyatt152
Ans:
- Mildly depressed mood: Most recent PHQ-2 score is 1.0, indicating minimal depressive symptoms.
- Chronic kidney disease stage 2: Estimated glomerular filtration rate (eGFR) is 71 mL/min; creatinine is elevated at 2.8 mg/dL.
- Slightly low fasting glucose: Latest blood glucose is 68.1 mg/dL.
- Mildly elevated urea nitrogen: 18.4 mg/dL.
- Electrolytes: Sodium is mildly elevated (143 mmol/L), potassium is normal (3.8 mmol/L), chloride is normal (103.4 mmol/L), and bicarbonate is normal (26.4 mmol/L).
- Liver function: All parameters (AST, ALT, alkaline phosphatase, bilirubin, albumin, globulin, total protein) are within normal limits.
- Lipids: Cholesterol (185.7 mg/dL), LDL (113.2 mg/dL), HDL (53.4 mg/dL), and triglycerides (167.5 mg/dL) are in acceptable ranges.
- No evidence of tobacco use.
- Reports not feeling physically and emotionally safe at current residence.
- Mild recent pain (score 2/10).
- BMI is in the overweight to obese range in previous records.
- Vital signs generally within normal limits in recent measurements.

Summary: Patient is experiencing mild depressive symptoms, stage 2 chronic kidney disease, mild hypernatremia, and mild dyslipidemia, with no evidence of acute liver dysfunction or diabetes. Social concerns include not feeling safe at home.

3. Suggest a preventive healthcare plan for patient Ezequiel972 Hyatt152
Ans: Preventive Healthcare Plan for Ezequiel972 Hyatt152:
1. Regular check-ups: Annual physical exams, including blood pressure, cholesterol, kidney function, and diabetes screening (glucose, HbA1c).
2. Cardiovascular health: Monitor blood pressure; maintain cholesterol and triglycerides within recommended ranges; aim for a healthy weight (target BMI <25 if possible).
3. Kidney health: Monitor creatinine and GFR regularly given elevated creatinine (2.8 mg/dL) and decreased GFR (71 mL/min); consider nephrology referral; ensure hydration and avoid nephrotoxic medications when possible.
4. Mental health: Continue PHQ-2 screening at least annually or as indicated; encourage social support and engagement.
5. Lifestyle: Avoid tobacco use; moderate alcohol intake; engage in regular physical activity (≥150 minutes/week of moderate intensity); maintain a balanced diet rich in fruits, vegetables, whole grains, and low in saturated fats and sugars.
6. Safety and social well-being: Assess home/personal safety and address emotional safety or stress concerns; maintain social connections and manage stress effectively.
7. Immunizations: Stay up to date with age-appropriate vaccines including influenza, Tdap, and COVID-19.
8. Other screenings: Age/sex-appropriate cancer screenings (e.g., colonoscopy, prostate); annual vision and dental checks.
9. Medication review: Review all medications with a healthcare provider, especially considering kidney function.
10. Follow-up: Schedule follow-ups to monitor labs (especially kidney function and lipids) and reassess overall health status. Seek medical attention promptly if symptoms change or new concerns arise.

## Files reference
- `ingestion-wf.json`:
  - `name: ingest_data`, `type: GENAI_INGESTION`
  - Embeddings: `cohere.embed-multilingual-image-v3.0` (dims 512)
  - Data source: `local` file at `data.filePath`
  - Vector store: `oracle-atp`, table `test_vectors`, index `HNSW` (COSINE)
- `retrieve-wf.json`:
  - `name: medical_history_qa`, `type: GENAI_RETRIEVE`
  - LLM: `openai.gpt-4.1`, Embeddings: same as ingestion
  - Inputs: `query`
  - Output: `answer` mapped from `query_rag_task.output.response`

## Notes
- Ensure `dimensions` matches your embedding model; mismatches will cause retrieval issues.
- If you change `tableName`, update it in both workflows.
- This sample is illustrative and not a substitute for clinical judgment or compliance workflows. De-identify PHI when required and follow applicable regulations.
