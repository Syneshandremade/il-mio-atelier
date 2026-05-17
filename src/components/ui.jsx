import { useEffect } from 'react'

// ── Modal ────────────────────────────────────────────────────
export function Modal({ title, onClose, children, maxW = 460 }) {
  useEffect(() => {
    const h = e => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', h)
    return () => window.removeEventListener('keydown', h)
  }, [onClose])

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0, zIndex: 300,
        background: 'rgba(20,16,12,0.45)',
        backdropFilter: 'blur(6px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: 16, animation: 'fadeIn 0.18s ease',
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          background: 'var(--surface-s)',
          borderRadius: 'var(--r-xl)',
          padding: '30px 28px 26px',
          width: '100%', maxWidth: maxW,
          maxHeight: '93vh', overflowY: 'auto',
          boxShadow: 'var(--shadow-l)',
          animation: 'fadeUp 0.22s ease',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
          <h2 style={{ fontFamily: 'var(--ff-display)', fontSize: 22, fontWeight: 700, color: 'var(--text)' }}>
            {title}
          </h2>
          <button onClick={onClose} style={{
            width: 32, height: 32, borderRadius: '50%',
            background: 'var(--surface-2)', border: 'none',
            fontSize: 18, color: 'var(--text-3)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>×</button>
        </div>
        {children}
      </div>
    </div>
  )
}

// ── Field wrapper ─────────────────────────────────────────────
export function Field({ label, hint, children }) {
  return (
    <div style={{ marginBottom: 18 }}>
      <label style={{
        display: 'block', marginBottom: 6,
        fontSize: 11, fontWeight: 700, letterSpacing: 1.2,
        textTransform: 'uppercase', color: 'var(--text-3)',
      }}>{label}</label>
      {children}
      {hint && <p style={{ marginTop: 5, fontSize: 11, color: 'var(--text-3)' }}>{hint}</p>}
    </div>
  )
}

const baseInput = {
  width: '100%', padding: '10px 14px',
  borderRadius: 'var(--r-m)',
  border: '1.5px solid var(--border-s)',
  fontSize: 14, fontFamily: 'var(--ff-body)',
  background: '#fff', color: 'var(--text)',
  outline: 'none', boxSizing: 'border-box',
  transition: 'border-color 0.15s',
}

export function Input({ value, onChange, placeholder, type = 'text', min, step }) {
  return (
    <input type={type} value={value} placeholder={placeholder}
      min={min} step={step}
      onChange={e => onChange(e.target.value)}
      style={baseInput}
      onFocus={e => e.target.style.borderColor = 'var(--accent-warm)'}
      onBlur={e => e.target.style.borderColor = 'var(--border-s)'}
    />
  )
}

export function Textarea({ value, onChange, placeholder, rows = 3 }) {
  return (
    <textarea value={value} placeholder={placeholder} rows={rows}
      onChange={e => onChange(e.target.value)}
      style={{ ...baseInput, resize: 'vertical' }}
      onFocus={e => e.target.style.borderColor = 'var(--accent-warm)'}
      onBlur={e => e.target.style.borderColor = 'var(--border-s)'}
    />
  )
}

export function Select({ value, onChange, options }) {
  return (
    <select value={value} onChange={e => onChange(e.target.value)}
      style={{ ...baseInput, cursor: 'pointer' }}
    >
      {options.map(o => (
        <option key={o.value ?? o} value={o.value ?? o}>{o.label ?? o}</option>
      ))}
    </select>
  )
}

export function Btn({ children, onClick, color, outline, small, fullWidth, disabled, title }) {
  const bg   = outline ? 'transparent' : (color || 'var(--accent)')
  const fg   = outline ? (color || 'var(--accent)') : '#fff'
  const bdr  = outline ? `1.5px solid ${color || 'var(--accent)'}` : 'none'
  return (
    <button onClick={onClick} title={title} disabled={disabled}
      style={{
        background: bg, color: fg, border: bdr,
        borderRadius: 'var(--r-m)',
        padding: small ? '6px 12px' : '11px 20px',
        fontSize: small ? 12 : 14, fontWeight: 700,
        width: fullWidth ? '100%' : 'auto',
        opacity: disabled ? 0.5 : 1,
        cursor: disabled ? 'not-allowed' : 'pointer',
        letterSpacing: 0.2,
        transition: 'opacity 0.15s, transform 0.1s',
      }}
    >
      {children}
    </button>
  )
}

export function Row({ children, gap = 10 }) {
  return <div style={{ display: 'flex', gap, alignItems: 'center' }}>{children}</div>
}

export function Divider() {
  return <hr style={{ border: 'none', borderTop: '1px solid var(--border-s)', margin: '20px 0' }} />
}
