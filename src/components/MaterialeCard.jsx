import { CAT_MATERIALI } from '../constants'
import { Palette } from './ColorPicker'
import { Btn } from './ui'

export default function MaterialeCard({ mat, onEdit, onDelete }) {
  const cat  = CAT_MATERIALI.find(c => c.id === mat.categoria) || CAT_MATERIALI.at(-1)
  const val  = mat.costoUnitario && mat.quantita
    ? (mat.costoUnitario * mat.quantita).toFixed(2)
    : null

  return (
    <div className="fade-up" style={{
      background: 'rgba(255,252,247,0.96)',
      borderRadius: 'var(--r-l)', padding: '16px',
      boxShadow: 'var(--shadow-s)',
      border: '1px solid var(--border)',
      display: 'flex', flexDirection: 'column', gap: 8,
      transition: 'box-shadow 0.2s, transform 0.2s',
    }}
      onMouseEnter={e => { e.currentTarget.style.boxShadow = 'var(--shadow-m)'; e.currentTarget.style.transform = 'translateY(-2px)' }}
      onMouseLeave={e => { e.currentTarget.style.boxShadow = 'var(--shadow-s)'; e.currentTarget.style.transform = 'translateY(0)' }}
    >
      {/* Immagine / gradiente */}
      {mat.immagine ? (
        <img src={mat.immagine} alt={mat.nome}
          style={{ width: '100%', height: 110, objectFit: 'cover', borderRadius: 10 }} />
      ) : (
        <div style={{
          width: '100%', height: 80, borderRadius: 10,
          background: mat.colori.length > 1
            ? `linear-gradient(120deg, ${mat.colori.join(', ')})`
            : (mat.colori[0] || 'var(--surface-2)'),
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 24,
        }}>{cat.emoji}</div>
      )}

      {/* Header: badge + actions */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{
          fontSize: 10, fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase',
          color: cat.cssVar, background: cat.cssVar + '22',
          padding: '2px 9px', borderRadius: 20,
        }}>{cat.label}</span>
        <div style={{ display: 'flex', gap: 5 }}>
          <Btn small outline onClick={() => onEdit(mat)}>✏️</Btn>
          <Btn small outline color="var(--cat-fili)" onClick={() => onDelete(mat.id)}>🗑</Btn>
        </div>
      </div>

      {/* Nome */}
      <div style={{ fontFamily: 'var(--ff-display)', fontSize: 16, fontWeight: 700, lineHeight: 1.2 }}>
        {mat.nome}
      </div>

      {/* Colori */}
      {mat.colori.length > 0 && <Palette colori={mat.colori} />}

      {/* Costo */}
      {mat.costoUnitario > 0 && (
        <div style={{ fontSize: 12, color: 'var(--text-2)', display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <span>💶 <b>€{Number(mat.costoUnitario).toFixed(2)}</b>/{mat.unitaMisura || 'pz'}</span>
          {mat.quantita > 0 && <span>× {mat.quantita} = <b>€{val}</b></span>}
        </div>
      )}

      {/* Fornitore + link */}
      {mat.fornitore && (
        <div style={{ fontSize: 12, color: 'var(--text-3)' }}>
          🏪 {mat.linkFornitore
            ? <a href={mat.linkFornitore} target="_blank" rel="noreferrer">{mat.fornitore}</a>
            : mat.fornitore}
        </div>
      )}

      {/* Note */}
      {mat.note && (
        <div style={{ fontSize: 12, color: 'var(--text-3)', fontStyle: 'italic', lineHeight: 1.4 }}>
          {mat.note}
        </div>
      )}
    </div>
  )
}
