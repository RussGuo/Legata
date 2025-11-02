# Legata — Web Demo PRD (Landing Page + Core Features)

**Goal**: Deliver a trustworthy, Apple‑style web demo—standalone (no backend)—that showcases two core capabilities for in‑house legal teams:

1. **Cited RAG Q&A over user‑uploaded documents**
2. **Contract Compare with AI‑style structured change table**

The demo must run fully in the browser, keep all data on‑device, and communicate privacy clearly to build trust.

---

## 0. Brand & Design Principles (Apple‑style)

* **Tone**: understated, precise, calm. First impression = “quietly competent”.
* **Typography**: SF Pro (system font stack fallback). Large, generous line-height.
* **Color**: near‑white background (#FBFBFD), ink black text (#0B0B0C), subtle accents (#0A84FF for primary actions, #34C759 for success, #FF9F0A for highlights). Shadows: soft, low elevation.
* **Layout**: grid‑based, ample whitespace, consistent 8px spacing. No heavy borders; use separators with 1px hairlines (#E5E5EA).
* **Motion**: minimal, 150–200ms ease‑in‑out; use for hover/focus/enter.
* **Trust cues**: on‑device badge, privacy banner (“Your files never leave this browser”), explicit citations in answers, consistent empty states.

---

## 1. Scope

**In‑scope**

* Static marketing landing page.
* Local‑only RAG Q&A with citations over uploaded files (PDF/DOCX/TXT).
* Local contract diff (two docs) with three‑pane view and structured change table.
* Export: citations as Markdown; diff table as CSV/Markdown.
* PWA installability and offline operation after first load.

**Out‑of‑scope** (for this demo)

* Server‑side processing, user auth, multi‑user sharing.
* True LLM generation. (Optional BYO‑API key supported but not required; default is deterministic extractive summarization.)
* Redlines back into DOCX.

---

## 2. Architecture (Frontend‑only)

* **Stack**: Vite + React + TypeScript + TailwindCSS + shadcn/ui + lucide-react.
* **Parsing**: pdf.js for PDFs; docx (mammoth.js) for DOCX; native for TXT/MD.
* **Embeddings & Vector Search (client)**:

  * transformers.js (Xenova) for on‑device embeddings (fallback to WASM if WebGPU unavailable).
  * Cosine similarity; top‑k retrieval; per‑chunk metadata (docId, page, heading, char range).
  * Storage: IndexedDB via idb‑keyval.
  * Worker threads for heavy tasks (embedding/chunking) to keep UI responsive.
* **Diff**: diff-match-patch or jsdiff (line + sentence + token layers).
* **PWA**: service worker, cache static assets, allow offline re‑use.

---

## 3. Information Security & Privacy (UI & Tech)

* **Data residency**: Files/embeddings stay in browser memory/IndexedDB; no network calls by default.
* **BYO‑API key (optional)**: If user pastes an OpenAI‑compatible key, calls are made from the browser only; a visible toggle shows mode: *Local‑only* vs *Augmented by LLM*.
* **Ephemeral mode**: One‑click “Incognito Session” keeps data in memory only and clears on exit.
* **Clear disclaimers**: “This demo provides non‑legal guidance. Verify before use.”

---

## 4. User Stories & Acceptance Criteria

### 4.1 Landing Page

**As an in‑house counsel**, I want to understand what Legata does and try a safe, local demo quickly.

* **AC‑L1**: Hero explains value in one line; subcopy stresses on‑device privacy.
* **AC‑L2**: Primary CTA: “Try the Local Demo” opens the app shell without leaving the site.
* **AC‑L3**: Secondary CTA: “See a Sample Case” loads bundled sample documents.
* **AC‑L4**: Trust elements visible above the fold (on‑device badge, privacy note, citations screenshot).

### 4.2 RAG Q&A with Citations

**As counsel**, I upload files, select which are in scope, ask a question, and receive an answer composed strictly from cited passages.

* **AC‑R1**: Upload PDF/DOCX/TXT; files appear with size, type, and auto‑extracted outline (title, top headings, page count).
* **AC‑R2**: User can tick which files to include; chips show selection count; “Scope: X docs”.
* **AC‑R3**: On first question, app chunks + embeds selected docs; progress bar; non‑blocking.
* **AC‑R4**: Answer contains only sentences assembled from retrieved chunks (extractive). Each sentence has citation badges [1], [2] linking to source preview (page‑anchored with highlight).
* **AC‑R5**: “Grounded‑only” mode enforces no hallucination: answers must be constructed from quoted sentences only.
* **AC‑R6**: “Export” produces a Markdown answer with footnotes.
* **AC‑R7**: Empty/edge states: no files, unsupported file, no relevant chunk (show “no match” guidance).

### 4.3 Contract Compare (Three‑Pane)

**As counsel**, I compare two contract versions and receive a structured change table.

* **AC‑C1**: Left pane = *Version A*, middle pane = *Version B*, with inline diff highlights; synced scroll; mini‑map overview.
* **AC‑C2**: Right pane = *Change Summary* table with columns: Clause/Location, Before, After, Change Type (Add/Delete/Modify), Risk Note, Suggestion.
* **AC‑C3**: Headings/clauses auto‑detected by heuristic (H1–H3 in DOCX, bold caps lines, numbering like 1., 1.1, etc.).
* **AC‑C4**: Keyword heuristics add risk notes for terms like *indemnify*, *liability cap*, *termination for convenience*, *jurisdiction*, *IP assignment*, *confidentiality*, *non‑compete*.
* **AC‑C5**: Export change table as CSV/Markdown.
* **AC‑C6**: Toggle: Sentence‑level vs Token‑level diff.

---

## 5. IA & Navigation

* Global top‑nav: **Legata** (logo) | *Features* | *How it works* | *Privacy* | *Try Demo* (primary button)
* App shell (modal or route `/app`): tabs **RAG Q&A** | **Compare** | **Settings**.

---

## 6. Detailed UX Specs

### 6.1 Landing Page Sections

1. **Hero**

   * H1: “Legata — Less drafting, more deciding.”
   * Sub: “On‑device legal assistance with verifiable citations.”
   * CTA: *Try the Local Demo*. Secondary: *View Sample Case*.
   * Visual: static mock of cited answer + trust badge (“On‑device • No upload”).
2. **Problems We Solve** (3 cards)

   * “Answer with citations” / “Compare contracts faster” / “Keep data on‑device”.
3. **How It Works** (3 steps)

   * Upload → Select scope → Ask/Compare.
4. **Privacy & Trust**

   * Short paragraph + link to in‑app Privacy page.
5. **Footer**

   * Non‑legal advice disclaimer; version number.

### 6.2 RAG Q&A UI

* **Left rail: Files** (search, filters by type; selectable list with outlines and page counts).
* **Main: Chat**

  * Composer with scope chip group, *Grounded‑only* toggle, *Ask* button.
  * Messages: user bubble; answer card with inline citation badges.
  * **Source drawer**: expands to side‑by‑side preview with highlights; page thumbnails.
* **Right rail: Context Inspector** (top‑k chunks, similarity scores, toggle to include/exclude chunk).

**States**

* Indexing progress (per doc): 0–100% with lightweight skeletons.
* Error toasts: unsupported doc, parse failure, OOM; offer downscaling.

**Keyboard**

* ⌘K focus input; ⌘Enter send; ↑ edit previous question (within 10s).

### 6.3 Compare UI

* **Three panes** (A | B | Summary). Resizable dividers, synced scroll, sticky section headers.
* **Summary Table columns**:

  * Clause/Location
  * Before (trimmed with hover to expand)
  * After (trimmed)
  * Change Type (pill)
  * Risk Note (chip with reason)
  * Suggestion (short imperative)
* **Controls**: Upload A/B; Detectors (Headings on/off); Granularity (Sentence/Token); Export.

---

## 7. Data Model (Client)

```ts
// Files & chunks
interface LegataFile { id: string; name: string; type: 'pdf'|'docx'|'txt'|'md'; size: number; pages?: number; outline?: OutlineItem[]; text?: string; addedAt: number; }
interface OutlineItem { title: string; pageStart?: number; level: number; }
interface Chunk { id: string; fileId: string; text: string; page?: number; start: number; end: number; embedding?: number[]; }

// RAG
interface Retrieval { chunkId: string; score: number; }
interface AnswerSentence { text: string; citations: {fileId: string; page?: number; start: number; end: number;}[] }

// Compare
interface DiffUnit { clause: string; location: string; before: string; after: string; type: 'add'|'delete'|'modify'; risk?: string; suggestion?: string; }
```

---

## 8. Algorithms (Deterministic, Local)

### 8.1 Chunking

* Target 800–1000 tokens; 200‑token overlap.
* Prefer sentence boundaries (Intl.Segmenter or compromise.js). Merge short sentences.

### 8.2 Embedding & Retrieval

* Compute embedding per chunk (transformers.js, all‑MiniLM‑L6‑v2 or similar). Normalize vectors. Cosine similarity. Top‑k default = 6; min score gate = 0.25.

### 8.3 Answer Composition (Grounded‑only)

* For each user query:

  1. Embed query → retrieve top‑k chunks.
  2. Extract sentences most similar to query using inner‑chunk scoring.
  3. Assemble 3–7 sentences, deduplicate, order by (file priority → heading depth → page).
  4. Attach citations per sentence (file/page/range); render as footnote badges.
* Optional **BYO‑LLM**: pass retrieved text and question to API for abstractive summary; still attach citations (keep both extractive and model summary tabs).

### 8.4 Clause Detection (Compare)

* Use headings/numbered patterns (`/^([0-9]+\.)+\s+/`, all‑caps lines, bold). Fallback to paragraph blocks.

### 8.5 Diff & Risk Heuristics

* Run jsdiff at sentence granularity; within modified sentences, run token diff.
* Map to table rows per clause.
* Risk keyword dictionary → attach short notes:

  * Indemnify / Hold Harmless → “Broad indemnity; confirm scope & carve‑outs.”
  * Liability Cap → “Changed cap; check multiples & exclusions.”
  * Termination → “Notice/for‑cause terms altered.”
  * Jurisdiction / Governing Law → “Venue choice modified.”
  * IP Assignment → “Ownership/ licensing terms modified.”
  * Confidentiality → “Duration/scope changed.”
  * Non‑compete / Non‑solicit → “Restrictive covenant updated.”

---

## 9. Settings

* Mode: Local‑only (default) / BYO‑LLM.
* Embedding backend: WebGPU (preferred) / WASM.
* Data: Clear all; Export index (JSON).
* Privacy page link.

---

## 10. Error Handling & Edge Cases

* Large PDFs: show prompt to downsample text only (skip images) to avoid OOM.
* Corrupt DOCX/PDF: surface readable error + link to support docs.
* No relevant chunks: show “No strong matches found. Try adding documents or rephrasing.”
* WebGPU unsupported: auto‑fallback to WASM; show subtle banner.

---

## 11. Accessibility

* Semantic landmarks; focus rings; prefers‑reduced‑motion respected.
* Color contrast ≥ WCAG AA; keyboard operable diff controls.
* Live region for indexing progress.

---

## 12. Telemetry (Local‑only, optional)

* Count of actions (uploads, questions, compares) stored in localStorage for UX tuning; no network calls.

---

## 13. Deliverables

* Production‑ready SPA (`/` landing, `/app` demo) with PWA support.
* Sample dataset: 3 contracts (MSA, NDA, DPA) + 2 policy PDFs (InfoSec, Travel).
* README with build steps and a note on on‑device privacy.

---

## 14. Acceptance Tests (Happy Paths)

1. Upload 2 PDFs + 1 DOCX → Select 2 → Ask “What’s the data retention policy?” → Answer shows 3–5 extractive sentences with [1][2] citations → Clicking [1] opens page preview with highlight.
2. Compare MSA v1 vs v2 → Diff highlights visible → Summary table lists at least 10 rows with change types → Export CSV works.
3. Switch to Local‑only mode → disable API key → answers still produce extractive, cited output.

---

## 15. Visual Components (shadcn/ui)

* **Button** (Primary, Subtle, Ghost)
* **Card** (for features, answer blocks)
* **Tabs** (RAG, Compare, Settings)
* **Table** (Summary)
* **Dialog/Drawer** (Source preview)
* **Progress** (Indexing)
* **Badge** (Citation chips)

---

## 16. Copywriting (initial)

* **Hero**: “Legata — Legal work, less busywork.”
* **Sub**: “On‑device answers with verifiable citations. Compare contracts in minutes.”
* **CTA**: “Try the Local Demo”
* **Privacy badge**: “On‑device • No upload • Exportable citations”
* **Disclaimer**: “Not legal advice. For demonstration only.”

---

## 17. File Structure (suggested)

```
legata/
  index.html
  src/
    main.tsx
    app/
      routes: Landing, AppShell
      components: FileRail, Chat, SourcePreview, ComparePane, SummaryTable, Settings
      lib: chunk.ts, embed.ts, retrieve.ts, diff.ts, heuristics.ts, storage.ts
      workers: embed.worker.ts, parse.worker.ts
    styles/tailwind.css
  public/
    samples/ (MSA_v1.docx, MSA_v2.docx, NDA.pdf, DPA.pdf, Policy_Infosec.pdf)
  vite.config.ts
  manifest.webmanifest
```

---

## 18. Deployment

* Static hosting (Vercel/Netlify/GitHub Pages). No server required.

---

## 19. Future Iterations (not required for this demo)

* Redline export to DOCX with tracked changes.
* Multi‑doc compare; clause mapping to playbooks.
* Role‑based templates and risk policies.

---

**End of PRD**
