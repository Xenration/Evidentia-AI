# backend/seed_contradictions_tasks.py
import sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).resolve().parent))

from database import engine, SessionLocal, Base
from models import Case, Evidence, Contradiction, InvestigationTask, Hypothesis

Base.metadata.create_all(bind=engine)
db = SessionLocal()

print("[*] Seeding contradictions and tasks for cases...")

try:
    cases = db.query(Case).all()
    print(f"[*] Found {len(cases)} cases.")

    for c in cases:
        evs = db.query(Evidence).filter(Evidence.case_id == c.id).all()
        ev_map = {ev.file_name.lower(): ev.id for ev in evs}
        first_ev_id = evs[0].id if evs else None
        second_ev_id = evs[1].id if len(evs) > 1 else first_ev_id

        # -----------------------------------------------------------------
        # Case 1: Pune Techie Nayana Pujari Abduction & Murder
        # -----------------------------------------------------------------
        if c.id == 1 or "pujari" in c.title.lower() or "534" in c.title:
            atm_id = ev_map.get("sample_atm_cctv.mp4", first_ev_id)
            cdr_id = ev_map.get("sample_cdr_dump.pdf", second_ev_id)
            cab_id = ev_map.get("qualis_forensics.pdf", first_ev_id)

            c1 = [
                {
                    "statement_a": "Suspect Yogesh Ashok Raut claimed he was at his residence in Khed all night on 07-Oct-2009.",
                    "source_a_id": None,
                    "statement_b": "Yerwada SBI ATM CCTV Exhibit captures Yogesh Raut at 21:42:15 IST withdrawing cash with victim's ATM card.",
                    "source_b_id": atm_id,
                    "conflict_type": "Alibi Discrepancy",
                    "confidence": 99.4,
                    "status": "Detected"
                },
                {
                    "statement_a": "Co-accused Rajesh Chaudhari stated in Section 161 CrPC statement that the cab never stopped at Kharadi Bypass.",
                    "source_a_id": None,
                    "statement_b": "Kharadi Cellular Tower Dump (Cell ID 404-20-1102) records co-accused IMEI stationary from 20:30 to 22:15 IST.",
                    "source_b_id": cdr_id,
                    "conflict_type": "Timeline Conflict",
                    "confidence": 96.8,
                    "status": "Detected"
                },
                {
                    "statement_a": "Accused Vishwas Kadam claimed the silver Qualis was used solely for authorized Synechron company transport.",
                    "source_a_id": None,
                    "statement_b": "FSL Kalina Serology report reveals latent O+ human blood matching victim Nayana Pujari on rear floor mat.",
                    "source_b_id": cab_id,
                    "conflict_type": "Forensic Inconsistency",
                    "confidence": 99.9,
                    "status": "Detected"
                }
            ]

            t1 = [
                {
                    "task": "Procure certified Sec 65B Certificate from SBI Nodal Officer for Yerwada ATM CCTV footage",
                    "reason": "Crucial requirement to ensure video admissibility under Section 65B(4) Indian Evidence Act.",
                    "priority": "High",
                    "status": "In Progress",
                    "assigned_to": "Digital Forensics Unit",
                    "related_evidence_id": atm_id
                },
                {
                    "task": "Summon Synechron transport supervisor to establish unauthorized deviation of cab MH-12-AR-2541",
                    "reason": "Corroborates approver Rajesh Chaudhari's statement regarding illicit passenger pick-up.",
                    "priority": "High",
                    "status": "Pending",
                    "assigned_to": "Field Investigation Team",
                    "related_evidence_id": cab_id
                },
                {
                    "task": "Cross-examine FSL Kalina expert on multiplex DNA STR match probability",
                    "reason": "Solidifies forensic proof linking victim bloodstains found on seat foam directly to accused.",
                    "priority": "Medium",
                    "status": "Pending",
                    "assigned_to": "Legal Directorate",
                    "related_evidence_id": cab_id
                }
            ]

            for item in c1:
                if not db.query(Contradiction).filter(Contradiction.case_id == c.id, Contradiction.conflict_type == item["conflict_type"]).first():
                    db.add(Contradiction(case_id=c.id, **item))
            for item in t1:
                if not db.query(InvestigationTask).filter(InvestigationTask.case_id == c.id, InvestigationTask.task == item["task"]).first():
                    db.add(InvestigationTask(case_id=c.id, **item))

        # -----------------------------------------------------------------
        # Case 2: Pune Cyber Bank Reserve Exfiltration
        # -----------------------------------------------------------------
        elif c.id == 2 or "cyber" in c.title.lower() or "0042" in c.title:
            c2 = [
                {
                    "statement_a": "Lead System Architect claimed API Gateway credentials were only accessible from Bangalore NOC.",
                    "source_a_id": None,
                    "statement_b": "Firewall logs demonstrate direct SSH session initiated from internal IP 192.168.10.45 in Pune Hinjawadi office.",
                    "source_b_id": first_ev_id,
                    "conflict_type": "Network Access Discrepancy",
                    "confidence": 94.5,
                    "status": "Detected"
                },
                {
                    "statement_a": "SWIFT reconciliation system indicated automated batch processing at 02:14 UTC.",
                    "source_a_id": None,
                    "statement_b": "HSM hardware security module keystroke telemetry proves manual override switch was physically toggled.",
                    "source_b_id": second_ev_id,
                    "conflict_type": "Cryptographic Audit Conflict",
                    "confidence": 98.1,
                    "status": "Detected"
                }
            ]
            t2 = [
                {
                    "task": "Issue formal INTERPOL Red Notice data request for offshore destination accounts in Mauritius",
                    "reason": "Freeze $4.2M wire transfers routed through intermediary shell banking nodes.",
                    "priority": "High",
                    "status": "Pending",
                    "assigned_to": "Cyber Crime Cell",
                    "related_evidence_id": first_ev_id
                },
                {
                    "task": "Seize and clone biometric access controller hard drives for Server Room B",
                    "reason": "Verify badge swipe logs against CCTV camera angles to identify the physical operator.",
                    "priority": "High",
                    "status": "In Progress",
                    "assigned_to": "Digital Forensics Unit",
                    "related_evidence_id": second_ev_id
                }
            ]
            for item in c2:
                if not db.query(Contradiction).filter(Contradiction.case_id == c.id, Contradiction.conflict_type == item["conflict_type"]).first():
                    db.add(Contradiction(case_id=c.id, **item))
            for item in t2:
                if not db.query(InvestigationTask).filter(InvestigationTask.case_id == c.id, InvestigationTask.task == item["task"]).first():
                    db.add(InvestigationTask(case_id=c.id, **item))

        # -----------------------------------------------------------------
        # Generic for other cases
        # -----------------------------------------------------------------
        else:
            if not db.query(Contradiction).filter(Contradiction.case_id == c.id).first():
                db.add(Contradiction(
                    case_id=c.id,
                    statement_a=f"Initial testimony logged during preliminary inquiry for {c.title}.",
                    source_a_id=first_ev_id,
                    statement_b=f"Subsequent evidentiary exhibit indicates conflicting timeline details.",
                    source_b_id=second_ev_id,
                    conflict_type="Investigative Discrepancy",
                    confidence=86.0,
                    status="Detected"
                ))
            if not db.query(InvestigationTask).filter(InvestigationTask.case_id == c.id).first():
                db.add(InvestigationTask(
                    case_id=c.id,
                    task=f"Complete forensic certification and Sec 65B filing for {c.title}",
                    reason="Mandatory verification before submission of final chargesheet.",
                    priority="High",
                    status="Pending",
                    assigned_to="Special Investigation Team",
                    related_evidence_id=first_ev_id
                ))

    db.commit()
    print("[OK] Seeding of contradictions and tasks completed successfully.")
except Exception as e:
    db.rollback()
    print(f"[!] Error seeding: {e}")
finally:
    db.close()
