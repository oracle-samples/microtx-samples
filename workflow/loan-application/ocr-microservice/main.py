# main.py
from fastapi import FastAPI
from api import ocr_endpoint
import uvicorn

app = FastAPI(
    title="On-Premise OCR Microservice",
    description="A self-contained microservice to extract text from images and PDFs using Tesseract.",
    version="1.0.0"
)

# Include the OCR API router
app.include_router(ocr_endpoint.router, tags=["OCR"])

@app.get("/", tags=["Health Check"])
async def read_root():
    """A simple health check endpoint."""
    return {"status": "ok", "message": "OCR Microservice is running!"}

if __name__ == "__main__":
    # To run the app: uvicorn main:app --reload
    uvicorn.run(app, host="0.0.0.0", port=8000)