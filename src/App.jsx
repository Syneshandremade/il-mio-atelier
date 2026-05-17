import { useState, useEffect } from 'react'
import { supabase } from './supabase'
import Auth from './Auth'
import AppContent from './AppContent'

export default function App() {
  const [session, setSession] = useState(null)
  const [ready,   setReady]   = useState(false)

  useEffect(() => {
    supabase.auth.onAuthStateChange((_e, session) => {
      setSession(session)
      setReady(true)
    })
  }, [])

  if (!ready) return null
  if (!session) return <Auth />
  return <AppContent />
}
