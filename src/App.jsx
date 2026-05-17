import { useState } from 'react'
import { useStorage } from './hooks/useStorage'
import { APP_NAME, APP_TAGLINE, APP_EMOJI, COLLEZIONI_DEFAULT, PRODOTTI_DEFAULT } from './constants'
import MaterialeCard     from './components/MaterialeCard'
import MaterialeModal    from './components/MaterialeModal'
import CollezioneModal   from './components/CollezioneModal'
import AccostamentoModal from './components/AccostamentoModal'
import ProdottoCard      from './components/ProdottoCard'
import ProdottoModal     from './components/ProdottoModal'
import AnalisiDashboard  from './components/AnalisiDashboard'
import { Btn } from './components/ui'

const TABS = [
  { id: 'collezioni', label: '🧶 Materiali' },
  { id: 'prodotti',   label: '👜 Prodotti'  },
  { id: 'analisi',    label: '📊 Analisi'   },
]

export default function App() {
  const [collezioni, setCollezioni] = useStorage('atelier-v2-collezioni', COLLEZIONI_DEFAULT)
  const [prodotti,   setProdotti]   = useStorage('atelier-v2-prodotti',   PRODOTTI_DEFAULT)
  const [activeCol,  setActiveCol]  = useStorage('atelier-v2-col',        COLLEZIONI_DEFAULT[0]?.id)
  const [tab,        setTab]        = useState('collezioni')

  const [modal,  setModal]  = useState(null)
  const [target, setTarget] = useState(null)
  const [cerca,  setCerca]  = useState('')

  const collezione = collezioni.find(c => c.id === activeCol)

  // ── Collezioni ───────────────────────────────────────────────
  function salvaCollezione(data) {
    const esiste = collezioni.find(c => c.id === data.id)
    if (esiste) setCollezioni(collezioni.map(c => c.id === data.id ? { ...c, ...data } : c))
    else { setCollezioni([...collezioni, data]); setActiveCol(data.id) }
    setModal(null)
  }
  function eliminaCollezione(id) {
    if (!confirm('Eliminare questa collezione e tutti i suoi materiali?')) return
    const nuove = collezioni.filter(c => c.id !== id)
    setCollezioni(nuove)
    if (activeCol === id) setActiveCol(nuove[0]?.id || null)
  }

  // ── Materiali ────────────────────────────────────────────────
  function salvaMateriale(data) {
    setCollezioni(collezioni.map(c => {
      if (c.id !== activeCol) return c
      const esiste = c.materiali.find(m => m.id === data.id)
      return { ...c, materiali: esiste ? c.materiali.map(m => m.id === data.id ? data : m) : [...c.materiali, data] }
    }))
    setModal(null)
  }
  function eliminaMateriale(id) {
    setCollezioni(collezioni.map(c =>
      c.id === activeCol ? { ...c, materiali: c.materiali.filter(m => m.id !== id) } : c
    ))
  }

  // ── Prodotti ─────────────────────────────────────────────────
  function salvaProdotto(data) {
    const esiste = prodotti.find(p => p.id === data.id)
    setProdotti(esiste ? prodotti.map(p => p.id === data.id ? data : p) : [...prodotti, data])
    setModal(null)
  }
  function eliminaProdotto(id) {
    if (!confirm('Eliminare questo prodotto?')) return
    setProdotti(prodotti.filter(p => p.id !== id))
  }
  function toggleVenduto(id) {
    setProdotti(prodotti.map(p => p.id === id ? { ...p, venduto: !p.venduto } : p))
  }

  // ── Filtro ───────────────────────────────────────────────────
  const matFiltrati = (collezione?.materiali || []).filter(m =>
    !cerca || m.nome.toLowerCase().includes(cerca.toLowerCase()) || m.note?.toLowerCase().includes(cerca.toLowerCase())
  )
  const prodFiltrati = prodotti.filter(p =>
    !cerca || p.nome.toLowerCase().includes(cerca.toLowerCase())
  )

  return (
    <div style={{ minHeight: '100vh' }}>

      {/* ── Header ───────────────────────────────────────────── */}
      <header style={{
        background: 'var(--surface)', backdropFilter: 'blur(16px)',
        borderBottom: '1px solid var(--border)',
        padding: '14px 22px',
        position: 'sticky', top: 0, zIndex: 50,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12,
      }}>
        <div>
          <div style={{ fontFamily: 'var(--ff-display)', fontSize: 24, fontWeight: 700, letterSpacing: -0.3 }}>
            {APP_EMOJI} {APP_NAME}
          </div>
          <div style={{ fontSize: 10, color: 'var(--text-3)', letterSpacing: 1.8, textTransform: 'uppercase', marginTop: 1 }}>
            {APP_TAGLINE}
          </div>
        </div>

        {/* Tab navigazione */}
        <nav style={{ display: 'flex', gap: 4, background: 'var(--surface-2)', borderRadius: 'var(--r-pill)', padding: 4 }}>
          {TABS.map(t => (
            <button key={t.id} onClick={() => { setTab(t.id); setCerca('') }}
              style={{
                padding: '7px 14px', borderRadius: 'var(--r-pill)',
                border: 'none', fontSize: 13, fontWeight: 700,
                background: tab === t.id ? 'var(--surface-s)' : 'transparent',
                color: tab === t.id ? 'var(--accent)' : 'var(--text-3)',
                boxShadow: tab === t.id ? 'var(--shadow-s)' : 'none',
                transition: 'all 0.18s', cursor: 'pointer',
              }}>
              {t.label}
            </button>
          ))}
        </nav>
      </header>

      <main style={{ padding: '20px 16px', maxWidth: 800, margin: '0 auto' }}>

        {/* ══════════ TAB: MATERIALI ══════════ */}
        {tab === 'collezioni' && (<>
          {/* Tab collezioni */}
          <div style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 6, marginBottom: 20 }}>
            {collezioni.map(c => (
              <button key={c.id} onClick={() => { setActiveCol(c.id); setCerca('') }}
                style={{
                  flexShrink: 0, padding: '8px 16px', borderRadius: 'var(--r-pill)',
                  border: activeCol === c.id ? 'none' : '1.5px solid var(--border-s)',
                  background: activeCol === c.id ? c.colore : 'rgba(255,252,247,0.7)',
                  color: activeCol === c.id ? '#fff' : 'var(--text-2)',
                  fontWeight: 700, fontSize: 13,
                  boxShadow: activeCol === c.id ? `0 4px 14px ${c.colore}55` : 'none',
                  transition: 'all 0.18s',
                }}>
                {c.nome}
              </button>
            ))}
            <button onClick={() => { setTarget(null); setModal('nuovaCol') }}
              style={{ flexShrink: 0, padding: '8px 16px', borderRadius: 'var(--r-pill)', border: '1.5px dashed var(--border-s)', background: 'none', color: 'var(--text-3)', fontWeight: 700, fontSize: 13, cursor: 'pointer' }}>
              + Collezione
            </button>
          </div>

          {collezione ? (<>
            {/* Intestazione collezione */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 18, gap: 10 }}>
              <div>
                <h1 style={{ fontFamily: 'var(--ff-display)', fontSize: 30, fontWeight: 700, letterSpacing: -0.5, lineHeight: 1.1 }}>
                  {collezione.nome}
                </h1>
                {collezione.descrizione && <p style={{ fontSize: 14, color: 'var(--text-3)', marginTop: 4 }}>{collezione.descrizione}</p>}
                <p style={{ fontSize: 12, color: 'var(--text-3)', marginTop: 4 }}>{collezione.materiali.length} materiali</p>
              </div>
              <div style={{ display: 'flex', gap: 8, flexShrink: 0, flexWrap: 'wrap', justifyContent: 'flex-end' }}>
                <Btn small outline onClick={() => setModal('accostamento')}>🎨 Accostamenti</Btn>
                <Btn small outline onClick={() => { setTarget(collezione); setModal('editCol') }}>✏️</Btn>
                {collezioni.length > 1 && (
                  <Btn small outline color="var(--cat-fili)" onClick={() => eliminaCollezione(collezione.id)}>🗑</Btn>
                )}
                <Btn small color="var(--accent)" onClick={() => { setTarget(null); setModal('nuovoMat') }}>
                  + Materiale
                </Btn>
              </div>
            </div>

            {/* Ricerca */}
            {collezione.materiali.length > 3 && (
              <input value={cerca} onChange={e => setCerca(e.target.value)} placeholder="🔍 Cerca materiale…"
                style={{ width: '100%', padding: '10px 16px', borderRadius: 'var(--r-pill)', border: '1.5px solid var(--border-s)', fontSize: 14, background: 'rgba(255,252,247,0.9)', outline: 'none', fontFamily: 'var(--ff-body)', boxSizing: 'border-box', marginBottom: 16 }} />
            )}

            {matFiltrati.length === 0 ? (
              <EmptyState icon="🧵" title={cerca ? 'Nessun materiale trovato' : 'Nessun materiale'} cta={!cerca && (
                <Btn color="var(--accent)" onClick={() => setModal('nuovoMat')}>+ Aggiungi il primo materiale</Btn>
              )} />
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 14 }}>
                {matFiltrati.map(m => (
                  <MaterialeCard key={m.id} mat={m}
                    onEdit={m => { setTarget(m); setModal('editMat') }}
                    onDelete={eliminaMateriale} />
                ))}
              </div>
            )}
          </>) : (
            <EmptyState icon="🪡" title="Crea la tua prima collezione!" />
          )}
        </>)}

        {/* ══════════ TAB: PRODOTTI ══════════ */}
        {tab === 'prodotti' && (<>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18, gap: 10 }}>
            <div>
              <h1 style={{ fontFamily: 'var(--ff-display)', fontSize: 30, fontWeight: 700, letterSpacing: -0.5 }}>
                I miei prodotti
              </h1>
              <p style={{ fontSize: 13, color: 'var(--text-3)', marginTop: 4 }}>
                {prodotti.filter(p => p.venduto).length} venduti · {prodotti.filter(p => !p.venduto).length} in stock
              </p>
            </div>
            <Btn color="var(--accent)" onClick={() => { setTarget(null); setModal('nuovoProd') }}>
              + Prodotto
            </Btn>
          </div>

          {prodotti.length > 3 && (
            <input value={cerca} onChange={e => setCerca(e.target.value)} placeholder="🔍 Cerca prodotto…"
              style={{ width: '100%', padding: '10px 16px', borderRadius: 'var(--r-pill)', border: '1.5px solid var(--border-s)', fontSize: 14, background: 'rgba(255,252,247,0.9)', outline: 'none', fontFamily: 'var(--ff-body)', boxSizing: 'border-box', marginBottom: 16 }} />
          )}

          {prodFiltrati.length === 0 ? (
            <EmptyState icon="👜" title="Nessun prodotto ancora" cta={
              <Btn color="var(--accent)" onClick={() => setModal('nuovoProd')}>+ Aggiungi il primo prodotto</Btn>
            } />
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(185px, 1fr))', gap: 14 }}>
              {prodFiltrati.map(p => (
                <ProdottoCard key={p.id} prod={p}
                  onEdit={p => { setTarget(p); setModal('editProd') }}
                  onDelete={eliminaProdotto}
                  onToggleVenduto={toggleVenduto} />
              ))}
            </div>
          )}
        </>)}

        {/* ══════════ TAB: ANALISI ══════════ */}
        {tab === 'analisi' && (
          <AnalisiDashboard collezioni={collezioni} prodotti={prodotti} />
        )}

      </main>

      {/* ── Modali ──────────────────────────────────────────── */}
      {(modal === 'nuovaCol' || modal === 'editCol') && (
        <CollezioneModal editData={modal === 'editCol' ? target : null} onSave={salvaCollezione} onClose={() => setModal(null)} />
      )}
      {(modal === 'nuovoMat' || modal === 'editMat') && (
        <MaterialeModal editData={modal === 'editMat' ? target : null} onSave={salvaMateriale} onClose={() => setModal(null)} />
      )}
      {(modal === 'nuovoProd' || modal === 'editProd') && (
        <ProdottoModal editData={modal === 'editProd' ? target : null} onSave={salvaProdotto} onClose={() => setModal(null)} />
      )}
      {modal === 'accostamento' && collezione && (
        <AccostamentoModal collezione={collezione} onClose={() => setModal(null)} />
      )}
    </div>
  )
}

function EmptyState({ icon, title, cta }) {
  return (
    <div style={{ textAlign: 'center', padding: '56px 20px', color: 'var(--text-3)' }}>
      <div style={{ fontSize: 52, marginBottom: 14 }}>{icon}</div>
      <div style={{ fontFamily: 'var(--ff-display)', fontSize: 18, marginBottom: 14 }}>{title}</div>
      {cta}
    </div>
  )
}
