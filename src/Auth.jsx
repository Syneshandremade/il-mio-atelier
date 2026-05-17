import { useState } from 'react'
import { supabase } from './supabase'

export default function Auth() {
  const [modo,     setModo]     = useState('login')
  const [email,    setEmail]    = useState('')
  const [password, setPassword] = useState('')
  const [loading,  setLoading]  = useState(false)
  const [msg,      setMsg]      = useState(null)

  async function handleLogin(e) {
    e.preventDefault()
    setLoading(true); setMsg(null)
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) setMsg({ tipo: 'err', testo: traduciErrore(error.message) })
    setLoading(false)
  }

  async function handleRegister(e) {
    e.preventDefault()
    if (password.length < 6) { setMsg({ tipo: 'err', testo: 'La password deve avere almeno 6 caratteri.' }); return }
    setLoading(true); setMsg(null)
    const { error } = await supabase.auth.signUp({ email, password })
    if (error) setMsg({ tipo: 'err', testo: traduciErrore(error.message) })
    else setMsg({ tipo: 'ok', testo: "Registrazione avvenuta! Controlla la tua email per confermare l'account, poi accedi." })
    setLoading(false)
  }

  async function handleReset(e) {
    e.preventDefault()
    setLoading(true); setMsg(null)
    const { error } = await supabase.auth.resetPasswordForEmail(email)
    if (error) setMsg({ tipo: 'err', testo: traduciErrore(error.message) })
    else setMsg({ tipo: 'ok', testo: 'Email inviata! Controlla la tua casella per reimpostare la password.' })
    setLoading(false)
  }

  function traduciErrore(msg) {
    if (msg.includes('Invalid login'))       return 'Email o password errati.'
    if (msg.includes('Email not confirmed')) return "Devi confermare l'email prima di accedere."
    if (msg.includes('already registered')) return 'Email già registrata. Prova ad accedere.'
    if (msg.includes('rate limit'))         return 'Troppi tentativi. Aspetta qualche minuto.'
    return msg
  }

  const isLogin    = modo === 'login'
  const isRegister = modo === 'register'
  const isReset    = modo === 'reset'

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(145deg, #f7f2eb, #e8dccb)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20, fontFamily: 'var(--ff-body)' }}>
      <div style={{ background: '#fffcf7', borderRadius: 28, padding: '40px 36px', width: '100%', maxWidth: 400, boxShadow: '0 20px 60px rgba(0,0,0,0.12)' }}>

        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{ fontSize: 44, marginBottom: 8 }}>🪡</div>
          <h1 style={{ fontFamily: 'var(--ff-display)', fontSize: 28, fontWeight: 700, color: 'var(--text)', margin: 0 }}>Il Mio Atelier</h1>
          <p style={{ fontSize: 12, color: 'var(--text-3)', letterSpacing: 1.5, textTransform: 'uppercase', marginTop: 4 }}>Materiali & Creazioni</p>
        </div>

        <h2 style={{ fontFamily: 'var(--ff-display)', fontSize: 20, fontWeight: 700, marginBottom: 24, color: 'var(--text)' }}>
          {isLogin ? 'Accedi' : isRegister ? 'Crea account' : 'Recupera password'}
        </h2>

        <form onSubmit={isLogin ? handleLogin : isRegister ? handleRegister : handleReset}>
          <div style={{ marginBottom: 14 }}>
            <label style={{ display: 'block', fontSize: 11, fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase', color: 'var(--text-3)', marginBottom: 6 }}>Email</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)}
              placeholder="la-tua@email.com" required
              style={{ width: '100%', padding: '11px 14px', borderRadius: 12, border: '1.5px solid var(--border-s)', fontSize: 14, fontFamily: 'var(--ff-body)', outline: 'none', boxSizing: 'border-box', background: '#fff' }}
              onFocus={e => e.target.style.borderColor = 'var(--accent-warm)'}
              onBlur={e => e.target.style.borderColor = 'var(--border-s)'} />
          </div>

          {!isReset && (
            <div style={{ marginBottom: 22 }}>
              <label style={{ display: 'block', fontSize: 11, fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase', color: 'var(--text-3)', marginBottom: 6 }}>Password</label>
              <input type="password" value={password} onChange={e => setPassword(e.target.value)}
                placeholder={isRegister ? 'Minimo 6 caratteri' : '••••••••'} required
                style={{ width: '100%', padding: '11px 14px', borderRadius: 12, border: '1.5px solid var(--border-s)', fontSize: 14, fontFamily: 'var(--ff-body)', outline: 'none', boxSizing: 'border-box', background: '#fff' }}
                onFocus={e => e.target.style.borderColor = 'var(--accent-warm)'}
                onBlur={e => e.target.style.borderColor = 'var(--border-s)'} />
            </div>
          )}

          {msg && (
            <div style={{ padding: '10px 14px', borderRadius: 10, marginBottom: 16, fontSize: 13, background: msg.tipo === 'ok' ? '#4a8e4a18' : '#c04a4a18', color: msg.tipo === 'ok' ? '#4a8e4a' : '#c04a4a', border: `1px solid ${msg.tipo === 'ok' ? '#4a8e4a44' : '#c04a4a44'}` }}>
              {msg.testo}
            </div>
          )}

          <button type="submit" disabled={loading}
            style={{ width: '100%', padding: '13px', borderRadius: 12, background: loading ? '#ccc' : 'var(--accent)', color: '#fff', border: 'none', fontSize: 15, fontWeight: 700, cursor: loading ? 'wait' : 'pointer', fontFamily: 'var(--ff-body)' }}>
            {loading ? '⏳ Attendi…' : isLogin ? 'Accedi' : isRegister ? 'Crea account' : 'Invia email di recupero'}
          </button>
        </form>

        <div style={{ marginTop: 24, display: 'flex', flexDirection: 'column', gap: 10, alignItems: 'center' }}>
          {isLogin && (<>
            <button onClick={() => { setModo('register'); setMsg(null) }}
              style={{ background: 'none', border: 'none', color: 'var(--accent-warm)', fontSize: 13, fontWeight: 700, cursor: 'pointer' }}>
              Non hai un account? Registrati
            </button>
            <button onClick={() => { setModo('reset'); setMsg(null) }}
              style={{ background: 'none', border: 'none', color: 'var(--text-3)', fontSize: 12, cursor: 'pointer' }}>
              Password dimenticata?
            </button>
          </>)}
          {(isRegister || isReset) && (
            <button onClick={() => { setModo('login'); setMsg(null) }}
              style={{ background: 'none', border: 'none', color: 'var(--accent-warm)', fontSize: 13, fontWeight: 700, cursor: 'pointer' }}>
              ← Torna al login
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
