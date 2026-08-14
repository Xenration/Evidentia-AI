import { Case, Evidence, Entity, TimelineEvent, Contradiction, Hypothesis, InvestigationTask } from '../types';

export const mockCases: Case[] = [
  {
    id: 'CASE-2026-001',
    name: 'Operation Midnight Silence',
    description: 'Investigation into the unauthorized data exfiltration and subsequent disappearance of key personnel at Apex Cybernetics.',
    status: 'Active',
    priority: 'High',
    createdDate: '2026-08-10T08:00:00Z',
    lastUpdated: '2026-08-14T21:00:00Z',
    evidenceCount: 10,
    assignedInvestigators: ['Alex Vance', 'Sarah Jenkins'],
  }
];

export const mockEvidence: Evidence[] = [
  { id: 'E-001', caseId: 'CASE-2026-001', fileName: 'cctv_server_room.mp4', fileType: 'Video', source: 'Internal Security', uploadDate: '2026-08-10T10:30:00Z', uploadedBy: 'A. Vance', processingStatus: 'Analyzed', tags: ['CCTV', 'Server Room'] },
  { id: 'E-002', caseId: 'CASE-2026-001', fileName: 'access_logs_aug9.csv', fileType: 'Document', source: 'IT Ops', uploadDate: '2026-08-10T11:00:00Z', uploadedBy: 'A. Vance', processingStatus: 'Analyzed', tags: ['Logs', 'Authentication'] },
  { id: 'E-003', caseId: 'CASE-2026-001', fileName: 'interview_j_smith.m4a', fileType: 'Audio', source: 'HR Dept', uploadDate: '2026-08-11T09:15:00Z', uploadedBy: 'S. Jenkins', processingStatus: 'Analyzed', tags: ['Interview', 'Witness'] },
  { id: 'E-004', caseId: 'CASE-2026-001', fileName: 'email_export_dr_chen.pst', fileType: 'Document', source: 'IT Ops', uploadDate: '2026-08-11T14:20:00Z', uploadedBy: 'A. Vance', processingStatus: 'Analyzed', tags: ['Communications'] },
  { id: 'E-005', caseId: 'CASE-2026-001', fileName: 'encrypted_usb_image.iso', fileType: 'Image', source: 'Field Recovery', uploadDate: '2026-08-12T16:45:00Z', uploadedBy: 'S. Jenkins', processingStatus: 'Processing', tags: ['Forensics', 'Hardware'] },
  { id: 'E-006', caseId: 'CASE-2026-001', fileName: 'flight_records_aug10.pdf', fileType: 'Document', source: 'OSINT/Travel', uploadDate: '2026-08-13T10:00:00Z', uploadedBy: 'A. Vance', processingStatus: 'Analyzed', tags: ['Travel'] },
  { id: 'E-007', caseId: 'CASE-2026-001', fileName: 'bank_statement_offshore.pdf', fileType: 'Document', source: 'Subpoena', uploadDate: '2026-08-13T15:30:00Z', uploadedBy: 'S. Jenkins', processingStatus: 'Analyzed', tags: ['Financial'] },
  { id: 'E-008', caseId: 'CASE-2026-001', fileName: 'parking_garage_cam.mp4', fileType: 'Video', source: 'Building Management', uploadDate: '2026-08-14T08:20:00Z', uploadedBy: 'A. Vance', processingStatus: 'Queued', tags: ['CCTV'] },
  { id: 'E-009', caseId: 'CASE-2026-001', fileName: 'telegram_chat_history.txt', fileType: 'Document', source: 'Mobile Extraction', uploadDate: '2026-08-14T11:15:00Z', uploadedBy: 'S. Jenkins', processingStatus: 'Analyzed', tags: ['Communications'] },
  { id: 'E-010', caseId: 'CASE-2026-001', fileName: 'research_notes_project_x.pdf', fileType: 'Document', source: 'Dr. Chen Desk', uploadDate: '2026-08-14T18:00:00Z', uploadedBy: 'A. Vance', processingStatus: 'Uploaded', tags: ['Intellectual Property'] },
];

