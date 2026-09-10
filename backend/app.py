# backend/app.py

# ============================================================
# IMPORTS
# ============================================================
from fastapi import FastAPI, File, UploadFile, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
import os
import uuid
import shutil
from datetime import datetime
from typing import List

# Load environment variables FIRST
from dotenv import load_dotenv
load_dotenv()

# Test that API key loaded
api_key = os.getenv("GEMINI_API_KEY")
if api_key:
    print(f"✅ API Key loaded: {api_key[:10]}...")
else:
    print("❌ API Key NOT found. Check your .env file.")

# Database and models
from database import engine, get_db, Base
from models import Case, Evidence, EvidenceStatus, Entity, Event
from schemas import CaseCreate, CaseOut, EvidenceOut, EntityOut, EventOut

# AI Analyzer
from analyzer import analyze_image, analyze_audio, analyze_video, analyze_document, extract_events

# AI Assistant
from assistant import InvestigationAssistant

# ============================================================
# CREATE TABLES
# ============================================================
Base.metadata.create_all(bind=engine)

# ============================================================
# INITIALIZE FASTAPI
# ============================================================
app = FastAPI(title="Evidentia AI Backend", version="1.0")

# CORS - allow frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "https://evidentia-ai.netlify.app"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

UPLOAD_DIR = "uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)

# ============================================================
# CASE CRUD ENDPOINTS
# ============================================================

@app.post("/cases", response_model=CaseOut)
def create_case(case: CaseCreate, db: Session = Depends(get_db)):
    db_case = Case(
        title=case.title,
        description=case.description,
        status=case.status or "Active",
        created_by=case.created_by or "current_user"
    )
    db.add(db_case)
    db.commit()
    db.refresh(db_case)
    return db_case


@app.get("/cases", response_model=List[CaseOut])
def get_cases(db: Session = Depends(get_db)):
    return db.query(Case).all()


@app.get("/cases/{case_id}", response_model=CaseOut)
def get_case(case_id: int, db: Session = Depends(get_db)):
    case = db.query(Case).filter(Case.id == case_id).first()
    if not case:
        raise HTTPException(status_code=404, detail="Case not found")
    return case


@app.put("/cases/{case_id}", response_model=CaseOut)
def update_case(case_id: int, case_update: CaseCreate, db: Session = Depends(get_db)):
    case = db.query(Case).filter(Case.id == case_id).first()
    if not case:
        raise HTTPException(status_code=404, detail="Case not found")
    case.title = case_update.title
    case.description = case_update.description
    case.status = case_update.status or case.status
    db.commit()
    db.refresh(case)
    return case


@app.delete("/cases/{case_id}")
def delete_case(case_id: int, db: Session = Depends(get_db)):
    case = db.query(Case).filter(Case.id == case_id).first()
    if not case:
        raise HTTPException(status_code=404, detail="Case not found")
    db.delete(case)
    db.commit()
    return {"message": "Case deleted"}

# ============================================================
# EVIDENCE UPLOAD
# ============================================================

@app.post("/cases/{case_id}/evidence")
async def upload_evidence(
    case_id: int,
    file: UploadFile = File(...),
    db: Session = Depends(get_db)
):
    # Check if case exists
    case = db.query(Case).filter(Case.id == case_id).first()
    if not case:
        raise HTTPException(status_code=404, detail="Case not found")

    # Generate unique filename
    file_id = str(uuid.uuid4())
    file_extension = os.path.splitext(file.filename)[1]
    stored_filename = f"{file_id}{file_extension}"
    file_path = os.path.join(UPLOAD_DIR, stored_filename)

    # Save file
    try:
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to save file: {str(e)}")

    # Determine file type
    content_type = file.content_type or ""
    if "image" in content_type:
        file_type = "Image"
    elif "video" in content_type:
        file_type = "Video"
    elif "audio" in content_type:
        file_type = "Audio"
    elif "pdf" in content_type or "document" in content_type:
        file_type = "Document"
    else:
        file_type = "Other"

    # Save to database
    db_evidence = Evidence(
        case_id=case_id,
        file_name=file.filename,
        file_type=file_type,
        file_size=os.path.getsize(file_path),
        storage_path=file_path,
        uploaded_by="current_user",
        processing_status=EvidenceStatus.UPLOADED,
        source=None
    )
    db.add(db_evidence)
    db.commit()
    db.refresh(db_evidence)

    return {
        "id": db_evidence.id,
        "case_id": db_evidence.case_id,
        "file_name": db_evidence.file_name,
        "file_type": db_evidence.file_type,
        "processing_status": db_evidence.processing_status,
        "upload_date": db_evidence.upload_date,
        "message": "File uploaded successfully"
    }

# ============================================================
# GET EVIDENCE
# ============================================================

