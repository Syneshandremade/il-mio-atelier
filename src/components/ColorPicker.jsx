import { MAX_COLORI } from '../constants'

export function Dot({ color, size = 16 }) {
  return (
    <span style={{
      display: 'inline-block', flexShrink: 0,
      width: size, height: size, borderRadius: '50%',
      background: color,
      border: '2px solid rgba(255,255,255,0.8)',
      boxShadow: '0 1px 3px rgba(0,0,0,0.18)',
    }} />
  )
}

export function Palette({ colori, size }) {
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
      {colori.map((c, i) => <Dot key={i} color={c} size={size} />)}
    </div>
  )
}

export function ColorPicker({ colori, setColori }) {
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, alignItems: 'center' }}>
      {colori.map((c, i) => (
        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
          <input type="color" value={c}
            onChange={e => { const n = [...colori]; n[i] = e.target.value; setColori(n) }}
            style={{ width: 38, height: 38, borderRadius: '50%', border: '2px solid var(--border-s)', padding: 2, cursor: 'pointer' }}
          />
          <button onClick={() => setColori(colori.filter((_, j) => j !== i))}
            style={{ background: 'none', border: 'none', color: '#ccc', fontSize: 16, cursor: 'pointer', lineHeight: 1, padding: 0 }}>
            ×
          </button>
        </div>
      ))}
      {colori.length < MAX_COLORI && (
        <button onClick={() => setColori([...colori, '#d4a870'])}
          style={{
            width: 38, height: 38, borderRadius: '50%',
            border: '2px dashed var(--border-s)', background: 'none',
            fontSize: 20, color: 'var(--text-3)', cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>+</button>
      )}
    </div>
  )
}
