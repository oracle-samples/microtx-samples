# services/ocr_service.py
import os
import logging
import re
import easyocr
import requests
import cv2
import numpy as np

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# UPDATED: More precise parsing function with result cleaning.
def _parse_text_to_json(text: str) -> dict:
    """
    Parses a raw text block into a structured dictionary with cleaned-up fields.
    """
    # Initialize all fields to None
    data = {
        "dl_number": None, "last_name": None, "first_name": None, "dob": None,
        "exp_date": None, "sex": None, "height": None, "eyes": None,
        "issue_date": None, "address": None
    }

    # --- Field Extraction and Cleaning ---

    # DL Number: Find the line starting with DL and grab the first part.
    if match := re.search(r"(?im)^DL\s*(.*)", text):
        # Split the line and take the first element, which is the ID.
        data["dl_number"] = match.group(1).strip().split()[0]

    # Last Name: Find line starting with LN.
    if match := re.search(r"(?im)^LN\s*(.*)", text):
        data["last_name"] = match.group(1).strip()

    # First Name: Find line starting with FN.
    if match := re.search(r"(?im)^FN\s*(.*)", text):
        data["first_name"] = match.group(1).strip()

    # Date of Birth: Find DOB followed by a date.
    if match := re.search(r"(?i)DOB\s*(\d{2}/\d{2}/\d{4})", text):
        data["dob"] = match.group(1).strip()

    # Expiration Date: Find EXP followed by a date.
    if match := re.search(r"(?i)EXP\s*(\d{2}/\d{2}/\d{4})", text):
        data["exp_date"] = match.group(1).strip()

    # Sex: Find SEX followed by a single letter.
    if match := re.search(r"(?i)SEX\s*([A-Z])", text):
        data["sex"] = match.group(1).strip()

    # Height: Find HGT followed by the height string.
    if match := re.search(r"(?i)HGT\s*([0-9\'\-\"]+)", text):
        data["height"] = match.group(1).strip()

    # Eyes: Find EYES followed by a 3-letter code.
    if match := re.search(r"(?i)EYES\s*([A-Z]{3})", text):
        data["eyes"] = match.group(1).strip()

    # Issue Date: Find ISS followed by a date.
    if match := re.search(r"(?i)ISS\s*(\d{2}/\d{2}/\d{4})", text):
        data["issue_date"] = match.group(1).strip()

    # Address: Find and combine street and city/state/zip lines.
    address_parts = []
    # Pattern for street line (e.g., "123 Main St")
    if street_match := re.search(r"(?im)(^\d{1,5}\s+.*(?:ST|AVE|RD|DR|LN).*)", text):
        address_parts.append(street_match.group(1).strip())
    # Pattern for city line (e.g., "ANYTOWN, CA 12345")
    if city_match := re.search(r"(?im)(^[A-Z\s]+,\s*[A-Z]{2}\s*\d{5})", text):
        address_parts.append(city_match.group(1).strip())
    if address_parts:
        data["address"] = " ".join(address_parts)

    return data


def perform_ocr(file_path: str) -> str:
    """
    Performs in-house OCR using EasyOCR and formats the output as JSON.
    """
    if not os.path.exists(file_path):
        logger.error(f"File not found at path: {file_path}")
        raise FileNotFoundError(f"The specified file was not found: {file_path}")

    try:
        reader = easyocr.Reader(['en'],
                                model_storage_directory='.EasyOCR'
                                )
        result = reader.readtext(file_path)
        full_text = "\n".join([res[1] for res in result])
        
        structured_data = _parse_text_to_json(full_text)

        return structured_data

    except Exception as e:
        logger.error(f"An unexpected error occurred while processing {file_path}: {e}")
        raise


def perform_ocr2(source: str) -> dict:
    """
    Performs in-house OCR using EasyOCR on a local file path or URL.
    """
    image = None
    is_url = source.startswith(('http://', 'https://'))

    if is_url:
        try:
            response = requests.get(source, timeout=30)
            response.raise_for_status()
            image_data = np.frombuffer(response.content, np.uint8)
            image = cv2.imdecode(image_data, cv2.IMREAD_COLOR)
            if image is None:
                raise ValueError("Invalid image data received from URL")
        except requests.RequestException as e:
            logger.error(f"Failed to download image from URL: {source}, error: {e}")
            raise ValueError(f"Failed to download image from {source}: {e}")
    else:
        if not os.path.exists(source):
            logger.error(f"File not found at path: {source}")
            raise FileNotFoundError(f"The specified file was not found: {source}")
        image = cv2.imread(source)
        if image is None:
            raise FileNotFoundError(f"Could not read image file: {source}")

    try:
        reader = easyocr.Reader(['en'], model_storage_directory='.EasyOCR')
        result = reader.readtext(image)
        full_text = "\n".join([res[1] for res in result])
        
        structured_data = _parse_text_to_json(full_text)
        return structured_data

    except Exception as e:
        logger.error(f"An unexpected error occurred while processing {source}: {e}")
        raise