@app.get("/cases/{case_id}/evidence", response_model=List[EvidenceOut])
def get_evidence_for_case(case_id: int, db: Session = Depends(get_db)):
    return db.query(Evidence).filter(Evidence.case_id == case_id).all()


@app.get("/evidence/{evidence_id}", response_model=EvidenceOut)
def get_evidence(evidence_id: int, db: Session = Depends(get_db)):
    evidence = db.query(Evidence).filter(Evidence.id == evidence_id).first()
    if not evidence:
        raise HTTPException(status_code=404, detail="Evidence not found")
    return evidence

# ============================================================
# DELETE EVIDENCE  (NEW)
# ============================================================

@app.delete("/evidence/{evidence_id}")
def delete_evidence(evidence_id: int, db: Session = Depends(get_db)):
    evidence = db.query(Evidence).filter(Evidence.id == evidence_id).first()
    if not evidence:
        raise HTTPException(status_code=404, detail="Evidence not found")

    # Delete associated entities and events first
    db.query(Entity).filter(Entity.evidence_id == evidence_id).delete()
    db.query(Event).filter(Event.evidence_id == evidence_id).delete()

    # Delete the file from disk
    try:
        if os.path.exists(evidence.storage_path):
            os.remove(evidence.storage_path)
    except Exception as e:
        print(f"Warning: Could not delete file: {e}")

    # Delete the evidence record
    db.delete(evidence)
    db.commit()

    return {"message": "Evidence deleted", "evidence_id": evidence_id}

# ============================================================
# ENTITY AND EVENT ENDPOINTS
# ============================================================

@app.get("/cases/{case_id}/entities", response_model=List[EntityOut])
def get_entities(case_id: int, db: Session = Depends(get_db)):
    return db.query(Entity).filter(Entity.case_id == case_id).all()


@app.get("/cases/{case_id}/events", response_model=List[EventOut])
def get_events(case_id: int, db: Session = Depends(get_db)):
    return db.query(Event).filter(Event.case_id == case_id).all()

# ============================================================
# REAL ANALYSIS ENDPOINT
# ============================================================

@app.post("/evidence/{evidence_id}/analyze")
def analyze_evidence(evidence_id: int, db: Session = Depends(get_db)):
    evidence = db.query(Evidence).filter(Evidence.id == evidence_id).first()
    if not evidence:
        raise HTTPException(status_code=404, detail="Evidence not found")

    # Update status to Processing
    evidence.processing_status = EvidenceStatus.PROCESSING
    db.commit()

    # Check if file exists
    if not os.path.exists(evidence.storage_path):
        evidence.processing_status = EvidenceStatus.FAILED
        db.commit()
        raise HTTPException(status_code=400, detail="File not found on server")

    try:
        # Run appropriate analyzer
        if evidence.file_type == "Image":
            result = analyze_image(evidence.storage_path)
        elif evidence.file_type == "Audio":
            result = analyze_audio(evidence.storage_path)
        elif evidence.file_type == "Video":
            result = analyze_video(evidence.storage_path)
        elif evidence.file_type == "Document":
            result = analyze_document(evidence.storage_path)
        else:
            result = {"text": "Unsupported file type", "entities": []}

        # Save extracted text
        evidence.extracted_text = result["text"]

        # Save entities
        for ent in result["entities"]:
            db_entity = Entity(
                case_id=evidence.case_id,
                evidence_id=evidence.id,
                type=ent["type"],
                name=ent["name"],
                confidence=ent["confidence"]
            )
            db.add(db_entity)

        # Generate events from entities
        events = extract_events(result["text"], result["entities"])
        for evt in events:
            db_event = Event(
                case_id=evidence.case_id,
                evidence_id=evidence.id,
                timestamp=evt["timestamp"],
                title=evt["title"],
                description=evt["description"],
                location=evt.get("location"),
                confidence=evt["confidence"]
            )
            db.add(db_event)

        evidence.processing_status = EvidenceStatus.ANALYZED
        db.commit()

    except Exception as e:
        evidence.processing_status = EvidenceStatus.FAILED
        db.commit()
        raise HTTPException(status_code=500, detail=f"Analysis failed: {str(e)}")

    return {"message": "Analysis completed", "evidence_id": evidence_id}

# ============================================================
# AI ASSISTANT ENDPOINT
# ============================================================

@app.post("/cases/{case_id}/assistant")
def ask_assistant(case_id: int, request: dict, db: Session = Depends(get_db)):
    """Ask the AI Assistant a question about the case."""
    question = request.get("question", "")
    if not question:
        raise HTTPException(status_code=400, detail="Question is required")

    assistant = InvestigationAssistant(db, case_id)
    response = assistant.ask(question)

    return response

# ============================================================
# RUN SERVER
# ============================================================

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)