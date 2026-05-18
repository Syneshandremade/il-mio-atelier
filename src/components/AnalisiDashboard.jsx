import { useState } from 'react'
import { CAT_MATERIALI, CAT_PRODOTTI, CAT_IMBALLAGGI } from '../constants'

const MESI = ['Gen','Feb','Mar','Apr','Mag','Giu','Lug','Ago','Set','Ott','Nov','Dic']

function monthKey(ts)   { const d = new Date(ts); return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}` }
function monthLabel(k)  { const [y,m] = k.split('-'); return `${MESI[parseInt(m)-1]} ${y}` }
function prodCosto(p)   { return (p.materialiUsati?.reduce((s,m) => s+(m.costo||0), 0)||0) + (p.costoAltro||0) }
function prodMargine(p) { return (p.prezzoDiVendita||0) - prodCosto(p) }

function KPI({ emoji, label, val, color, sub }) {
  return (
    <div style={{ background: 'rgba(255,252,247,0.97)', borderRadius: 'var(--r-l)', padding: '18px 20px', flex: 1, minWidth: 120, boxShadow: 'var(--shadow-s)', border: '1px solid var(--border)' }}>
      <div style={{ fontSize: 22, marginBottom: 6 }}>{emoji}</div>
      <div style={{ fontFamily: 'var(--ff-body)', fontSize: 30, fontWeight: 600, color: color||'var(--text)', lineHeight: 1, fontVariantNumeric: 'tabular-nums' }}>{val}</div>
      <div style={{ fontSize: 12, color: 'var(--text-3)', marginTop: 4 }}>{label}</div>
      {sub && <div style={{ fontSize: 11, color: 'var(--text-3)', marginTop: 2 }}>{sub}</div>}
    </div>
  )
}

function Card({ title, children }) {
  return (
    <div style={{ background: 'rgba(255,252,247,0.97)', borderRadius: 'var(--r-l)', padding: '20px 22px', boxShadow: 'var(--shadow-s)', border: '1px solid var(--border)' }}>
      <h3 style={{ fontFamily: 'var(--ff-display)', fontSize: 18, fontWeight: 700, marginBottom: 18, color: 'var(--text)' }}>{title}</h3>
      {children}
    </div>
  )
}

function BarRow({ label, val, maxVal, color, sub }) {
  const pct = maxVal > 0 ? Math.max((val/maxVal)*100, val > 0 ? 3 : 0) : 0
  return (
    <div style={{ marginBottom: 12 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
        <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-2)' }}>{label}</span>
        <span style={{ fontSize: 13, fontWeight: 700, color: color||'var(--text)' }}>€{val.toFixed(2)}</span>
      </div>
      <div style={{ height: 9, background: 'var(--surface-2)', borderRadius: 5, overflow: 'hidden' }}>
        <div style={{ height: '100%', width: `${pct}%`, background: color||'var(--accent-warm)', borderRadius: 5, transition: 'width 0.5s ease' }} />
      </div>
      {sub && <p style={{ fontSize: 11, color: 'var(--text-3)', marginTop: 3 }}>{sub}</p>}
    </div>
  )
}

function Section({ label, children }) {
  return (
    <div style={{ marginBottom: 22 }}>
      <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: 1.2, textTransform: 'uppercase', color: 'var(--text-3)', marginBottom: 12 }}>{label}</div>
      {children}
    </div>
  )
}

function VistaTotale({ collezioni, prodotti, imballaggi }) {
  const tuttiMat    = collezioni.flatMap(c => c.materiali)
  const prodVenduti = prodotti.filter(p => p.venduto)
  const prodStock   = prodotti.filter(p => !p.venduto)

  const totMat    = tuttiMat.reduce((s,m) => s + (m.costoUnitario||0)*(m.quantita||0), 0)
  const totImb    = imballaggi.reduce((s,m) => s + (m.costoUnitario||0)*(m.quantita||0), 0)
  const totRic    = prodVenduti.reduce((s,p) => s + (p.prezzoDiVendita||0), 0)
  const totCostiV = prodVenduti.reduce((s,p) => s + prodCosto(p), 0)
  const totMarg   = totRic - totCostiV
  const potenziale = prodStock.filter(p => p.prezzoDiVendita > 0).reduce((s,p) => s+(p.prezzoDiVendita||0), 0)

  const catMat = CAT_MATERIALI.map(cat => {
    const ms = tuttiMat.filter(m => m.categoria === cat.id)
    const v  = ms.reduce((s,m) => s+(m.costoUnitario||0)*(m.quantita||0), 0)
    return { ...cat, val: v, sub: `${ms.length} materiali` }
  }).filter(c => c.val > 0).sort((a,b) => b.val-a.val)

  const catImb = CAT_IMBALLAGGI.map(cat => {
    const ms = imballaggi.filter(m => m.categoria === cat.id)
    const v  = ms.reduce((s,m) => s+(m.costoUnitario||0)*(m.quantita||0), 0)
    return { ...cat, val: v, sub: `${ms.length} articoli` }
  }).filter(c => c.val > 0).sort((a,b) => b.val-a.val)

  const catProd = CAT_PRODOTTI.map(cat => {
    const vend = prodVenduti.filter(p => p.categoria === cat.id)
    const ric  = vend.reduce((s,p) => s+(p.prezzoDiVendita||0), 0)
    const cost = vend.reduce((s,p) => s+prodCosto(p), 0)
    const marg = ric - cost
    const pct  = ric > 0 ? Math.round((marg/ric)*100) : null
    return { ...cat, val: ric, marg, sub: `${vend.length} vendut${vend.length!==1?'e':'o'} · margine €${marg.toFixed(2)}${pct!==null?` (${pct}%)`:''}` }
  }).filter(c => c.val > 0).sort((a,b) => b.marg-a.marg)

  const topProd = [...prodotti]
    .filter(p => p.prezzoDiVendita > 0)
    .map(p => ({ ...p, marg: prodMargine(p), pct: Math.round((prodMargine(p)/p.prezzoDiVendita)*100) }))
    .sort((a,b) => b.pct-a.pct).slice(0,5)

  return (<>
    <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 20 }}>
      <KPI emoji="💶" label="Stock materiali"  val={`€${totMat.toFixed(2)}`} />
      <KPI emoji="📦" label="Stock imballaggi" val={`€${totImb.toFixed(2)}`} />
      <KPI emoji="🛍" label="Ricavi totali"    val={`€${totRic.toFixed(2)}`} sub={`${prodVenduti.length} venduti`} />
      <KPI emoji="📈" label="Margine lordo"    val={`€${totMarg.toFixed(2)}`} color={totMarg>=0?'#4a8e4a':'#c04a4a'} />
    </div>

    {catMat.length > 0 && (
      <Card title="💰 Investimento materiali per categoria">
        {catMat.map(c => <BarRow key={c.id} label={`${c.emoji} ${c.label}`} val={c.val} maxVal={catMat[0].val} color={c.cssVar} sub={c.sub} />)}
      </Card>
    )}

    {catImb.length > 0 && (
      <Card title="📦 Investimento imballaggi per categoria">
        {catImb.map(c => <BarRow key={c.id} label={`${c.emoji} ${c.label}`} val={c.val} maxVal={catImb[0].val} color={c.cssVar} sub={c.sub} />)}
      </Card>
    )}

    {catProd.length > 0 && (
      <Card title="🛍 Ricavi per tipo di prodotto">
        {catProd.map(c => <BarRow key={c.id} label={`${c.emoji} ${c.label}`} val={c.val} maxVal={catProd[0].val} color={c.cssVar} sub={c.sub} />)}
      </Card>
    )}

    {topProd.length > 0 && (
      <Card title="🏆 Prodotti più redditizi (margine %)">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {topProd.map((p,i) => (
            <div key={p.id} style={{ display: 'flex', alignItems: 'center', gap: 12, background: 'var(--surface-2)', borderRadius: 10, padding: '10px 14px' }}>
              <span style={{ fontFamily: 'var(--ff-display)', fontSize: 20, fontWeight: 700, color: 'var(--text-3)', minWidth: 22 }}>{i+1}</span>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 14, fontWeight: 700 }}>{p.nome}</div>
                <div style={{ fontSize: 11, color: 'var(--text-3)' }}>Costo €{prodCosto(p).toFixed(2)} → Vendita €{p.prezzoDiVendita.toFixed(2)}</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: 16, fontWeight: 700, color: p.marg>=0?'#4a8e4a':'#c04a4a' }}>{p.pct}%</div>
                <div style={{ fontSize: 11, color: 'var(--text-3)' }}>€{p.marg.toFixed(2)}</div>
              </div>
            </div>
          ))}
        </div>
      </Card>
    )}

    {potenziale > 0 && (
      <Card title="⏳ Ricavo potenziale stock">
        <p style={{ fontSize: 20, fontWeight: 700, fontFamily: 'var(--ff-display)', color: 'var(--accent-warm)' }}>€{potenziale.toFixed(2)}</p>
        <p style={{ fontSize: 12, color: 'var(--text-3)', marginTop: 4 }}>{prodStock.filter(p=>p.prezzoDiVendita>0).length} prodotti non ancora venduti</p>
      </Card>
    )}
  </>)
}

function VistaMensile({ prodotti }) {
  const venduti = prodotti.filter(p => p.venduto && p.dataVendita)

  if (venduti.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--text-3)' }}>
        <div style={{ fontSize: 40, marginBottom: 12 }}>📅</div>
        <p style={{ fontFamily: 'var(--ff-display)', fontSize: 17 }}>Nessun prodotto ancora venduto</p>
        <p style={{ fontSize: 13, marginTop: 6 }}>Segna i prodotti come "venduti" per vedere le statistiche mensili.</p>
      </div>
    )
  }

  const mesi = {}
  venduti.forEach(p => {
    const k = monthKey(p.dataVendita)
    if (!mesi[k]) mesi[k] = { ricavi: 0, costi: 0, n: 0, prodotti: [] }
    mesi[k].ricavi += p.prezzoDiVendita || 0
    mesi[k].costi  += prodCosto(p)
    mesi[k].n      += 1
    mesi[k].prodotti.push(p)
  })

  const keys = Object.keys(mesi).sort().reverse()

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {keys.map(k => {
        const m    = mesi[k]
        const marg = m.ricavi - m.costi
        return (
          <Card key={k} title={`📅 ${monthLabel(k)}`}>
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 16 }}>
              <div style={{ flex: 1, minWidth: 90, background: 'var(--surface-2)', borderRadius: 10, padding: '10px 14px', textAlign: 'center' }}>
                <div style={{ fontSize: 18, fontWeight: 700, fontFamily: 'var(--ff-display)' }}>€{m.ricavi.toFixed(2)}</div>
                <div style={{ fontSize: 11, color: 'var(--text-3)' }}>Ricavi</div>
              </div>
              <div style={{ flex: 1, minWidth: 90, background: 'var(--surface-2)', borderRadius: 10, padding: '10px 14px', textAlign: 'center' }}>
                <div style={{ fontSize: 18, fontWeight: 700, fontFamily: 'var(--ff-display)' }}>€{m.costi.toFixed(2)}</div>
                <div style={{ fontSize: 11, color: 'var(--text-3)' }}>Costi</div>
              </div>
              <div style={{ flex: 1, minWidth: 90, background: marg>=0?'#4a8e4a18':'#c04a4a18', borderRadius: 10, padding: '10px 14px', textAlign: 'center' }}>
                <div style={{ fontSize: 18, fontWeight: 700, fontFamily: 'var(--ff-display)', color: marg>=0?'#4a8e4a':'#c04a4a' }}>€{marg.toFixed(2)}</div>
                <div style={{ fontSize: 11, color: 'var(--text-3)' }}>Margine</div>
              </div>
            </div>
            <Section label={`${m.n} prodott${m.n!==1?'i':'o'} vendut${m.n!==1?'i':'o'}`}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
                {m.prodotti.map(p => (
                  <div key={p.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--surface-2)', borderRadius: 8, padding: '7px 12px' }}>
                    <span style={{ fontSize: 13, fontWeight: 600 }}>{p.nome}</span>
                    <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                      <span style={{ fontSize: 12, color: 'var(--text-3)' }}>costo €{prodCosto(p).toFixed(2)}</span>
                      <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--accent-warm)' }}>€{p.prezzoDiVendita.toFixed(2)}</span>
                    </div>
                  </div>
                ))}
              </div>
            </Section>
          </Card>
        )
      })}
    </div>
  )
}

function VistaCollezione({ collezioni, prodotti }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {collezioni.map(col => {
        const mats       = col.materiali
        const totInv     = mats.reduce((s,m) => s+(m.costoUnitario||0)*(m.quantita||0), 0)
        const matUsate   = new Set(prodotti.flatMap(p => p.materialiUsati?.map(m=>m.materialeId)||[]))
        const matUsateCol = mats.filter(m => matUsate.has(m.id))

        return (
          <Card key={col.id} title={
            <span style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{ width: 14, height: 14, borderRadius: '50%', background: col.colore, display: 'inline-block', flexShrink: 0 }} />
              {col.nome}
            </span>
          }>
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 16 }}>
              <div style={{ flex: 1, minWidth: 90, background: 'var(--surface-2)', borderRadius: 10, padding: '10px 14px', textAlign: 'center' }}>
                <div style={{ fontSize: 18, fontWeight: 700, fontFamily: 'var(--ff-display)' }}>{mats.length}</div>
                <div style={{ fontSize: 11, color: 'var(--text-3)' }}>Materiali</div>
              </div>
              <div style={{ flex: 1, minWidth: 90, background: 'var(--surface-2)', borderRadius: 10, padding: '10px 14px', textAlign: 'center' }}>
                <div style={{ fontSize: 18, fontWeight: 700, fontFamily: 'var(--ff-display)', color: 'var(--accent-warm)' }}>€{totInv.toFixed(2)}</div>
                <div style={{ fontSize: 11, color: 'var(--text-3)' }}>Valore stock</div>
              </div>
              <div style={{ flex: 1, minWidth: 90, background: matUsateCol.length>0?'#4a8e4a18':'var(--surface-2)', borderRadius: 10, padding: '10px 14px', textAlign: 'center' }}>
                <div style={{ fontSize: 18, fontWeight: 700, fontFamily: 'var(--ff-display)', color: matUsateCol.length>0?'#4a8e4a':'var(--text-3)' }}>{matUsateCol.length}</div>
                <div style={{ fontSize: 11, color: 'var(--text-3)' }}>Usati in prodotti</div>
              </div>
            </div>

            {mats.length > 0 && (
              <Section label="Dettaglio materiali">
                {mats.map(m => {
                  const val   = (m.costoUnitario||0)*(m.quantita||0)
                  const usato = matUsate.has(m.id)
                  return (
                    <div key={m.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--surface-2)', borderRadius: 8, padding: '7px 12px', marginBottom: 5 }}>
                      <div>
                        <span style={{ fontSize: 13, fontWeight: 600 }}>{m.nome}</span>
                        {usato && <span style={{ marginLeft: 6, fontSize: 10, background: '#4a8e4a22', color: '#4a8e4a', padding: '1px 6px', borderRadius: 10, fontWeight: 700 }}>usato</span>}
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        {val > 0 && <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--accent-warm)' }}>€{val.toFixed(2)}</div>}
                        <div style={{ fontSize: 11, color: 'var(--text-3)' }}>{m.quantita||0} {m.unitaMisura}</div>
                      </div>
                    </div>
                  )
                })}
              </Section>
            )}
            {col.descrizione && <p style={{ fontSize: 12, color: 'var(--text-3)', fontStyle: 'italic', marginTop: 8 }}>{col.descrizione}</p>}
          </Card>
        )
      })}
    </div>
  )
}

export default function AnalisiDashboard({ collezioni, prodotti, imballaggi }) {
  const [vista, setVista] = useState('totale')

  const viste = [
    { id: 'totale',     label: 'Totale'        },
    { id: 'mensile',    label: 'Mensile'       },
    { id: 'collezione', label: 'Per collezione' },
  ]

  const isEmpty = collezioni.every(c=>c.materiali.length===0) && prodotti.length===0 && imballaggi.length===0

  if (isEmpty) {
    return (
      <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--text-3)' }}>
        <div style={{ fontSize: 52, marginBottom: 14 }}>📊</div>
        <div style={{ fontFamily: 'var(--ff-display)', fontSize: 20, marginBottom: 8 }}>Nessun dato ancora</div>
        <p style={{ fontSize: 14 }}>Aggiungi materiali e prodotti per vedere le analisi.</p>
      </div>
    )
  }

  return (
    <div>
      <div style={{ display: 'flex', gap: 6, background: 'var(--surface-2)', borderRadius: 'var(--r-pill)', padding: 4, marginBottom: 20, width: 'fit-content' }}>
        {viste.map(v => (
          <button key={v.id} onClick={() => setVista(v.id)}
            style={{ padding: '7px 16px', borderRadius: 'var(--r-pill)', border: 'none', background: vista===v.id?'var(--surface-s)':'transparent', color: vista===v.id?'var(--accent)':'var(--text-3)', fontWeight: 700, fontSize: 13, boxShadow: vista===v.id?'var(--shadow-s)':'none', cursor: 'pointer', transition: 'all 0.18s' }}>
            {v.label}
          </button>
        ))}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {vista === 'totale'     && <VistaTotale     collezioni={collezioni} prodotti={prodotti} imballaggi={imballaggi} />}
        {vista === 'mensile'    && <VistaMensile    prodotti={prodotti} />}
        {vista === 'collezione' && <VistaCollezione collezioni={collezioni} prodotti={prodotti} />}
      </div>

      <p style={{ fontSize: 11, color: 'var(--text-3)', textAlign: 'center', marginTop: 20, paddingBottom: 8 }}>
        * Importi lordi senza IVA. Tieni separata la contabilità per le dichiarazioni fiscali.
      </p>
    </div>
  )
}
