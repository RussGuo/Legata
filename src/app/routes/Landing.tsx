import { Link, useNavigate } from 'react-router-dom'
import { ShieldCheck, FileText, Replace, ArrowRight, Lock, Cpu, Database, Quote } from 'lucide-react'
import heroBg from '../../screenshot-20251102-162335.png'

export default function Landing() {
  const nav = useNavigate()
  return (
    <div className="min-h-screen bg-bg-canvas text-fg-primary">
      <header className="sticky top-0 bg-bg-surface/95 backdrop-blur border-b border-line">
        <div className="mx-auto max-w-container px-6 h-16 md:h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="font-semibold tracking-tight">Legata</div>
            <div className="w-px h-4 bg-line" />
          </div>
          <nav className="hidden sm:flex items-center gap-8 text-small text-fg-secondary">
            <a href="#features" className="hover:text-accent transition">Features</a>
            <a href="#how" className="hover:text-accent transition">How it works</a>
            <a href="#privacy" className="hover:text-accent transition">Privacy</a>
          </nav>
          <button onClick={() => nav('/app')} className="px-4 py-2 btn-primary">Run Demo</button>
        </div>
      </header>

      <main>
        {/* Hero — minimal, with background screenshot and overlays */}
        <section className="relative overflow-hidden md:min-h-[calc(100vh-64px)]">
          {/* Background */}
          <img src={heroBg} alt="Legata interface background" className="pointer-events-none select-none absolute inset-0 w-full h-full object-cover scale-105 opacity-90 blur-[1px] md:blur-[2px] saturate-[1] contrast-[1]" />
          <div className="absolute inset-0 bg-gradient-to-b from-bg-canvas/70 via-bg-canvas/60 to-bg-canvas/50" />
          <div className="absolute inset-0 legal-stripes" style={{ opacity: .08 }} />

          {/* Foreground (bottom-right composition) */}
          <div className="relative z-10 mx-auto max-w-container h-[calc(100vh-64px)] px-6">
            <div className="absolute bottom-10 right-6 md:bottom-20 md:right-12 max-w-prose text-right">
              <div className="font-serif font-semibold tracking-[-0.02em] leading-none text-[min(18vw,6rem)] mb-2">Legata</div>
              <h1 className="font-serif font-semibold text-[2.5rem] md:text-[3rem] leading-[1.15] tracking-[-0.01em]">
                The AI Assistant that Unlocks<br/>In‑House Legal Productivity
              </h1>
              <div className="mt-6 flex gap-3 justify-end">
                <button onClick={() => nav('/app')} className="px-5 py-3 btn-primary">Run Local Demo</button>
              </div>
              <div className="mt-2">
                <Link to={{ pathname: '/app', search: '?sample=1' }} className="text-small text-fg-secondary hover:text-accent underline-offset-2 hover:underline">See a Sample Case</Link>
              </div>
            </div>
          </div>
        </section>

        {/* Proof strip */}
        <section className="mx-auto max-w-container px-6 py-8 border-t border-line">
          <div className="text-small text-fg-secondary mb-3">Trusted by legal & ops teams</div>
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-6 items-center">
            {['Sample','Sample','Sample','Sample','Sample','Sample'].map((t,i)=>(
              <div key={i} className="h-8 rounded-sm bg-[#EEF1F7] legal-stripes flex items-center justify-center text-fg-secondary/60 text-[12px]">{t}</div>
            ))}
          </div>
        </section>

        {/* Value pillars */}
        <section id="features" className="mx-auto max-w-container px-6 py-16 border-t border-line">
          <div className="grid md:grid-cols-3 gap-6">
            <PillarCard icon={<FileText strokeWidth={1.5} className="text-fg-secondary" />} title="Cut time‑to‑answer" desc="Verifiable citations; typical answers in under 3 seconds." />
            <PillarCard icon={<Replace strokeWidth={1.5} className="text-fg-secondary" />} title="Accelerate review" desc="Clause‑level diffs with structured summaries and risk notes." />
            <PillarCard icon={<ShieldCheck strokeWidth={1.5} className="text-fg-secondary" />} title="Preserve privacy" desc="On‑device processing by default. No uploads." />
          </div>
        </section>

        {/* Live demo teaser */}
        <section className="mx-auto max-w-container px-6 py-16 border-t border-line grid md:grid-cols-2 gap-6 items-center">
          <div>
            <h2 className="mb-2">Run the local demo</h2>
            <p className="text-fg-secondary max-w-prose">Ask a question and get a cited, grounded answer. Then compare two contract versions and review a clause‑level summary table. Data stays in this browser.</p>
            <div className="mt-4 flex gap-3">
              <button onClick={() => nav('/app')} className="px-4 py-2 btn-primary">Run Local Demo</button>
              <Link to={{ pathname: '/app', search: '?sample=1' }} className="px-4 py-2 btn-ghost">See a Sample Case</Link>
            </div>
          </div>
          <div>
            <HeroSequence />
          </div>
        </section>

        {/* How it works */}
        <section id="how" className="mx-auto max-w-container px-6 py-16 border-t border-line">
          <h2 className="mb-6">How It Works</h2>
          <ol className="grid md:grid-cols-3 gap-6 text-fg-secondary">
            <li className="border border-line rounded-md p-5 bg-bg-surface">¹ Upload documents</li>
            <li className="border border-line rounded-md p-5 bg-bg-surface">² Select scope</li>
            <li className="border border-line rounded-md p-5 bg-bg-surface">³ Ask or Compare</li>
          </ol>
        </section>

        {/* Privacy & Security */}
        <section id="privacy" className="mx-auto max-w-container px-6 py-16 border-t border-line">
          <h2 className="mb-4">Privacy & Security</h2>
          <div className="grid md:grid-cols-3 gap-6">
            <InfoCard icon={<Lock strokeWidth={1.5} className="text-fg-secondary" />} title="On‑device by default" desc="Processing runs locally. No uploads unless you opt‑in." />
            <InfoCard icon={<Cpu strokeWidth={1.5} className="text-fg-secondary" />} title="Optional BYO API key" desc="Augment with your key; calls remain in browser." />
            <InfoCard icon={<Database strokeWidth={1.5} className="text-fg-secondary" />} title="Ephemeral sessions" desc="One‑click incognito clears data on exit." />
          </div>
          <div className="mt-4 text-small text-fg-secondary">PWA · offline after first load</div>
        </section>

        {/* Final CTA */}
        <section className="mx-auto max-w-container px-6 py-16 border-t border-line">
          <div className="border border-line rounded-lg p-6 bg-bg-surface flex flex-col md:flex-row items-center justify-between gap-4">
            <div>
              <h3 className="mb-1">Ready to review faster?</h3>
              <div className="text-fg-secondary">Run the local demo or download a sample pack.</div>
            </div>
            <div className="flex gap-3">
              <button onClick={() => nav('/app')} className="px-4 py-2 btn-primary">Run Local Demo</button>
              <a href="#" className="px-4 py-2 btn-ghost">Download Sample Pack</a>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-line mt-10">
        <div className="mx-auto max-w-container px-6 h-16 flex items-center justify-between text-small text-fg-secondary">
          <span>© {new Date().getFullYear()} Legata</span>
          <span>Demo v0.1 • Not legal advice</span>
        </div>
      </footer>
    </div>
  )
}

