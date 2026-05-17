import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../supabase'

export function useSupabaseData(tabella, defaultVal, userId) {
  const [data,    setData]    = useState(defaultVal)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!userId) { setLoading(false); return }
    setLoading(true)

    supabase
      .from(tabella)
      .select('id, data')
      .eq('user_id', userId)
      .then(({ data: rows, error }) => {
        if (error) { console.error(error); setLoading(false); return }
        if (rows && rows.length > 0) {
          setData(rows.map(r => r.data))
        }
        setLoading(false)
      })
  }, [tabella, userId])

  const salva = useCallback(async (elemento) => {
    setData(prev => {
      const esiste = prev.find(x => x.id === elemento.id)
      return esiste
        ? prev.map(x => x.id === elemento.id ? elemento : x)
        : [...prev, elemento]
    })
    await supabase
      .from(tabella)
      .upsert({ id: elemento.id, user_id: userId, data: elemento }, { onConflict: 'id' })
  }, [tabella, userId])

  const elimina = useCallback(async (id) => {
    setData(prev => prev.filter(x => x.id !== id))
    await supabase.from(tabella).delete().eq('id', id).eq('user_id', userId)
  }, [tabella, userId])

  return { data, loading, salva, elimina, setData }
}