export const mockEntities: Entity[] = [
  { id: 'ENT-01', caseId: 'CASE-2026-001', type: 'Person', name: 'Dr. Arthur Chen', aliases: ['Artie', 'User449'], sourceEvidenceIds: ['E-002', 'E-004', 'E-006', 'E-010'], confidence: 98 },
  { id: 'ENT-02', caseId: 'CASE-2026-001', type: 'Person', name: 'James Smith', aliases: ['J.S.'], sourceEvidenceIds: ['E-003', 'E-004'], confidence: 100 },
  { id: 'ENT-03', caseId: 'CASE-2026-001', type: 'Organization', name: 'Apex Cybernetics', aliases: ['Apex'], sourceEvidenceIds: ['E-002', 'E-004'], confidence: 100 },
  { id: 'ENT-04', caseId: 'CASE-2026-001', type: 'Organization', name: 'Nexus Global Holdings', aliases: ['NGH'], sourceEvidenceIds: ['E-007', 'E-009'], confidence: 85 },
  { id: 'ENT-05', caseId: 'CASE-2026-001', type: 'Location', name: 'Server Room B', aliases: ['Sub-level 2', 'SR-B'], sourceEvidenceIds: ['E-001', 'E-002'], confidence: 100 },
  { id: 'ENT-06', caseId: 'CASE-2026-001', type: 'Location', name: 'Zurich International Airport', aliases: ['ZRH'], sourceEvidenceIds: ['E-006'], confidence: 95 },
  { id: 'ENT-07', caseId: 'CASE-2026-001', type: 'Vehicle', name: 'Black SUV', aliases: ['License Plate: UNK'], sourceEvidenceIds: ['E-008'], confidence: 70 },
  { id: 'ENT-08', caseId: 'CASE-2026-001', type: 'Event', name: 'Unauthorized DB Dump', aliases: ['Data Exfil'], sourceEvidenceIds: ['E-001', 'E-002'], confidence: 99 },
];

export const mockTimeline: TimelineEvent[] = [
  { id: 'T-01', caseId: 'CASE-2026-001', timestamp: '2026-08-08T14:30:00Z', title: 'Suspicious Email Sent', description: 'Dr. Chen emails an unknown contact regarding "Project X specifications".', sourceEvidenceId: 'E-004', relatedEntityIds: ['ENT-01', 'ENT-04'], location: 'Apex HQ', confidence: 90 },
  { id: 'T-02', caseId: 'CASE-2026-001', timestamp: '2026-08-09T01:15:00Z', title: 'Server Room Access', description: 'Dr. Chen\'s keycard is used to access Server Room B outside normal hours.', sourceEvidenceId: 'E-002', relatedEntityIds: ['ENT-01', 'ENT-05'], location: 'Server Room B', confidence: 100 },
  { id: 'T-03', caseId: 'CASE-2026-001', timestamp: '2026-08-09T01:22:00Z', title: 'Data Extraction Initiated', description: 'Massive outbound transfer from core database to external IP.', sourceEvidenceId: 'E-002', relatedEntityIds: ['ENT-03', 'ENT-08'], location: 'Server Room B', confidence: 100 },
  { id: 'T-04', caseId: 'CASE-2026-001', timestamp: '2026-08-09T01:45:00Z', title: 'CCTV Anomaly', description: 'Unidentified individual captured exiting Server Room B. Face obscured.', sourceEvidenceId: 'E-001', relatedEntityIds: ['ENT-05'], location: 'Server Room B', confidence: 85 },
  { id: 'T-05', caseId: 'CASE-2026-001', timestamp: '2026-08-09T02:10:00Z', title: 'Vehicle Departs', description: 'Black SUV leaves the parking garage.', sourceEvidenceId: 'E-008', relatedEntityIds: ['ENT-07'], location: 'Parking Garage', confidence: 75 },
  { id: 'T-06', caseId: 'CASE-2026-001', timestamp: '2026-08-09T08:00:00Z', title: 'Dr. Chen Fails to Report', description: 'James Smith reports Dr. Chen missing from morning briefing.', sourceEvidenceId: 'E-003', relatedEntityIds: ['ENT-01', 'ENT-02'], location: 'Apex HQ', confidence: 95 },
  { id: 'T-07', caseId: 'CASE-2026-001', timestamp: '2026-08-09T18:30:00Z', title: 'Flight Boarded', description: 'Passenger matching Dr. Chen boards flight to Zurich under alias.', sourceEvidenceId: 'E-006', relatedEntityIds: ['ENT-01', 'ENT-06'], location: 'JFK Airport', confidence: 88 },
  { id: 'T-08', caseId: 'CASE-2026-001', timestamp: '2026-08-10T09:00:00Z', title: 'Wire Transfer Executed', description: '$2.5M transferred to offshore account linked to Nexus Global Holdings.', sourceEvidenceId: 'E-007', relatedEntityIds: ['ENT-01', 'ENT-04'], location: 'Cayman Islands', confidence: 98 },
  { id: 'T-09', caseId: 'CASE-2026-001', timestamp: '2026-08-11T12:00:00Z', title: 'Telegram Communication', description: 'Encrypted message sent: "Package secured. Waiting for pickup."', sourceEvidenceId: 'E-009', relatedEntityIds: ['ENT-01'], location: 'Unknown', confidence: 80 },
  { id: 'T-10', caseId: 'CASE-2026-001', timestamp: '2026-08-14T10:00:00Z', title: 'USB Recovered', description: 'Encrypted USB found in Dr. Chen\'s abandoned apartment.', sourceEvidenceId: 'E-005', relatedEntityIds: ['ENT-01'], location: 'Chen Residence', confidence: 100 },
];