function PillarCard({ icon, title, desc }: { icon: React.ReactNode; title: string; desc: string }) {
  return (
    <div className="border border-line rounded-md p-6 bg-bg-surface shadow-elev-1">
      <div className="h-px bg-line mb-3" />
      <div className="flex items-center gap-2 mb-2 text-fg-primary">{icon} <span className="font-medium">{title}</span></div>
      <p className="text-fg-secondary text-small leading-relaxed">{desc}</p>
      <div className="mt-3 text-small text-accent inline-flex items-center gap-1">See how it works <ArrowRight size={14}/></div>
    </div>
  )
}

function HeroComposite() {
  return (
    <div className="relative">
      {/* paper/stripes background */}
      <div className="absolute inset-0 rounded-lg paper-texture" />
      {/* Answer card */}
      <div className="relative card-surface p-5 mb-6 translate-y-1 fade-up" style={{ transform: 'translateY(4px)' }}>
        <div className="text-small text-fg-secondary mb-2">Answer · Grounded with citations</div>
        <p className="leading-relaxed">Data retention is limited to 90 days for standard records <sup className="fade-up-delayed-1">[1]</sup>, with exceptions for litigation hold <sup className="fade-up-delayed-2">[2]</sup>.</p>
        <div className="mt-3 text-[12px] text-fg-secondary">[1] MSA v2 §4.2 · [2] DPA §8.1</div>
      </div>
      {/* Compare card */}
      <div className="relative card-surface p-4 rotate-[1.5deg] fade-up-delayed-3">
        <div className="text-small text-fg-secondary mb-2">Contract Compare · Summary</div>
        <div className="grid grid-cols-3 gap-2 text-[12px]">
          <div className="p-2 border border-line rounded-sm bg-bg-surface">A</div>
          <div className="p-2 border border-line rounded-sm bg-bg-surface">B</div>
          <div className="p-2 border border-line rounded-sm bg-bg-surface">
            <span className="pill pill-add mr-1">Add</span>
            <span className="pill pill-del mr-1">Delete</span>
            <span className="pill pill-mod">Modify</span>
          </div>
        </div>
      </div>
    </div>
  )
}

function HeroSequence() {
  return (
    <div className="grid gap-3">
      <div className="card-surface p-4">
        <div className="text-small text-fg-secondary mb-1">1</div>
        <div className="h-3 bg-[#EDF1F7] rounded w-5/6 mb-1" />
        <div className="h-3 bg-[#EDF1F7] rounded w-4/6" />
      </div>
      <div className="card-surface p-4">
        <div className="text-small text-fg-secondary mb-1">2</div>
        <div className="h-3 bg-[#EDF1F7] rounded w-3/4 mb-1" />
        <div className="h-3 bg-[#EDF1F7] rounded w-2/4" />
      </div>
      <div className="card-surface p-4">
        <div className="text-small text-fg-secondary mb-1">3</div>
        <div className="h-3 bg-[#EDF1F7] rounded w-4/5 mb-1" />
        <div className="h-3 bg-[#EDF1F7] rounded w-3/5" />
      </div>
    </div>
  )
}

function InfoCard({ icon, title, desc }: { icon: React.ReactNode; title: string; desc: string }) {
  return (
    <div className="border border-line rounded-md p-6 bg-bg-surface">
      <div className="flex items-center gap-2 mb-2">{icon}<span className="font-medium">{title}</span></div>
      <p className="text-fg-secondary text-small leading-relaxed">{desc}</p>
    </div>
  )
}
