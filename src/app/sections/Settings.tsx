import { useEffect, useState } from 'react'

export default function Settings() {
  const [mode, setMode] = useState<'local'|'llm'>('local')
  const [apiKey, setApiKey] = useState('')
  const [backend, setBackend] = useState<'webgpu'|'wasm'>('webgpu')

  useEffect(() => {
    const stored = localStorage.getItem('legata.settings')
    if (stored) {
      try { const s = JSON.parse(stored); setMode(s.mode || 'local'); setApiKey(s.apiKey || ''); setBackend(s.backend || 'webgpu') } catch {}
    }
  }, [])

  function save() {
    localStorage.setItem('legata.settings', JSON.stringify({ mode, apiKey, backend }))
    alert('Settings saved locally.')
  }

  function clearData() {
    indexedDB.databases?.().then(dbs => {
      dbs?.forEach(db => db.name && indexedDB.deleteDatabase(db.name!))
      localStorage.clear()
      alert('Cleared local data. Reload recommended.')
    })
  }

  return (
    <div className="mx-auto max-w-container px-6 py-8">
      <h2 className="text-2xl font-semibold mb-6">Settings</h2>
      <div className="space-y-6">
        <div>
          <div className="font-medium mb-2">Mode</div>
          <div className="flex items-center gap-3">
            <label className="inline-flex items-center gap-2"><input type="radio" checked={mode==='local'} onChange={() => setMode('local')} /> Local‑only</label>
            <label className="inline-flex items-center gap-2"><input type="radio" checked={mode==='llm'} onChange={() => setMode('llm')} /> BYO‑LLM</label>
          </div>
        </div>
        {mode === 'llm' && (
          <div>
            <div className="font-medium mb-2">OpenAI‑compatible API key</div>
            <input value={apiKey} onChange={e => setApiKey(e.target.value)} className="w-full field px-3 py-2" placeholder="sk-..." />
            <div className="text-[12px] text-fg-secondary mt-1">Calls are made from your browser only.</div>
          </div>
        )}
        <div>
          <div className="font-medium mb-2">Embedding backend</div>
          <select value={backend} onChange={e => setBackend(e.target.value as any)} className="field px-3 py-2">
            <option value="webgpu">WebGPU (preferred)</option>
            <option value="wasm">WASM (fallback)</option>
          </select>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={save} className="px-4 py-2 btn-primary">Save</button>
          <button onClick={clearData} className="px-4 py-2 btn-ghost">Clear all data</button>
        </div>
        <div className="text-small text-fg-secondary border-t border-line pt-4">
          This demo is not legal advice. Files and embeddings remain on device.
        </div>
      </div>
    </div>
  )
}
