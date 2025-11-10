# On-Premise OCR Microservice

A self-contained, production-ready OCR microservice that extracts and parses structured data from images, such as US Driver's Licenses and ID cards. This project is built using [FastAPI](https://fastapi.tiangolo.com/) for the REST API and [EasyOCR](https://github.com/JaidedAI/EasyOCR) as the OCR engine. It provides robust, on-premise document processing — no cloud required.

## Requirements

- Python 3.8+
- All packages listed in [requirements.txt](./requirements.txt)

## Setup

1. **Clone the repository**
   ```bash
   cd ocr-microservice
   ```

2. **Create a virtual environment (recommended)**
   ```bash
   python3 -m venv venv
   ```
   - Activate on Mac/Linux:
     ```bash
     source venv/bin/activate
     ```
   - Activate on Windows:
     ```bash
     venv\Scripts\activate
     ```

3. **Install dependencies**
   ```bash
   pip install -r requirements.txt
   ```

## Running the Service

### Run via Docker

1. **Build the Docker image**
   ```bash
   ./build.sh
   ```

2. **Run the container** (with local directory mounted for file access):
   ```bash
   docker run --rm -p 8000:8000 -v $(pwd)/your_local_images:/app/mounted_images ocr-microservice:latest
   ```
   Replace `your_local_images` with the path to your local directory containing images or PDFs you want to process. 
   In API requests, use file paths like `/app/mounted_images/your_image.jpg`.

   The service will be available at [http://localhost:8000](http://localhost:8000)

---

**Alternatively, run with Uvicorn directly for local development:**

```bash
uvicorn main:app --reload

```
The service will be available at [http://localhost:8000](http://localhost:8000)

## API Endpoints

### Health Check

- **GET /**  
  Returns status message.

**Example Request:**
  ```
  curl http://localhost:8000/
  ```
  **Response:**
  ```json
  {
    "status": "ok",
    "message": "OCR Microservice is running!"
  }
  ```

### Perform OCR

- **GET /ocr**
  - **Query Parameter:** `filepath` (string, required) — Path to the image or PDF file accessible on disk

  **Example Request:**
  ```
  curl http://localhost:8000/ocr?filepath=/absolute/path/to/image.jpg
  ```

  *** on mounted volumes ***
  ```
  curl http://localhost:8000/ocr?filepath=/app/mounted_images/driving-license.png
  ```

  **Response:**
  ```json
  {
    "status": "success",
    "extracted_data": {
      "dl_number": "D12345678",
      "last_name": "DOE",
      "first_name": "JOHN",
      "dob": "01/01/1970",
      "exp_date": "01/01/2030",
      "sex": "M",
      "height": "5'9\"",
      "eyes": "BLU",
      "issue_date": "01/01/2025",
      "address": "123 MAIN ST ANYTOWN, CA 12345"
    }
  }
  ```

  Any field not found in the image appears as `null`.

  **Possible Errors:**
  - `404 File Not Found` — When the provided `filepath` does not exist
  - `400 Invalid Input` — When the input is not supported or invalid
  - `500 Internal Server Error` — For unexpected exceptions

## File Access Notes

- The `filepath` must be accessible to the server process, with correct permissions.
- Network file locations/mounted drives may require additional configuration.

## ⚠️ Notes on Hardware Acceleration & Torch/EasyOCR Warnings

- If you see messages like `Neither CUDA nor MPS are available - defaulting to CPU.`, `Could not initialize NNPACK! Reason: Unsupported hardware.`, or warnings about 'pin_memory', these are **not errors**. Your container is running in CPU mode, which is fully supported by EasyOCR and torch.
- These warnings appear in most Docker CPU-only installations and can be ignored. The service will work, just potentially at lower speed than with GPU or specific acceleration libraries.

## Project Structure

```
main.py                 # FastAPI application entrypoint
api/ocr_endpoint.py     # Route definitions for OCR API
models/ocr_models.py    # Pydantic models for validation and response
services/ocr_service.py # EasyOCR logic & field parsing
requirements.txt        # Python dependencies
```
