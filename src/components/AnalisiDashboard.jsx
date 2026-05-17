import { CAT_MATERIALI, CAT_PRODOTTI } from '../constants'

// ── Piccolo bar chart CSS ─────────────────────────────────────
function BarChart({ items, maxVal }) {
  if (!items.length) return null
  const top = maxVal || Math.max(...items.map(i => i.val), 1)
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      {items.map((item, i) => (
        <div key={i}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
            <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-2)' }}>
              {item.emoji} {item.label}
            </span>
            <span style={{ fontSize: 13, fontWeight: 700, color: item.color || 'var(--text)' }}>
              {item.valLabel || `€${item.val.toFixed(2)}`}
            </span>
          </div>
          <div style={{ height: 10, background: 'var(--surface-2)', borderRadius: 5, overflow: 'hidden' }}>
            <div style={{
              height: '100%', borderRadius: 5,
              width: `${Math.max((item.val / top) * 100, item.val > 0 ? 3 : 0)}%`,
              background: item.color || 'var(--accent-warm)',
              transition: 'width 0.5s ease',
            }} />
          </div>
          {item.sub && <p style={{ fontSize: 11, color: 'var(--text-3)', marginTop: 3 }}>{item.sub}</p>}
        </div>
      ))}
    </div>
  )
}

function KPI({ label, val, sub, color, emoji }) {
  return (
    <div style={{ background: 'rgba(255,252,247,0.96)', borderRadius: 'var(--r-l)', padding: '18px 20px', flex: 1, minWidth: 130, boxShadow: 'var(--shadow-s)', border: '1px solid var(--border)' }}>
      <div style={{ fontSize: 22, marginBottom: 6 }}>{emoji}</div>
      <div style={{ fontFamily: 'var(--ff-display)', fontSize: 26, fontWeight: 700, color: color || 'var(--text)', lineHeight: 1 }}>
        {val}
      </div>
      <div style={{ fontSize: 12, color: 'var(--text-3)', marginTop: 4 }}>{label}</div>
      {sub && <div style={{ fontSize: 11, color: 'var(--text-3)', marginTop: 2 }}>{sub}</div>}
    </div>
  )
}

function Card({ title, children }) {
  return (
    <div style={{ background: 'rgba(255,252,247,0.96)', borderRadius: 'var(--r-l)', padding: '20px 22px', boxShadow: 'var(--shadow-s)', border: '1px solid var(--border)' }}>
      <h3 style={{ fontFamily: 'var(--ff-display)', fontSize: 18, fontWeight: 700, marginBottom: 18, color: 'var(--text)' }}>{title}</h3>
      {children}
    </div>
  )
}

