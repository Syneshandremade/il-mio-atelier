import { useState, useEffect, useRef } from 'react'
import { supabase } from '../supabase'

export function useSupabaseData(tabella, userId) {
  const [data,    setData]    = useState([])
  const [loading, setLoading] = useState(true)
  const fetchedRef = useRef(false)

  useEffect(() => {
    if (!userId) {
      setData([])
      setLoading(false)
      fetchedRef.current = false
      return
    }

    fetchedRef.current = false
    setLoading(true)

    supabase
      .from(tabella)
      .select('id, data')
      .eq('user_id', userId)
      .then(({ data: rows, error }) => {
        if (error) { console.error(error); setLoading(false); return }
        setData(rows ? rows.map(r => r.data) : [])
        setLoading(false)
        fetchedRef.current = true
      })
  }, [tabella, userId])

  async function salva(elemento) {
    setData(prev => {
      const esiste = prev.find(x => x.id === elemento.id)
      return esiste
        ? prev.map(x => x.id === elemento.id ? elemento : x)
        : [...prev, elemento]
    })
    await supabase
      .from(tabella)
      .upsert({ id: elemento.id, user_id: userId, data: elemento }, { onConflict: 'id' })
  }

  async function elimina(id) {
    setData(prev => prev.filter(x => x.id !== id))
    await supabase.from(tabella).delete().eq('id', id).eq('user_id', userId)
  }

  return { data, loading, salva, elimina }
}
