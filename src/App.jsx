import { useState } from 'react'
import AppContent from './AppContent'

const PASSWORD = 'synes2024'

export default function App() {
  const [autenticato, setAutenticato] = useState(
    localStorage.getItem('atelier-auth') === 'ok'
  )

  function onLogin() {
    localStorage.setItem('atelier-auth', 'ok')
    setAutenticato(true)
  }

  function onLogout() {
    localStorage.removeItem('atelier-auth')
    setAutenticato(false)
  }

  if (!autenticato) return <Login onLogin={onLogin} />
  return <AppContent onLogout={onLogout} />
}

function Login({ onLogin }) {
  const [pwd, setPwd] = useState('')
  const [err, setErr] = useState(false)

  function entra() {
    if (pwd === PASSWORD) {
      onLogin()
    } else {
      setErr(true)
    }
  }

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(145deg, #f7f2eb, #e8dccb)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
      <div style={{ background: '#fffcf7', borderRadius: 28, padding: '48px 36px', width: '100%', maxWidth: 380, boxShadow: '0 20px 60px rgba(0,0,0,0.12)', textAlign: 'center' }}>
        <div style={{ fontSize: 48, marginBottom: 16 }}>🪡</div>
        <h1 style={{ fontFamily: 'var(--ff-display)', fontSize: 28, fontWeight: 700, marginBottom: 6 }}>Il Mio Atelier</h1>
        <p style={{ fontSize: 11, color: 'var(--text-3)', letterSpacing: 2, textTransform: 'uppercase', marginBottom: 32 }}>Materiali & Creazioni</p>
        <input
          type="password" value={pwd}
          onChange={e => { setPwd(e.target.value); setErr(false) }}
          onKeyDown={e => e.key === 'Enter' && entra()}
          placeholder="Password"
          style={{ width: '100%', padding: '13px 16px', borderRadius: 12, border: err ? '1.5px solid #c04a4a' : '1.5px solid var(--border-s)', fontSize: 15, fontFamily: 'var(--ff-body)', outline: 'none', boxSizing: 'border-box', marginBottom: 12, textAlign: 'center', letterSpacing: 4 }}
        />
        {err && <p style={{ fontSize: 12, color: '#c04a4a', marginBottom: 12 }}>Password errata</p>}
        <button onClick={entra}
          style={{ width: '100%', padding: '13px', borderRadius: 12, background: '#2c2419', color: '#fff', border: 'none', fontSize: 14, fontWeight: 600, letterSpacing: 1, cursor: 'pointer' }}>
          ENTRA
        </button>
      </div>
    </div>
  )
}
