# api/ocr_endpoint.py
import logging
from fastapi import APIRouter, HTTPException, Query
from models.ocr_models import OcrResponse, ExtractedData
from services.ocr_service import perform_ocr

# Create a router instance, not the main app
router = APIRouter()
logger = logging.getLogger(__name__)

@router.get("/ocr", response_model=OcrResponse)
async def process_image_for_ocr(filepath: str = Query(..., description="Path of the image to process with OCR")):
    """
    Accepts a filepath as a query parameter, performs OCR, and returns the extracted text.
    """
    try:
        extracted_dict = perform_ocr(filepath)
        data_model = ExtractedData(**extracted_dict)
        return OcrResponse(status="success", extracted_data=data_model)

    except FileNotFoundError as e:
        logger.error(f"File not found error: {e}")
        raise HTTPException(status_code=404, detail=str(e))

    except ValueError as e:
        logger.error(f"Invalid input error: {e}")
        raise HTTPException(status_code=400, detail=str(e))

    except Exception as e:
        logger.critical(f"Internal server error during OCR: {e}")
        raise HTTPException(status_code=500, detail=f"An internal error occurred: {e}")
