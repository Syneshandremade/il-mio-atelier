import { useState, useEffect } from 'react'
import { supabase }            from './supabase'
import { useSupabaseData }     from './hooks/useSupabase'
import Auth                    from './Auth'
import { APP_NAME, APP_TAGLINE, APP_EMOJI, CAT_IMBALLAGGI } from './constants'
import MaterialeCard     from './components/MaterialeCard'
import MaterialeModal    from './components/MaterialeModal'
import CollezioneModal   from './components/CollezioneModal'
import AccostamentoModal from './components/AccostamentoModal'
import ProdottoCard      from './components/ProdottoCard'
import ProdottoModal     from './components/ProdottoModal'
import AnalisiDashboard  from './components/AnalisiDashboard'
import { Btn }           from './components/ui'

const TABS = [
  { id: 'materiali',  emoji: '🧶', label: 'Materiali'  },
  { id: 'imballaggi', emoji: '📦', label: 'Imballaggi' },
  { id: 'prodotti',   emoji: '👜', label: 'Prodotti'   },
  { id: 'analisi',    emoji: '📊', label: 'Analisi'    },
]

export default function App() {
  const [session,   setSession]   = useState(null)
  const [authLoad,  setAuthLoad]  = useState(true)
  const [tab,       setTab]       = useState('materiali')
  const [activeCol, setActiveCol] = useState(null)
  const [modal,     setModal]     = useState(null)
  const [target,    setTarget]    = useState(null)
  const [cerca,     setCerca]     = useState('')

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session); setAuthLoad(false)
    })
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, session) => {
      setSession(session)
    })
    return () => subscription.unsubscribe()
  }, [])

  const userId = session?.user?.id

  const colDB  = useSupabaseData('collezioni', [], userId)
  const imbDB  = useSupabaseData('imballaggi', [], userId)
  const prodDB = useSupabaseData('prodotti',   [], userId)

  const collezioni = colDB.data
  const imballaggi = imbDB.data
  const prodotti   = prodDB.data

  useEffect(() => {
    if (!activeCol && collezioni.length > 0) setActiveCol(collezioni[0].id)
  }, [collezioni, activeCol])

  const collezione = collezioni.find(c => c.id === activeCol)

  const tuttiMateriali = [
    ...collezioni.flatMap(c => (c.materiali || []).map(m => ({ ...m, _collezione: c.nome }))),
    ...imballaggi.map(m => ({ ...m, _collezione: '📦 Imballaggi' })),
  ]

  async function logout() { await supabase.auth.signOut() }

  async function salvaCollezione(data) {
    await colDB.salva(data); setActiveCol(data.id); setModal(null)
  }
  async function eliminaCollezione(id) {
    if (!confirm('Eliminare questa collezione e tutti i suoi materiali?')) return
    await colDB.elimina(id)
    setActiveCol(collezioni.filter(c => c.id !== id)[0]?.id || null)
  }
  async function salvaMateriale(mat) {
    const col = collezioni.find(c => c.id === activeCol)
    if (!col) return
    const esiste = (col.materiali || []).find(m => m.id === mat.id)
    const nuoviMat = esiste
      ? col.materiali.map(m => m.id === mat.id ? mat : m)
      : [...(col.materiali || []), mat]
    await colDB.salva({ ...col, materiali: nuoviMat })
    setModal(null)
  }
  async function eliminaMateriale(id) {
    const col = collezioni.find(c => c.id === activeCol)
    if (!col) return
    await colDB.salva({ ...col, materiali: col.materiali.filter(m => m.id !== id) })
  }
  async function salvaImballaggio(data) { await imbDB.salva(data); setModal(null) }
  async function eliminaImballaggio(id) { await imbDB.elimina(id) }
  async function salvaProdotto(data) { await prodDB.salva(data); setModal(null) }
  async function eliminaProdotto(id) {
    if (!confirm('Eliminare questo prodotto?')) return
    await prodDB.elimina(id)
  }
  async function toggleVenduto(id) {
    const prod = prodotti.find(p => p.id === id)
    if (!prod) return
    const nuovoVenduto = !prod.venduto
    await prodDB.salva({ ...prod, venduto: nuovoVenduto, dataVendita: nuovoVenduto ? Date.now() : null })
  }

  const matFiltrati  = (collezione?.materiali || []).filter(m => !cerca || m.nome.toLowerCase().includes(cerca.toLowerCase()))
  const imbFiltrati  = imballaggi.filter(m => !cerca || m.nome.toLowerCase().includes(cerca.toLowerCase()))
  const prodFiltrati = prodotti.filter(p => !cerca || p.nome.toLowerCase().includes(cerca.toLowerCase()))

  if (authLoad) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg)' }}>
      <div style={{ fontFamily: 'var(--ff-display)', fontSize: 22, color: 'var(--text-3)' }}>🪡 Caricamento…</div>
    </div>
  )

  if (!session) return <Auth />

  if (colDB.loading || imbDB.loading || prodDB.loading) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg)' }}>
      <div style={{ fontFamily: 'var(--ff-display)', fontSize: 22, color: 'var(--text-3)' }}>🪡 Caricamento dati…</div>
    </div>
  )

  return (
    <div className="app-layout">

      {/* ── Sidebar ── */}
      <aside className="sidebar">
        <div className="sidebar-logo">
          <div style={{ fontFamily: 'var(--ff-display)', fontSize: 20, fontWeight: 700, letterSpacing: -0.3 }}>
            {APP_EMOJI} {APP_NAME}
          </div>
          <div style={{ fontSize: 10, color: 'var(--text-3)', letterSpacing: 1.6, textTransform: 'uppercase', marginTop: 3 }}>
            {APP_TAGLINE}
          </div>
        </div>

        <nav className="sidebar-nav">
          {TABS.map(t => (
            <button
              key={t.id}
              className={`nav-item${tab === t.id ? ' active' : ''}`}
              onClick={() => { setTab(t.id); setCerca('') }}
            >
              <span className="nav-emoji">{t.emoji}</span>
              {t.label}
            </button>
          ))}
        </nav>

        <div className="sidebar-footer">
          <button className="logout-btn" onClick={logout}>
            <span style={{ fontSize: 18 }}>🚪</span>
            Esci
          </button>
        </div>
      </aside>

      {/* ── Contenuto principale ── */}
      <main className="main-content">
        <div style={{ padding: '28px 24px', maxWidth: 780, margin: '0 auto' }}>

          {tab === 'materiali' && (<>
            <div style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 6, marginBottom: 22 }}>
              {collezioni.map(c => (
                <button key={c.id} onClick={() => { setActiveCol(c.id); setCerca('') }}
                  style={{ flexShrink: 0, padding: '8px 18px', borderRadius: 'var(--r-pill)', border: activeCol === c.id ? 'none' : '1.5px solid var(--border-s)', background: activeCol === c.id ? c.colore : 'rgba(255,252,247,0.7)', color: activeCol === c.id ? '#fff' : 'var(--text-2)', fontWeight: 700, fontSize: 13, boxShadow: activeCol === c.id ? `0 4px 14px ${c.colore}55` : 'none', transition: 'all 0.18s', cursor: 'pointer' }}>
                  {c.nome}
                </button>
              ))}
              <button onClick={() => { setTarget(null); setModal('nuovaCol') }}
                style={{ flexShrink: 0, padding: '8px 18px', borderRadius: 'var(--r-pill)', border: '1.5px dashed var(--border-s)', background: 'none', color: 'var(--text-3)', fontWeight: 700, fontSize: 13, cursor: 'pointer' }}>
                + Collezione
              </button>
            </div>

            {collezione ? (<>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20, gap: 10 }}>
                <div>
                  <h1 style={{ fontFamily: 'var(--ff-display)', fontSize: 30, fontWeight: 700, letterSpacing: -0.5 }}>{collezione.nome}</h1>
                  {collezione.descrizione && <p style={{ fontSize: 14, color: 'var(--text-3)', marginTop: 4 }}>{collezione.descrizione}</p>}
                  <p style={{ fontSize: 12, color: 'var(--text-3)', marginTop: 4 }}>{(collezione.materiali||[]).length} materiali</p>
                </div>
                <div style={{ display: 'flex', gap: 7, flexShrink: 0, flexWrap: 'wrap', justifyContent: 'flex-end' }}>
                  <Btn small outline onClick={() => setModal('accostamento')}>🎨 Accostamenti</Btn>
                  <Btn small outline onClick={() => { setTarget(collezione); setModal('editCol') }}>✏️</Btn>
                  {collezioni.length > 1 && <Btn small outline color="var(--cat-fili)" onClick={() => eliminaCollezione(collezione.id)}>🗗</Btn>}
                  <Btn small color="var(--accent)" onClick={() => { setTarget(null); setModal('nuovoMat') }}>+ Materiale</Btn>
                </div>
              </div>
              {(collezione.materiali||[]).length > 3 && (
                <input value={cerca} onChange={e => setCerca(e.target.value)} placeholder="🔍 Cerca materiale…"
                  style={{ width: '100%', padding: '10px 16px', borderRadius: 'var(--r-pill)', border: '1.5px solid var(--border-s)', fontSize: 14, background: 'rgba(255,252,247,0.9)', outline: 'none', fontFamily: 'var(--ff-body)', boxSizing: 'border-box', marginBottom: 18 }} />
              )}
              {matFiltrati.length === 0
                ? <EmptyState icon="🧵" title={cerca ? 'Nessun risultato' : 'Nessun materiale'} cta={!cerca && <Btn color="var(--accent)" onClick={() => setModal('nuovoMat')}>+ Aggiungi il primo materiale</Btn>} />
                : <Grid>{matFiltrati.map(m => <MaterialeCard key={m.id} mat={m} onEdit={m => { setTarget(m); setModal('editMat') }} onDelete={eliminaMateriale} />)}</Grid>
              }
            </>) : (
              <EmptyState icon="🪡" title="Crea la tua prima collezione!" cta={<Btn color="var(--accent)" onClick={() => { setTarget(null); setModal('nuovaCol') }}>+ Crea collezione</Btn>} />
            )}
          </>)}

          {tab === 'imballaggi' && (<>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20, gap: 10 }}>
              <div>
                <h1 style={{ fontFamily: 'var(--ff-display)', fontSize: 30, fontWeight: 700, letterSpacing: -0.5 }}>Imballaggi & Spedizione</h1>
                <p style={{ fontSize: 14, color: 'var(--text-3)', marginTop: 4 }}>Scatole, sacchetti, nastri, etichette…</p>
                <p style={{ fontSize: 12, color: 'var(--text-3)', marginTop: 4 }}>{imballaggi.length} articoli</p>
              </div>
              <Btn color="var(--accent)" onClick={() => { setTarget(null); setModal('nuovoImb') }}>+ Articolo</Btn>
            </div>
            {imballaggi.length > 3 && (
              <input value={cerca} onChange={e => setCerca(e.target.value)} placeholder="🔍 Cerca articolo…"
                style={{ width: '100%', padding: '10px 16px', borderRadius: 'var(--r-pill)', border: '1.5px solid var(--border-s)', fontSize: 14, background: 'rgba(255,252,247,0.9)', outline: 'none', fontFamily: 'var(--ff-body)', boxSizing: 'border-box', marginBottom: 18 }} />
            )}
            {imbFiltrati.length === 0
              ? <EmptyState icon="📦" title="Nessun articolo ancora" cta={<Btn color="var(--accent)" onClick={() => setModal('nuovoImb')}>+ Aggiungi il primo articolo</Btn>} />
              : <Grid>{imbFiltrati.map(m => <MaterialeCard key={m.id} mat={m} catOverride={CAT_IMBALLAGGI} onEdit={m => { setTarget(m); setModal('editImb') }} onDelete={eliminaImballaggio} />)}</Grid>
            }
          </>)}

          {tab === 'prodotti' && (<>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, gap: 10 }}>
              <div>
                <h1 style={{ fontFamily: 'var(--ff-display)', fontSize: 30, fontWeight: 700, letterSpacing: -0.5 }}>I miei prodotti</h1>
                <p style={{ fontSize: 13, color: 'var(--text-3)', marginTop: 4 }}>{prodotti.filter(p=>p.venduto).length} venduti · {prodotti.filter(p=>!p.venduto).length} in stock</p>
              </div>
              <Btn color="var(--accent)" onClick={() => { setTarget(null); setModal('nuovoProd') }}>+ Prodotto</Btn>
            </div>
            {prodotti.length > 3 && (
              <input value={cerca} onChange={e => setCerca(e.target.value)} placeholder="🔍 Cerca prodotto…"
                style={{ width: '100%', padding: '10px 16px', borderRadius: 'var(--r-pill)', border: '1.5px solid var(--border-s)', fontSize: 14, background: 'rgba(255,252,247,0.9)', outline: 'none', fontFamily: 'var(--ff-body)', boxSizing: 'border-box', marginBottom: 18 }} />
            )}
            {prodFiltrati.length === 0
              ? <EmptyState icon="👜" title="Nessun prodotto ancora" cta={<Btn color="var(--accent)" onClick={() => setModal('nuovoProd')}>+ Aggiungi il primo prodotto</Btn>} />
              : <Grid>{prodFiltrati.map(p => <ProdottoCard key={p.id} prod={p} onEdit={p => { setTarget(p); setModal('editProd') }} onDelete={eliminaProdotto} onToggleVenduto={toggleVenduto} />)}</Grid>
            }
          </>)}

          {tab === 'analisi' && (
            <AnalisiDashboard collezioni={collezioni} prodotti={prodotti} imballaggi={imballaggi} />
          )}

        </div>
      </main>

      {(modal === 'nuovaCol' || modal === 'editCol') && (
        <CollezioneModal editData={modal === 'editCol' ? target : null} onSave={salvaCollezione} onClose={() => setModal(null)} />
      )}
      {(modal === 'nuovoMat' || modal === 'editMat') && (
        <MaterialeModal editData={modal === 'editMat' ? target : null} onSave={salvaMateriale} onClose={() => setModal(null)} />
      )}
      {(modal === 'nuovoImb' || modal === 'editImb') && (
        <MaterialeModal editData={modal === 'editImb' ? target : null} catOverride={CAT_IMBALLAGGI} onSave={salvaImballaggio} onClose={() => setModal(null)} />
      )}
      {(modal === 'nuovoProd' || modal === 'editProd') && (
        <ProdottoModal editData={modal === 'editProd' ? target : null} tuttiMateriali={tuttiMateriali} onSave={salvaProdotto} onClose={() => setModal(null)} />
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

function Grid({ children }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 16 }}>
      {children}
    </div>
  )
}
