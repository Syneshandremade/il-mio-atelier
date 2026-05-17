import { useState, useEffect, useRef } from 'react'
import { APP_NAME, APP_TAGLINE, APP_EMOJI, COLLEZIONI_DEFAULT, PRODOTTI_DEFAULT, IMBALLAGGI_DEFAULT, CAT_IMBALLAGGI, CAT_PRODOTTI } from './constants'
import MaterialeCard     from './components/MaterialeCard'
import MaterialeModal    from './components/MaterialeModal'
import CollezioneModal   from './components/CollezioneModal'
import AccostamentoModal from './components/AccostamentoModal'
import ProdottoCard      from './components/ProdottoCard'
import ProdottoModal     from './components/ProdottoModal'
import AnalisiDashboard  from './components/AnalisiDashboard'
import { Btn }           from './components/ui'

const SUPABASE_URL = 'https://zxnufwyjgisvmyipnwls.supabase.co'
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp4bnVmd3lqZ2lzdm15aXBud2xzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzkwMDU1MzksImV4cCI6MjA5NDU4MTUzOX0.6A-o82dc_qLKQqOyRSZTn35er0FKoSxNuizpR_sRz2E'

async function dbGet(tabella) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/${tabella}?select=*`, {
    headers: { 'apikey': SUPABASE_KEY, 'Authorization': `Bearer ${SUPABASE_KEY}` }
  })
  const rows = await res.json()
  return Array.isArray(rows) ? rows.map(r => r.data) : []
}

async function dbUpsert(tabella, elemento) {
  await fetch(`${SUPABASE_URL}/rest/v1/${tabella}`, {
    method: 'POST',
    headers: {
      'apikey': SUPABASE_KEY,
      'Authorization': `Bearer ${SUPABASE_KEY}`,
      'Content-Type': 'application/json',
      'Prefer': 'resolution=merge-duplicates'
    },
    body: JSON.stringify({ id: elemento.id, data: elemento })
  })
}

async function dbDelete(tabella, id) {
  await fetch(`${SUPABASE_URL}/rest/v1/${tabella}?id=eq.${id}`, {
    method: 'DELETE',
    headers: { 'apikey': SUPABASE_KEY, 'Authorization': `Bearer ${SUPABASE_KEY}` }
  })
}

const TABS = [
  { id: 'materiali',  emoji: '🧶', label: 'MATERIALI'  },
  { id: 'imballaggi', emoji: '📦', label: 'IMBALLAGGI' },
  { id: 'prodotti',   emoji: '👜', label: 'PRODOTTI'   },
  { id: 'analisi',    emoji: '📊', label: 'ANALISI'    },
]

export default function AppContent({ onLogout }) {
  const [collezioni, setCollezioni] = useState([])
  const [imballaggi, setImballaggi] = useState([])
  const [prodotti,   setProdotti]   = useState([])
  const [activeCol,  setActiveCol]  = useState(null)
  const [tab,        setTab]        = useState('materiali')
  const [subTab,     setSubTab]     = useState('materiali') // 'materiali' | 'prodotti'
  const [modal,      setModal]      = useState(null)
  const [target,     setTarget]     = useState(null)
  const [cerca,      setCerca]      = useState('')
  const [loading,    setLoading]    = useState(true)
  const [errore,     setErrore]     = useState(null)
  const [headerNascosto, setHeaderNascosto] = useState(false)
  const lastScrollY = useRef(0)

  // Scroll listener per header mobile
  useEffect(() => {
    const handleScroll = () => {
      const currentY = window.scrollY
      if (currentY > lastScrollY.current && currentY > 60) {
        setHeaderNascosto(true)
      } else {
        setHeaderNascosto(false)
      }
      lastScrollY.current = currentY
    }
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Carica dati da Supabase
  useEffect(() => {
    async function carica() {
      try {
        const [cols, imbs, prods] = await Promise.all([
          dbGet('collezioni'),
          dbGet('imballaggi'),
          dbGet('prodotti'),
        ])
        if (cols.length > 0) { setCollezioni(cols); setActiveCol(cols[0].id) }
        else { setCollezioni(COLLEZIONI_DEFAULT); setActiveCol(COLLEZIONI_DEFAULT[0]?.id) }
        if (imbs.length > 0) setImballaggi(imbs)
        else setImballaggi(IMBALLAGGI_DEFAULT)
        if (prods.length > 0) setProdotti(prods)
        else setProdotti(PRODOTTI_DEFAULT)
        setErrore(null)
      } catch (e) {
        setErrore('Errore di connessione: ' + e.message)
        setCollezioni(COLLEZIONI_DEFAULT)
        setActiveCol(COLLEZIONI_DEFAULT[0]?.id)
        setImballaggi(IMBALLAGGI_DEFAULT)
        setProdotti(PRODOTTI_DEFAULT)
      } finally {
        setLoading(false)
      }
    }
    carica()
  }, [])

  const collezione = collezioni.find(c => c.id === activeCol)

  // Prodotti della collezione corrente (per materialeId)
  const prodottiCollezione = prodotti.filter(p =>
    p.materialiUsati?.some(m =>
      collezione?.materiali?.some(mat => mat.id === m.materialeId)
    )
  )

  // Prodotti per categoria nella collezione
  const prodottiPerCategoria = CAT_PRODOTTI.map(cat => ({
    ...cat,
    lista: prodottiCollezione.filter(p => p.categoria === cat.id)
  })).filter(cat => cat.lista.length > 0)

  const tuttiMateriali = [
    ...collezioni.flatMap(c => (c.materiali||[]).map(m => ({ ...m, _collezione: c.nome }))),
    ...imballaggi.map(m => ({ ...m, _collezione: '📦 Imballaggi' })),
  ]

  function logout() { onLogout() }

  async function salvaCollezione(data) {
    const esiste = collezioni.find(c => c.id === data.id)
    const nuove = esiste
      ? collezioni.map(c => c.id === data.id ? { ...c, ...data } : c)
      : [...collezioni, data]
    setCollezioni(nuove)
    setActiveCol(data.id)
    await dbUpsert('collezioni', data)
    setModal(null)
  }
  async function eliminaCollezione(id) {
    if (!confirm('Eliminare questa collezione?')) return
    const nuove = collezioni.filter(c => c.id !== id)
    setCollezioni(nuove)
    setActiveCol(nuove[0]?.id || null)
    await dbDelete('collezioni', id)
  }
  async function salvaMateriale(mat) {
    const col = collezioni.find(c => c.id === activeCol)
    if (!col) return
    const esiste = (col.materiali || []).find(m => m.id === mat.id)
    const nuoviMat = esiste
      ? col.materiali.map(m => m.id === mat.id ? mat : m)
      : [...(col.materiali || []), mat]
    const colAggiornata = { ...col, materiali: nuoviMat }
    setCollezioni(collezioni.map(c => c.id === activeCol ? colAggiornata : c))
    await dbUpsert('collezioni', colAggiornata)
    setModal(null)
  }
  async function eliminaMateriale(id) {
    const col = collezioni.find(c => c.id === activeCol)
    if (!col) return
    const colAggiornata = { ...col, materiali: col.materiali.filter(m => m.id !== id) }
    setCollezioni(collezioni.map(c => c.id === activeCol ? colAggiornata : c))
    await dbUpsert('collezioni', colAggiornata)
  }
  async function salvaImballaggio(data) {
    const esiste = imballaggi.find(m => m.id === data.id)
    setImballaggi(esiste ? imballaggi.map(m => m.id === data.id ? data : m) : [...imballaggi, data])
    await dbUpsert('imballaggi', data)
    setModal(null)
  }
  async function eliminaImballaggio(id) {
    setImballaggi(imballaggi.filter(m => m.id !== id))
    await dbDelete('imballaggi', id)
  }
  async function salvaProdotto(data) {
    const esiste = prodotti.find(p => p.id === data.id)
    setProdotti(esiste ? prodotti.map(p => p.id === data.id ? data : p) : [...prodotti, data])
    await dbUpsert('prodotti', data)
    setModal(null)
  }
  async function eliminaProdotto(id) {
    if (!confirm('Eliminare questo prodotto?')) return
    setProdotti(prodotti.filter(p => p.id !== id))
    await dbDelete('prodotti', id)
  }
  async function toggleVenduto(id) {
    const prod = prodotti.find(p => p.id === id)
    if (!prod) return
    const aggiornato = { ...prod, venduto: !prod.venduto, dataVendita: !prod.venduto ? Date.now() : null }
    setProdotti(prodotti.map(p => p.id === id ? aggiornato : p))
    await dbUpsert('prodotti', aggiornato)
  }

  const matFiltrati  = (collezione?.materiali || []).filter(m => !cerca || m.nome.toLowerCase().includes(cerca.toLowerCase()))
  const imbFiltrati  = imballaggi.filter(m => !cerca || m.nome.toLowerCase().includes(cerca.toLowerCase()))
  const prodFiltrati = prodotti.filter(p => !cerca || p.nome.toLowerCase().includes(cerca.toLowerCase()))

  if (loading) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg)' }}>
      <div style={{ fontFamily: 'var(--ff-display)', fontSize: 22, color: 'var(--text-3)' }}>Caricamento...</div>
    </div>
  )

  if (errore) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg)', padding: 20 }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontFamily: 'var(--ff-display)', fontSize: 18, color: '#c04a4a', marginBottom: 12 }}>Errore di connessione</div>
        <div style={{ fontSize: 13, color: 'var(--text-3)', marginBottom: 20 }}>{errore}</div>
        <button onClick={() => window.location.reload()} style={{ padding: '10px 20px', borderRadius: 10, background: 'var(--accent)', color: '#fff', border: 'none', cursor: 'pointer' }}>Riprova</button>
      </div>
    </div>
  )

  return (
    <div className="app-layout">

      {/* Header mobile — solo su smartphone */}
      <div className={`mobile-header${headerNascosto ? ' nascosto' : ''}`}>
        <div style={{ fontSize: 20 }}>{APP_EMOJI}</div>
        <div style={{ fontFamily: 'var(--ff-display)', fontSize: 18, fontWeight: 700, color: 'var(--text)' }}>{APP_NAME}</div>
        <div style={{ fontSize: 9, color: 'var(--text-3)', letterSpacing: 2, textTransform: 'uppercase', marginTop: 2 }}>{APP_TAGLINE}</div>
      </div>

      <aside className="sidebar">
        <div className="sidebar-logo">
          <div style={{ fontSize: 36, marginBottom: 12 }}>{APP_EMOJI}</div>
          <div style={{ fontFamily: 'var(--ff-display)', fontSize: 22, fontWeight: 700, letterSpacing: -0.3, color: 'var(--text)' }}>{APP_NAME}</div>
          <div style={{ fontSize: 10, color: 'var(--text-3)', letterSpacing: 2, textTransform: 'uppercase', marginTop: 6 }}>{APP_TAGLINE}</div>
        </div>
        <nav className="sidebar-nav">
          {TABS.map(t => (
            <button key={t.id} className={`nav-item${tab === t.id ? ' active' : ''}`}
              onClick={() => { setTab(t.id); setCerca('') }}>
              <span className="nav-emoji">{t.emoji}</span>
              {t.label}
            </button>
          ))}
        </nav>
        <div className="sidebar-footer">
          <button className="logout-btn" onClick={logout}>
            <span style={{ fontSize: 16 }}>🚪</span>
            ESCI
          </button>
        </div>
      </aside>

      <main className="main-content">
        <div style={{ padding: '32px 28px', maxWidth: 780, margin: '0 auto' }}>

          {/* ══ MATERIALI ══ */}
          {tab === 'materiali' && (<>
            <div style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 6, marginBottom: 22 }}>
              {collezioni.map(c => (
                <button key={c.id} onClick={() => { setActiveCol(c.id); setCerca(''); setSubTab('materiali') }}
                  style={{ flexShrink: 0, padding: '8px 18px', borderRadius: 'var(--r-pill)', border: activeCol === c.id ? 'none' : '1.5px solid var(--border-s)', background: activeCol === c.id ? c.colore : 'rgba(255,252,247,0.7)', color: activeCol === c.id ? '#fff' : 'var(--text-2)', fontWeight: 500, fontSize: 12, letterSpacing: 1, boxShadow: activeCol === c.id ? `0 4px 14px ${c.colore}55` : 'none', transition: 'all 0.18s', cursor: 'pointer' }}>
                  {c.nome}
                </button>
              ))}
              <button onClick={() => { setTarget(null); setModal('nuovaCol') }}
                style={{ flexShrink: 0, padding: '8px 18px', borderRadius: 'var(--r-pill)', border: '1.5px dashed var(--border-s)', background: 'none', color: 'var(--text-3)', fontWeight: 500, fontSize: 12, cursor: 'pointer' }}>
                + Collezione
              </button>
            </div>

            {collezione ? (<>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16, gap: 10 }}>
                <div>
                  <h1 style={{ fontFamily: 'var(--ff-display)', fontSize: 32, fontWeight: 700, letterSpacing: -0.5 }}>{collezione.nome}</h1>
                  {collezione.descrizione && <p style={{ fontSize: 13, color: 'var(--text-3)', marginTop: 4 }}>{collezione.descrizione}</p>}
                </div>
                <div style={{ display: 'flex', gap: 7, flexShrink: 0, flexWrap: 'wrap', justifyContent: 'flex-end' }}>
                  <Btn small outline onClick={() => setModal('accostamento')}>🎨 Abbina</Btn>
                  <Btn small outline onClick={() => { setTarget(collezione); setModal('editCol') }}>Modifica</Btn>
                  {collezioni.length > 1 && <Btn small outline color="var(--cat-fili)" onClick={() => eliminaCollezione(collezione.id)}>Elimina</Btn>}
                  <Btn small color="var(--accent)" onClick={() => { setTarget(null); setModal('nuovoMat') }}>+ Materiale</Btn>
                </div>
              </div>

              {/* Sub-tabs */}
              <div className="sub-tabs">
                <button className={`sub-tab${subTab === 'materiali' ? ' active' : ''}`} onClick={() => setSubTab('materiali')}>
                  MATERIALI ({(collezione.materiali||[]).length})
                </button>
                <button className={`sub-tab${subTab === 'prodotti' ? ' active' : ''}`} onClick={() => setSubTab('prodotti')}>
                  PRODOTTI ({prodottiCollezione.length})
                </button>
              </div>

              {/* Vista materiali */}
              {subTab === 'materiali' && (<>
                {(collezione.materiali||[]).length > 3 && (
                  <input value={cerca} onChange={e => setCerca(e.target.value)} placeholder="Cerca materiale..."
                    style={{ width: '100%', padding: '10px 16px', borderRadius: 'var(--r-pill)', border: '1.5px solid var(--border-s)', fontSize: 13, background: 'rgba(255,252,247,0.9)', outline: 'none', fontFamily: 'var(--ff-body)', boxSizing: 'border-box', marginBottom: 18 }} />
                )}
                {matFiltrati.length === 0
                  ? <EmptyState icon="🧵" title={cerca ? 'Nessun risultato' : 'Nessun materiale'} cta={!cerca && <Btn color="var(--accent)" onClick={() => setModal('nuovoMat')}>+ Aggiungi il primo materiale</Btn>} />
                  : <Grid>{matFiltrati.map(m => <MaterialeCard key={m.id} mat={m} onEdit={m => { setTarget(m); setModal('editMat') }} onDelete={eliminaMateriale} />)}</Grid>
                }
              </>)}

              {/* Vista prodotti della collezione */}
              {subTab === 'prodotti' && (<>
                {prodottiCollezione.length === 0 ? (
                  <EmptyState icon="👜" title="Nessun prodotto usa materiali di questa collezione" cta={<Btn color="var(--accent)" onClick={() => { setTab('prodotti'); setTarget(null); setModal('nuovoProd') }}>+ Crea prodotto</Btn>} />
                ) : (<>
                  {/* Tutti i prodotti */}
                  <div style={{ marginBottom: 24 }}>
                    <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: 1.5, textTransform: 'uppercase', color: 'var(--text-3)', marginBottom: 14 }}>
                      Tutti ({prodottiCollezione.length})
                    </div>
                    <Grid>
                      {prodottiCollezione.map(p => (
                        <ProdottoCard key={p.id} prod={p}
                          onEdit={p => { setTarget(p); setModal('editProd') }}
                          onDelete={eliminaProdotto}
                          onToggleVenduto={toggleVenduto} />
                      ))}
                    </Grid>
                  </div>

                  {/* Per categoria */}
                  {prodottiPerCategoria.map(cat => (
                    <div key={cat.id} style={{ marginBottom: 24 }}>
                      <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: 1.5, textTransform: 'uppercase', color: cat.cssVar, marginBottom: 14 }}>
                        {cat.emoji} {cat.label} ({cat.lista.length})
                      </div>
                      <Grid>
                        {cat.lista.map(p => (
                          <ProdottoCard key={p.id} prod={p}
                            onEdit={p => { setTarget(p); setModal('editProd') }}
                            onDelete={eliminaProdotto}
                            onToggleVenduto={toggleVenduto} />
                        ))}
                      </Grid>
                    </div>
                  ))}
                </>)}
              </>)}
            </>) : (
              <EmptyState icon="🪡" title="Crea la tua prima collezione!" cta={<Btn color="var(--accent)" onClick={() => { setTarget(null); setModal('nuovaCol') }}>+ Crea collezione</Btn>} />
            )}
          </>)}

          {/* ══ IMBALLAGGI ══ */}
          {tab === 'imballaggi' && (<>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20, gap: 10 }}>
              <div>
                <h1 style={{ fontFamily: 'var(--ff-display)', fontSize: 32, fontWeight: 700, letterSpacing: -0.5 }}>Imballaggi & Spedizione</h1>
                <p style={{ fontSize: 13, color: 'var(--text-3)', marginTop: 4 }}>Scatole, sacchetti, nastri, etichette...</p>
                <p style={{ fontSize: 11, color: 'var(--text-3)', marginTop: 4 }}>{imballaggi.length} articoli</p>
              </div>
              <Btn color="var(--accent)" onClick={() => { setTarget(null); setModal('nuovoImb') }}>+ Articolo</Btn>
            </div>
            {imballaggi.length > 3 && (
              <input value={cerca} onChange={e => setCerca(e.target.value)} placeholder="Cerca articolo..."
                style={{ width: '100%', padding: '10px 16px', borderRadius: 'var(--r-pill)', border: '1.5px solid var(--border-s)', fontSize: 13, background: 'rgba(255,252,247,0.9)', outline: 'none', fontFamily: 'var(--ff-body)', boxSizing: 'border-box', marginBottom: 18 }} />
            )}
            {imbFiltrati.length === 0
              ? <EmptyState icon="📦" title="Nessun articolo ancora" cta={<Btn color="var(--accent)" onClick={() => setModal('nuovoImb')}>+ Aggiungi il primo articolo</Btn>} />
              : <Grid>{imbFiltrati.map(m => <MaterialeCard key={m.id} mat={m} catOverride={CAT_IMBALLAGGI} onEdit={m => { setTarget(m); setModal('editImb') }} onDelete={eliminaImballaggio} />)}</Grid>
            }
          </>)}

          {/* ══ PRODOTTI ══ */}
          {tab === 'prodotti' && (<>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, gap: 10 }}>
              <div>
                <h1 style={{ fontFamily: 'var(--ff-display)', fontSize: 32, fontWeight: 700, letterSpacing: -0.5 }}>I miei prodotti</h1>
                <p style={{ fontSize: 11, color: 'var(--text-3)', marginTop: 4 }}>{prodotti.filter(p=>p.venduto).length} venduti · {prodotti.filter(p=>!p.venduto).length} in stock</p>
              </div>
              <Btn color="var(--accent)" onClick={() => { setTarget(null); setModal('nuovoProd') }}>+ Prodotto</Btn>
            </div>
            {prodotti.length > 3 && (
              <input value={cerca} onChange={e => setCerca(e.target.value)} placeholder="Cerca prodotto..."
                style={{ width: '100%', padding: '10px 16px', borderRadius: 'var(--r-pill)', border: '1.5px solid var(--border-s)', fontSize: 13, background: 'rgba(255,252,247,0.9)', outline: 'none', fontFamily: 'var(--ff-body)', boxSizing: 'border-box', marginBottom: 18 }} />
            )}
            {prodFiltrati.length === 0
              ? <EmptyState icon="👜" title="Nessun prodotto ancora" cta={<Btn color="var(--accent)" onClick={() => setModal('nuovoProd')}>+ Aggiungi il primo prodotto</Btn>} />
              : <Grid>{prodFiltrati.map(p => <ProdottoCard key={p.id} prod={p} onEdit={p => { setTarget(p); setModal('editProd') }} onDelete={eliminaProdotto} onToggleVenduto={toggleVenduto} />)}</Grid>
            }
          </>)}

          {/* ══ ANALISI ══ */}
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
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(190px, 1fr))', gap: 16 }}>
      {children}
    </div>
  )
}
