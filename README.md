# Legata — Local Web Demo

A frontend‑only demo per `prd.md`:

- Landing page with trust cues and CTA
- App shell (`/app`) with tabs: RAG Q&A, Compare, Settings
- Local parsing (TXT/MD/DOCX/PDF), chunking, on‑device embeddings (transformers.js), cosine retrieval
- Extractive, cited answers (Grounded‑only)
- Three‑pane compare with structured change table and CSV/Markdown export
- PWA installable; offline after first load

## Getting Started

Prerequisites: Node 18+

```bash
npm install
npm run dev
```

Open http://localhost:5173

- “Try the Local Demo” opens `/app`
- “See a Sample Case” preloads small TXT samples under `public/samples/`

Build:

```bash
npm run build
npm run preview
```

## Notes

- On first embedding, the model loads in‑browser via `@xenova/transformers`, and is cached by the browser thereafter. This demo runs entirely locally by default.
- PDF text extraction uses pdf.js. For very large PDFs, extraction may be slow; consider downsampling to text.
- The RAG answer is extractive: sentences are assembled from retrieved chunks with inline citation badges; you can export to Markdown.
- Compare builds a clause‑level table using heuristics (headings, numbering) and jsdiff for sentence/token diffs. Exports available as CSV/Markdown.

## Privacy

Your files and embeddings stay in this browser (IndexedDB/local memory). No network calls are made unless you opt‑in to enter an API key in Settings. This demo is not legal advice.

