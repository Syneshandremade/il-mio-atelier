import { CAT_PRODOTTI } from '../constants'
import { Btn } from './ui'

export default function ProdottoCard({ prod, onEdit, onDelete, onToggleVenduto }) {
  const cat       = CAT_PRODOTTI.find(c => c.id === prod.categoria) || CAT_PRODOTTI.at(-1)
  const costoTot  = (prod.materialiUsati?.reduce((s, m) => s + (m.costo || 0), 0) || 0) + (prod.costoAltro || 0)
  const margine   = prod.prezzoDiVendita - costoTot
  const pct       = costoTot > 0 && prod.prezzoDiVendita > 0
    ? Math.round((margine / prod.prezzoDiVendita) * 100)
    : null

  const margineColor = margine > 0 ? '#4a8e4a' : margine < 0 ? '#c04a4a' : 'var(--text-3)'

  return (
    <div className="fade-up" style={{
      background: prod.venduto ? 'rgba(240,248,240,0.97)' : 'rgba(255,252,247,0.97)',
      borderRadius: 'var(--r-l)', padding: 16,
      boxShadow: 'var(--shadow-s)',
      border: prod.venduto ? '1.5px solid #b8d8b8' : '1px solid var(--border)',
      display: 'flex', flexDirection: 'column', gap: 8,
      transition: 'box-shadow 0.2s, transform 0.2s',
      opacity: prod.venduto ? 0.85 : 1,
    }}
      onMouseEnter={e => { e.currentTarget.style.boxShadow = 'var(--shadow-m)'; e.currentTarget.style.transform = 'translateY(-2px)' }}
      onMouseLeave={e => { e.currentTarget.style.boxShadow = 'var(--shadow-s)'; e.currentTarget.style.transform = 'translateY(0)' }}
    >
      {/* Immagine */}
      {prod.immagine ? (
        <img src={prod.immagine} alt={prod.nome}
          style={{ width: '100%', height: 120, objectFit: 'cover', borderRadius: 10 }} />
      ) : (
        <div style={{
          width: '100%', height: 80, borderRadius: 10,
          background: `linear-gradient(135deg, ${cat.cssVar}33, ${cat.cssVar}66)`,
          display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28,
        }}>{cat.emoji}</div>
      )}

      {/* Badge + azioni */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', gap: 5, alignItems: 'center' }}>
          <span style={{
            fontSize: 10, fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase',
            color: cat.cssVar, background: cat.cssVar + '22',
            padding: '2px 9px', borderRadius: 20,
          }}>{cat.label}</span>
          {prod.venduto && (
            <span style={{ fontSize: 10, fontWeight: 700, color: '#4a8e4a', background: '#4a8e4a22', padding: '2px 8px', borderRadius: 20 }}>
              ✓ Venduto
            </span>
          )}
        </div>
        <div style={{ display: 'flex', gap: 4 }}>
          <Btn small outline onClick={() => onEdit(prod)}>✏️</Btn>
          <Btn small outline color="var(--cat-fili)" onClick={() => onDelete(prod.id)}>🗑</Btn>
        </div>
      </div>

      {/* Nome */}
      <div style={{ fontFamily: 'var(--ff-display)', fontSize: 16, fontWeight: 700, lineHeight: 1.2 }}>
        {prod.nome}
      </div>

      {prod.descrizione && (
        <div style={{ fontSize: 12, color: 'var(--text-3)', lineHeight: 1.4 }}>{prod.descrizione}</div>
      )}

      {/* Numeri */}
      <div style={{ background: 'var(--surface-2)', borderRadius: 10, padding: '10px 12px', display: 'flex', flexDirection: 'column', gap: 5 }}>
        <Row label="Costo materiali" val={`€${costoTot.toFixed(2)}`} />
        {prod.prezzoDiVendita > 0 && (
          <Row label="Prezzo vendita" val={`€${Number(prod.prezzoDiVendita).toFixed(2)}`} bold />
        )}
        {prod.prezzoDiVendita > 0 && (
          <Row
            label={`Margine${pct !== null ? ` (${pct}%)` : ''}`}
            val={`€${margine.toFixed(2)}`}
            color={margineColor}
          />
        )}
      </div>

      {/* Link modello */}
      {prod.linkModello && (
        <a href={prod.linkModello} target="_blank" rel="noreferrer"
          style={{ fontSize: 12, fontWeight: 600, color: 'var(--accent-warm)' }}>
          📐 Vedi modello →
        </a>
      )}

      {/* Toggle venduto */}
      {prod.prezzoDiVendita > 0 && (
        <button onClick={() => onToggleVenduto(prod.id)}
          style={{
            marginTop: 2, padding: '7px', borderRadius: 'var(--r-m)',
            border: '1.5px solid',
            borderColor: prod.venduto ? '#b8d8b8' : 'var(--border-s)',
            background: prod.venduto ? '#4a8e4a18' : 'transparent',
            color: prod.venduto ? '#4a8e4a' : 'var(--text-3)',
            fontSize: 12, fontWeight: 700, cursor: 'pointer',
          }}>
          {prod.venduto ? '✓ Venduto — clicca per annullare' : 'Segna come venduto'}
        </button>
      )}
    </div>
  )
}

function Row({ label, val, bold, color }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12 }}>
      <span style={{ color: 'var(--text-3)' }}>{label}</span>
      <span style={{ fontWeight: bold ? 700 : 600, color: color || 'var(--text)' }}>{val}</span>
    </div>
  )
}