export const mockHypotheses: Hypothesis[] = [
  {
    id: 'H-01',
    caseId: 'CASE-2026-001',
    title: 'Voluntary Corporate Espionage',
    description: 'Dr. Chen willfully stole Project X data to sell to Nexus Global Holdings and fled the country.',
    status: 'Active',
    confidence: 85,
    supportingEvidenceIds: ['E-002', 'E-004', 'E-006', 'E-007'],
    contradictingEvidenceIds: ['E-003'],
    relatedEntityIds: ['ENT-01', 'ENT-04', 'ENT-08']
  },
  {
    id: 'H-02',
    caseId: 'CASE-2026-001',
    title: 'Coercion / Kidnapping',
    description: 'Dr. Chen was forced to extract data by a third party (the unidentified individual on CCTV) and was taken against his will.',
    status: 'Active',
    confidence: 45,
    supportingEvidenceIds: ['E-001', 'E-003', 'E-008'],
    contradictingEvidenceIds: ['E-004', 'E-006', 'E-007'],
    relatedEntityIds: ['ENT-01', 'ENT-02', 'ENT-07']
  },
  {
    id: 'H-03',
    caseId: 'CASE-2026-001',
    title: 'Internal Framing',
    description: 'Someone else used Dr. Chen\'s credentials to steal the data and plant evidence suggesting he fled.',
    status: 'Discarded',
    confidence: 15,
    supportingEvidenceIds: ['E-001'],
    contradictingEvidenceIds: ['E-006', 'E-009'],
    relatedEntityIds: ['ENT-01', 'ENT-03']
  }
];

export const mockContradictions: Contradiction[] = [
  {
    id: 'C-01',
    caseId: 'CASE-2026-001',
    statementA: 'James Smith claims Dr. Chen left his keycard on his desk on Aug 8.',
    sourceAId: 'E-003',
    statementB: 'Dr. Chen\'s keycard was used to access Server Room B at 01:15 AM on Aug 9.',
    sourceBId: 'E-002',
    conflictType: 'Physical Impossibility',
    confidence: 95,
    status: 'Under Review'
  },
  {
    id: 'C-02',
    caseId: 'CASE-2026-001',
    statementA: 'CCTV shows a person exiting Server Room B who is approximately 6 feet tall.',
    sourceAId: 'E-001',
    statementB: 'Dr. Chen\'s HR file indicates he is 5\'7".',
    sourceBId: 'E-004',
    conflictType: 'Identity Mismatch',
    confidence: 88,
    status: 'Under Review'
  },
  {
    id: 'C-03',
    caseId: 'CASE-2026-001',
    statementA: 'Telegram messages suggest Dr. Chen is hiding in Eastern Europe.',
    sourceAId: 'E-009',
    statementB: 'Flight records show Dr. Chen boarding a flight to Zurich, Switzerland.',
    sourceBId: 'E-006',
    conflictType: 'Location Conflict',
    confidence: 75,
    status: 'Detected'
  },
  {
    id: 'C-04',
    caseId: 'CASE-2026-001',
    statementA: 'Bank statement shows wire transfer initiated from IP address in London.',
    sourceAId: 'E-007',
    statementB: 'Dr. Chen was allegedly mid-flight to Zurich during the time of the transfer.',
    sourceBId: 'E-006',
    conflictType: 'Timeline Anomaly',
    confidence: 92,
    status: 'Detected'
  }
];

export const mockInvestigationTasks: InvestigationTask[] = [
  { id: 'TSK-01', caseId: 'CASE-2026-001', task: 'Enhance CCTV footage from Server Room B', reason: 'Need to identify if the person exiting is Dr. Chen or an intruder. Relates to height mismatch contradiction.', relatedContradictionId: 'C-02', priority: 'High', status: 'In Progress' },
  { id: 'TSK-02', caseId: 'CASE-2026-001', task: 'Trace offshore account transactions', reason: 'Determine if Nexus Global Holdings is the ultimate beneficiary of the $2.5M.', relatedHypothesisId: 'H-01', relatedEvidenceId: 'E-007', priority: 'High', status: 'Pending' },
  { id: 'TSK-03', caseId: 'CASE-2026-001', task: 'Interview night shift security guard', reason: 'Clarify how the Black SUV bypassed garage security.', relatedEvidenceId: 'E-008', priority: 'Medium', status: 'Pending' },
  { id: 'TSK-04', caseId: 'CASE-2026-001', task: 'Decrypt USB Drive', reason: 'May contain critical information about Project X or Chen\'s motives.', relatedEvidenceId: 'E-005', priority: 'High', status: 'In Progress' },
  { id: 'TSK-05', caseId: 'CASE-2026-001', task: 'Verify James Smith\'s alibi', reason: 'Smith claims Chen left his keycard. Need to verify Smith\'s whereabouts during the breach.', relatedContradictionId: 'C-01', priority: 'Medium', status: 'Pending' },
  { id: 'TSK-06', caseId: 'CASE-2026-001', task: 'Coordinate with Zurich Authorities', reason: 'Attempt to locate Dr. Chen upon arrival in Zurich.', relatedHypothesisId: 'H-01', relatedEvidenceId: 'E-006', priority: 'High', status: 'Pending' }
];
