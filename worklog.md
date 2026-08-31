---
Task ID: 1
Agent: main
Task: V2 Refinement of Evidentia Investigation Board

Work Log:
- Extracted and inspected uploaded V1 ZIP to verify Phase 1 implementation
- Confirmed all V1 features: cork/wood board, investigation cards, red pins, red strings, drag/drop, zoom/pan, fit-to-view
- Installed html2canvas-pro@1.5.8 for PNG export
- Rewrote InvestigationBoard.tsx (1013 -> 1345 lines) with all V2 features:
  - Enlarged workspace: 3000x2000 -> 5000x3500
  - Enlarged cards: 196px wide -> 260px wide, increased heights per type
  - Added node ID display on all cards
  - Added more data fields: uploadDate for Evidence, confidence for TimelineEvent, description for Hypothesis
  - Stopped auto-layout from overriding manual positions (layout runs only on allNodes/allEdges change, saved positions always take priority)
  - Added localStorage persistence keyed by caseId: `evidentia_board_${caseId}`
  - Persists: positions, z-order, viewport, visibleTypes, showConnections
  - Saves on drag end, pan end, zoom (debounced), filter toggle, fit-to-view
  - Added fullscreen mode via Fullscreen API with CSS for fullscreen wrapper
  - Added PNG export using html2canvas-pro with sanitized filename
  - Added zoom percentage display in toolbar (e.g., "100%")
  - Improved fit-to-view with larger card dimensions, capped at 1.2x zoom
  - Added Reset Layout button with window.confirm() confirmation
  - Added z-index management: cards brought to front on click/drag, z-order persisted
  - Added card layering: SVG strings (z:1) < Cards (z:2+) < Pins (z:5 inside card)
- Updated KnowledgeGraph.tsx to pass caseId and caseName props to InvestigationBoard
- Added fullscreen CSS rules to index.css
- Build: 0 TypeScript errors, successful production build
- Lint: 0 warnings, 0 errors on changed files

Stage Summary:
- All 22 V2 requirements implemented
- V1 visual design completely preserved
- Files changed: InvestigationBoard.tsx, KnowledgeGraph.tsx, index.css, package.json (html2canvas-pro added)
- Build passes cleanly with tsc + vite build
