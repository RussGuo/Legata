import { useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import RAG from '../sections/RAG'
import Compare from '../sections/Compare'
import Settings from '../sections/Settings'

type Tab = 'rag' | 'compare' | 'settings'

export default function AppShell() {
  const [tab, setTab] = useState<Tab>('rag')
  const [params] = useSearchParams()
  const sample = params.get('sample') === '1'

  return (
    <div className="min-h-screen bg-bg-canvas text-fg-primary">
      <header className="sticky top-0 bg-bg-surface/95 backdrop-blur border-b border-line">
        <div className="mx-auto max-w-container px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="font-semibold tracking-tight">Legata</div>
            <div className="w-px h-4 bg-line" />
          </div>
          <nav className="flex items-center gap-2 text-small">
            <TabButton label="RAG Q&A" active={tab==='rag'} onClick={() => setTab('rag')} />
            <TabButton label="Compare" active={tab==='compare'} onClick={() => setTab('compare')} />
            <TabButton label="Settings" active={tab==='settings'} onClick={() => setTab('settings')} />
          </nav>
        </div>
      </header>

      {tab === 'rag' && <RAG preloadSamples={sample} />}
      {tab === 'compare' && <Compare preloadSamples={sample} />}
      {tab === 'settings' && <Settings />}
    </div>
  )
}

function TabButton({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button onClick={onClick} className={`px-3 py-1 rounded-md transition border ${active ? 'bg-accent border-accent text-white' : 'bg-bg-surface border-line hover:bg-white'}`}>{label}</button>
  )
}
