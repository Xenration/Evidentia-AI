# backend/analyzer.py
import os
import pytesseract
from PIL import Image
import whisper
import spacy
from datetime import datetime
import re

# ============================================================
# LAZY LOADING — Models load only when first used
# ============================================================

_nlp = None
_whisper_model = None


def get_nlp():
    """Load spaCy model only when needed."""
    global _nlp
    if _nlp is None:
        try:
            _nlp = spacy.load("en_core_web_sm")
        except OSError:
            spacy.cli.download("en_core_web_sm")
            _nlp = spacy.load("en_core_web_sm")
    return _nlp


def get_whisper():
    """Load Whisper model only when needed."""
    global _whisper_model
    if _whisper_model is None:
        _whisper_model = whisper.load_model("base")
    return _whisper_model


# ============================================================
# ANALYSIS FUNCTIONS BY FILE TYPE
# ============================================================

def analyze_image(file_path: str) -> dict:
    """Extract text from image using Tesseract OCR."""
    try:
        image = Image.open(file_path)
        text = pytesseract.image_to_string(image)
    except Exception as e:
        text = f"OCR failed: {str(e)}"
    entities = extract_entities(text)
    return {"text": text, "entities": entities}


def analyze_audio(file_path: str) -> dict:
    """Transcribe audio using Whisper."""
    try:
        model = get_whisper()
        result = model.transcribe(file_path)
        text = result["text"]
    except Exception as e:
        text = f"Transcription failed: {str(e)}"
    entities = extract_entities(text)
    return {"text": text, "entities": entities}


def analyze_video(file_path: str) -> dict:
    """Transcribe video using Whisper."""
    try:
        model = get_whisper()
        result = model.transcribe(file_path)
        text = result["text"]
    except Exception as e:
        text = f"Video transcription failed: {str(e)}"
    entities = extract_entities(text)
    return {"text": text, "entities": entities}


def analyze_document(file_path: str) -> dict:
    """Extract text from PDF using PyPDF2."""
    try:
        import PyPDF2
        text = ""
        with open(file_path, "rb") as f:
            reader = PyPDF2.PdfReader(f)
            for page in reader.pages:
                page_text = page.extract_text()
                if page_text:
                    text += page_text + "\n"
        if not text.strip():
            text = "No text could be extracted from this PDF."
    except Exception as e:
        text = f"PDF extraction failed: {str(e)}"

    entities = extract_entities(text)
    return {"text": text, "entities": entities}


# ============================================================
# ENTITY & EVENT EXTRACTION
# ============================================================

def extract_entities(text: str) -> list:
    """Run spaCy NER on text."""
    nlp = get_nlp()
    doc = nlp(text)
    entities = []
    for ent in doc.ents:
        entities.append({
            "type": ent.label_,  # PERSON, LOCATION, DATE, etc.
            "name": ent.text,
            "confidence": 0.9
        })
    return entities


def extract_events(text: str, entities: list) -> list:
    """Simple rule-based event extraction."""
    events = []

    # Get all persons and locations
    persons = [e for e in entities if e["type"] == "PERSON"]
    locations = [e for e in entities if e["type"] in ["LOCATION", "GPE", "FAC"]]
    dates = [e for e in entities if e["type"] == "DATE"]

    # Create an event for each person + location combination
    if persons and locations:
        for person in persons[:5]:  # limit to first 5 to avoid spam
            for location in locations[:3]:
                # Use first date if available, else now
                event_date = datetime.now()
                events.append({
                    "title": f"{person['name']} at {location['name']}",
                    "description": f"Evidence mentions {person['name']} at {location['name']}",
                    "location": location['name'],
                    "timestamp": event_date,
                    "confidence": 0.7
                })

    # If we found persons but no locations, still create a simple event
    elif persons:
        for person in persons[:5]:
            events.append({
                "title": f"{person['name']} mentioned",
                "description": f"Evidence mentions {person['name']}",
                "location": None,
                "timestamp": datetime.now(),
                "confidence": 0.6
            })

    return events