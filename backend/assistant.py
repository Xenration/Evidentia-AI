# backend/assistant.py
import os
from typing import List, Dict
from sqlalchemy.orm import Session
from models import Evidence, Entity, Event
from google import genai


class InvestigationAssistant:
    def __init__(self, db: Session, case_id: int):
        self.db = db
        self.case_id = case_id
        self.client = genai.Client(api_key=os.getenv("GEMINI_API_KEY"))

    def get_case_context(self) -> str:
        """Build a context string from all case data."""
        evidence_items = self.db.query(Evidence).filter(Evidence.case_id == self.case_id).all()
        evidence_text = "\n".join(
            [f"- {e.file_name}: {e.extracted_text[:500]}" for e in evidence_items if e.extracted_text]
        )

        entities = self.db.query(Entity).filter(Entity.case_id == self.case_id).all()
        entity_text = "\n".join([f"- {e.type}: {e.name}" for e in entities])

        events = self.db.query(Event).filter(Event.case_id == self.case_id).all()
        event_text = "\n".join(
            [f"- {e.timestamp}: {e.title} - {e.description}" for e in events]
        )

        return f"""
        CASE DATA:

        EVIDENCE:
        {evidence_text}

        ENTITIES:
        {entity_text}

        EVENTS:
        {event_text}
        """

    def ask(self, question: str) -> Dict:
        """Ask a question about the case using Gemini."""
        context = self.get_case_context()

        prompt = f"""
        You are an AI Investigation Assistant for the Evidentia platform.
        You help investigators analyze evidence and solve cases.

        {context}

        Investigator Question: {question}

        Please provide a detailed, evidence-based answer.
        If you don't know something, say so.
        Always cite specific evidence or data when possible.
        """

        response = self.client.models.generate_content(
            model="gemini-3.6-flash",
            contents=prompt
        )

        return {
            "answer": response.text,
            "sources": self.get_sources()
        }

    def get_sources(self) -> List[str]:
        """Get source evidence IDs used in the response."""
        evidence = self.db.query(Evidence).filter(Evidence.case_id == self.case_id).all()
        return [f"EVID-{e.id}" for e in evidence]