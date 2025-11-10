# models/ocr_models.py
from pydantic import BaseModel
from typing import Optional

class OcrRequest(BaseModel):
    """Defines the structure for the OCR request payload."""
    image_path: str


class ExtractedData(BaseModel):
    """Defines the structure for the structured data from the ID card."""
    dl_number: Optional[str] = None
    last_name: Optional[str] = None
    first_name: Optional[str] = None
    dob: Optional[str] = None
    exp_date: Optional[str] = None
    sex: Optional[str] = None
    height: Optional[str] = None
    eyes: Optional[str] = None
    issue_date: Optional[str] = None
    address: Optional[str] = None


class OcrResponse(BaseModel):
    """Defines the structure for the final API response."""
    status: str
    extracted_data: ExtractedData # Changed from extracted_text: str