export default function AnalisiDashboard({ collezioni, prodotti }) {
  // ── Materiali ────────────────────────────────────────────────
  const tuttiMat = collezioni.flatMap(c => c.materiali)

  const investimentoPerCat = CAT_MATERIALI.map(cat => {
    const mat = tuttiMat.filter(m => m.categoria === cat.id)
    const val = mat.reduce((s, m) => s + ((m.costoUnitario || 0) * (m.quantita || 0)), 0)
    const pz  = mat.length
    return { ...cat, val, pz, sub: `${pz} materiale${pz !== 1 ? 'i' : ''}`, color: cat.cssVar }
  }).filter(c => c.val > 0 || c.pz > 0).sort((a, b) => b.val - a.val)

  const totaleInvestito = tuttiMat.reduce((s, m) => s + ((m.costoUnitario || 0) * (m.quantita || 0)), 0)

  // ── Prodotti ─────────────────────────────────────────────────
  const prodVenduti   = prodotti.filter(p => p.venduto)
  const prodNonVenduti= prodotti.filter(p => !p.venduto)
  const totRicavi     = prodVenduti.reduce((s, p) => s + (p.prezzoDiVendita || 0), 0)
  const totCostiVend  = prodVenduti.reduce((s, p) => s + ((p.materialiUsati?.reduce((ss, m) => ss + (m.costo || 0), 0) || 0) + (p.costoAltro || 0)), 0)
  const totMargine    = totRicavi - totCostiVend
  const margineColor  = totMargine >= 0 ? '#4a8e4a' : '#c04a4a'

  const ricaviPerCat = CAT_PRODOTTI.map(cat => {
    const vend   = prodVenduti.filter(p => p.categoria === cat.id)
    const tuttiC = prodotti.filter(p => p.categoria === cat.id)
    const ric    = vend.reduce((s, p) => s + (p.prezzoDiVendita || 0), 0)
    const costi  = vend.reduce((s, p) => s + ((p.materialiUsati?.reduce((ss, m) => ss + (m.costo || 0), 0) || 0) + (p.costoAltro || 0)), 0)
    const marg   = ric - costi
    const pct    = ric > 0 ? Math.round((marg / ric) * 100) : null
    return { ...cat, val: ric, marg, pct, n: vend.length, tot: tuttiC.length, color: cat.cssVar,
      sub: `${vend.length} vendut${vend.length !== 1 ? 'e' : 'o'} su ${tuttiC.length} · margine €${marg.toFixed(2)}${pct !== null ? ` (${pct}%)` : ''}` }
  }).filter(c => c.tot > 0).sort((a, b) => b.marg - a.marg)

  // ── Prodotto più redditizio ───────────────────────────────────
  const migliori = [...prodotti]
    .filter(p => p.prezzoDiVendita > 0)
    .map(p => {
      const costo = (p.materialiUsati?.reduce((s, m) => s + (m.costo || 0), 0) || 0) + (p.costoAltro || 0)
      const marg  = p.prezzoDiVendita - costo
      const pct   = p.prezzoDiVendita > 0 ? Math.round((marg / p.prezzoDiVendita) * 100) : 0
      return { ...p, costo, marg, pct }
    })
    .sort((a, b) => b.pct - a.pct)
    .slice(0, 5)

  const isEmpty = tuttiMat.length === 0 && prodotti.length === 0

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
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

      {/* KPI principali */}
      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
        <KPI emoji="💶" label="Investito in materiali" val={`€${totaleInvestito.toFixed(2)}`} />
        <KPI emoji="🛍" label="Ricavi totali" val={`€${totRicavi.toFixed(2)}`} sub={`${prodVenduti.length} pezzi venduti`} />
        <KPI emoji="📈" label="Margine lordo" val={`€${totMargine.toFixed(2)}`} color={margineColor} />
      </div>

      {/* Investimento per categoria materiale */}
      {investimentoPerCat.length > 0 && (
        <Card title="💰 Investimento per categoria materiale">
          <BarChart items={investimentoPerCat} />
          <p style={{ marginTop: 14, fontSize: 12, color: 'var(--text-3)' }}>
            Totale stock: <b>€{totaleInvestito.toFixed(2)}</b> · {tuttiMat.length} materiali in {collezioni.length} collezioni
          </p>
        </Card>
      )}

      {/* Ricavi per categoria prodotto */}
      {ricaviPerCat.length > 0 && (
        <Card title="🛍 Ricavi per tipo di prodotto">
          <BarChart items={ricaviPerCat} maxVal={Math.max(...ricaviPerCat.map(c => c.val), 1)} />
        </Card>
      )}

      {/* Top prodotti per margine % */}
      {migliori.length > 0 && (
        <Card title="🏆 Prodotti più redditizi (margine %)">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {migliori.map((p, i) => (
              <div key={p.id} style={{ display: 'flex', alignItems: 'center', gap: 12, background: 'var(--surface-2)', borderRadius: 10, padding: '10px 14px' }}>
                <span style={{ fontFamily: 'var(--ff-display)', fontSize: 20, fontWeight: 700, color: 'var(--text-3)', minWidth: 24 }}>{i + 1}</span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 14, fontWeight: 700 }}>{p.nome}</div>
                  <div style={{ fontSize: 11, color: 'var(--text-3)' }}>Costo €{p.costo.toFixed(2)} → Vendita €{p.prezzoDiVendita.toFixed(2)}</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: 16, fontWeight: 700, color: p.marg >= 0 ? '#4a8e4a' : '#c04a4a' }}>{p.pct}%</div>
                  <div style={{ fontSize: 11, color: 'var(--text-3)' }}>€{p.marg.toFixed(2)}</div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Prodotti non ancora venduti */}
      {prodNonVenduti.length > 0 && (
        <Card title="⏳ Stock da vendere">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {prodNonVenduti.map(p => {
              const costo = (p.materialiUsati?.reduce((s, m) => s + (m.costo || 0), 0) || 0) + (p.costoAltro || 0)
              return (
                <div key={p.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--surface-2)', borderRadius: 10, padding: '9px 14px' }}>
                  <span style={{ fontSize: 13, fontWeight: 600 }}>{p.nome}</span>
                  <span style={{ fontSize: 13, color: p.prezzoDiVendita > 0 ? '#4a8e4a' : 'var(--text-3)', fontWeight: 700 }}>
                    {p.prezzoDiVendita > 0 ? `€${p.prezzoDiVendita.toFixed(2)}` : 'Prezzo non impostato'}
                  </span>
                </div>
              )
            })}
          </div>
          {(() => {
            const potenziale = prodNonVenduti.reduce((s, p) => s + (p.prezzoDiVendita || 0), 0)
            return potenziale > 0 ? (
              <p style={{ marginTop: 12, fontSize: 13, fontWeight: 700, color: 'var(--accent-warm)' }}>
                Ricavo potenziale: €{potenziale.toFixed(2)}
              </p>
            ) : null
          })()}
        </Card>
      )}

      <p style={{ fontSize: 11, color: 'var(--text-3)', textAlign: 'center', paddingBottom: 8 }}>
        * Importi lordi, senza IVA. Tieni separata la contabilità per le dichiarazioni fiscali.
      </p>
    </div>
  )
}
