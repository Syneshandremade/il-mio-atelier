import { useState, useRef } from 'react'
import { Modal, Field, Input, Textarea, Select, Btn, Row, Divider } from './ui'
import { ColorPicker } from './ColorPicker'
import { CAT_MATERIALI, UNITA_MISURA } from '../constants'

// Comprime immagine
function compressImage(file, cb) {
  const reader = new FileReader()
  reader.onload = ev => {
    const img = new Image()
    img.onload = () => {
      const MAX = 900
      let { width: w, height: h } = img
      if (w > MAX || h > MAX) {
        if (w > h) { h = Math.round(h * MAX / w); w = MAX }
        else { w = Math.round(w * MAX / h); h = MAX }
      }
      const c = document.createElement('canvas')
      c.width = w; c.height = h
      c.getContext('2d').drawImage(img, 0, 0, w, h)
      cb(c.toDataURL('image/jpeg', 0.8))
    }
    img.src = ev.target.result
  }
  reader.readAsDataURL(file)
}

// Estrae i colori predominanti da un'immagine base64
function estraiColori(base64, nColori = 5) {
  return new Promise(resolve => {
    const img = new Image()
    img.onload = () => {
      const canvas = document.createElement('canvas')
      const SIZE = 80
      canvas.width = SIZE; canvas.height = SIZE
      const ctx = canvas.getContext('2d')
      ctx.drawImage(img, 0, 0, SIZE, SIZE)
      const pixels = ctx.getImageData(0, 0, SIZE, SIZE).data

      // Raggruppa pixel per colore (quantizzazione semplice)
      const bucket = {}
      for (let i = 0; i < pixels.length; i += 4) {
        const r = pixels[i], g = pixels[i+1], b = pixels[i+2], a = pixels[i+3]
        if (a < 128) continue // ignora trasparenti
        // Arrotonda a blocchi di 32 per raggruppare colori simili
        const rq = Math.round(r / 32) * 32
        const gq = Math.round(g / 32) * 32
        const bq = Math.round(b / 32) * 32
        const key = `${rq},${gq},${bq}`
        bucket[key] = (bucket[key] || 0) + 1
      }

      // Ordina per frequenza e prendi i top
      const sorted = Object.entries(bucket)
        .sort((a, b) => b[1] - a[1])
        .slice(0, nColori * 3)

      // Filtra colori troppo chiari o troppo scuri
      const filtrati = sorted.filter(([key]) => {
        const [r, g, b] = key.split(',').map(Number)
        const lum = (r * 299 + g * 587 + b * 114) / 1000
        return lum > 20 && lum < 235
      })

      const colori = filtrati.slice(0, nColori).map(([key]) => {
        const [r, g, b] = key.split(',').map(Number)
        return '#' + [r, g, b].map(v => v.toString(16).padStart(2, '0')).join('')
      })

      resolve(colori.length > 0 ? colori : ['#d4a870'])
    }
    img.src = base64
  })
}

export default function MaterialeModal({ editData, catOverride, onSave, onClose }) {
  const isEdit = !!editData
  const fileRef = useRef()
  const categorie = catOverride || CAT_MATERIALI

  const [importUrl,      setImportUrl]      = useState('')
  const [importing,      setImporting]      = useState(false)
  const [importError,    setImportError]    = useState('')
  const [importedFields, setImportedFields] = useState([])
  const [estraendo,      setEstraendo]      = useState(false)

  const [f, setF] = useState({
    nome:          editData?.nome          || '',
    categoria:     editData?.categoria     || categorie[0]?.id || 'filati',
    colori:        editData?.colori        ? [...editData.colori] : ['#d4a870'],
    note:          editData?.note          || '',
    immagine:      editData?.immagine      || null,
    costoUnitario: editData?.costoUnitario ?? '',
    unitaMisura:   editData?.unitaMisura   || 'matassa',
    quantita:      editData?.quantita      ?? '',
    fornitore:     editData?.fornitore     || '',
    linkFornitore: editData?.linkFornitore || '',
  })
  const set = k => v => setF(p => ({ ...p, [k]: v }))

  async function handleImg(e) {
    const file = e.target.files[0]
    if (!file) return
    compressImage(file, async url => {
      setF(p => ({ ...p, immagine: url }))
      // Estrai colori automaticamente
      setEstraendo(true)
      const colori = await estraiColori(url)
      setF(p => ({ ...p, colori }))
      setEstraendo(false)
    })
  }

  async function importaDalLink() {
    if (!importUrl.trim()) return
    setImporting(true); setImportError(''); setImportedFields([])
    try {
      const res  = await fetch(`/api/scrape?url=${encodeURIComponent(importUrl.trim())}`)
      const data = await res.json()
      if (!res.ok || data.error) throw new Error(data.error || 'Errore sconosciuto')
      const aggiornati = []
      setF(prev => {
        const next = { ...prev }
        if (data.nome && !prev.nome) { next.nome = data.nome; aggiornati.push('nome') }
        if (data.prezzo && !prev.costoUnitario) { next.costoUnitario = data.prezzo; aggiornati.push('prezzo') }
        if (data.fornitore && !prev.fornitore) { next.fornitore = data.fornitore; aggiornati.push('fornitore') }
        if (!prev.linkFornitore) { next.linkFornitore = importUrl.trim(); aggiornati.push('link') }
        if (data.descrizione && !prev.note) { next.note = data.descrizione; aggiornati.push('note') }
        return next
      })
      if (data.immagine) {
        try {
          const imgRes = await fetch(`/api/scrape?url=${encodeURIComponent(data.immagine)}`)
          if (imgRes.ok) {
            const blob = await imgRes.blob()
            if (blob.type.startsWith('image/')) {
              const reader = new FileReader()
              reader.onload = async ev => {
                const url = ev.target.result
                setF(p => ({ ...p, immagine: url }))
                const colori = await estraiColori(url)
                setF(p => ({ ...p, colori }))
                aggiornati.push('foto', 'colori')
                setImportedFields([...aggiornati])
              }
              reader.readAsDataURL(blob)
            }
          }
        } catch {}
      }
      setImportedFields([...aggiornati])
    } catch (err) {
      setImportError(err.message || 'Impossibile leggere la pagina.')
    } finally {
      setImporting(false)
    }
  }

  function save() {
    if (!f.nome.trim()) return
    onSave({
      id: editData?.id || ('m-' + Date.now()),
      ...f,
      costoUnitario: parseFloat(f.costoUnitario) || 0,
      quantita:      parseFloat(f.quantita)      || 0,
      createdAt:     editData?.createdAt || Date.now(),
    })
  }

  return (
    <Modal title={isEdit ? 'Modifica' : 'Nuovo Materiale'} onClose={onClose}>

      {/* Importa dal link */}
      <div style={{ background: 'linear-gradient(135deg, #fdf6ee, #f5ece0)', border: '1.5px solid #e8d8c4', borderRadius: 'var(--r-l)', padding: '14px 16px', marginBottom: 22 }}>
        <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-2)', marginBottom: 10 }}>Importa dal sito del fornitore</div>
        <div style={{ display: 'flex', gap: 8 }}>
          <input value={importUrl} onChange={e => { setImportUrl(e.target.value); setImportError('') }}
            onKeyDown={e => e.key === 'Enter' && importaDalLink()}
            placeholder="Incolla il link del prodotto..."
            style={{ flex: 1, padding: '9px 12px', borderRadius: 'var(--r-m)', border: '1.5px solid #ddd0c0', fontSize: 13, fontFamily: 'var(--ff-body)', background: '#fff', outline: 'none' }} />
          <button onClick={importaDalLink} disabled={importing || !importUrl.trim()}
            style={{ background: importing ? '#ccc' : 'var(--accent-warm)', color: '#fff', border: 'none', borderRadius: 'var(--r-m)', padding: '9px 16px', fontSize: 13, fontWeight: 700, cursor: importing ? 'wait' : 'pointer', whiteSpace: 'nowrap', flexShrink: 0 }}>
            {importing ? 'Lettura...' : 'Importa'}
          </button>
        </div>
        {importError && <p style={{ marginTop: 8, fontSize: 12, color: '#c04a4a' }}>{importError}</p>}
        {importedFields.length > 0 && !importing && <p style={{ marginTop: 8, fontSize: 12, color: '#4a8e4a', fontWeight: 600 }}>Precompilati: {importedFields.join(', ')}</p>}
        <p style={{ marginTop: 6, fontSize: 11, color: 'var(--text-3)' }}>Funziona con HobbyPerline, LaCariaRicami, Etsy e la maggior parte degli e-commerce.</p>
      </div>

      <Field label="Nome">
        <Input value={f.nome} onChange={set('nome')} placeholder="Es. Rafia naturale, Perline rosa 4mm..." />
      </Field>

      <Field label="Categoria">
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 7 }}>
          {categorie.map(cat => (
            <button key={cat.id} onClick={() => setF(p => ({ ...p, categoria: cat.id }))}
              style={{ padding: '7px 13px', borderRadius: 'var(--r-pill)', border: '1.5px solid', borderColor: f.categoria === cat.id ? cat.cssVar : 'var(--border-s)', background: f.categoria === cat.id ? cat.cssVar + '22' : '#fff', color: f.categoria === cat.id ? cat.cssVar : 'var(--text-3)', fontSize: 13, fontWeight: 700, cursor: 'pointer' }}>
              {cat.emoji} {cat.label}
            </button>
          ))}
        </div>
      </Field>

      <Field label={estraendo ? 'Colori (rilevamento in corso...)' : 'Colori'} hint="Carica una foto per rilevare i colori automaticamente">
        <ColorPicker colori={f.colori} setColori={set('colori')} />
      </Field>

      <Divider />

      <Field label="Costo & Quantita">
        <Row gap={10}>
          <div style={{ flex: 1 }}>
            <Input type="number" value={f.costoUnitario} onChange={set('costoUnitario')} placeholder="Euro costo" min="0" step="0.01" />
          </div>
          <span style={{ color: 'var(--text-3)', fontSize: 13 }}>per</span>
          <div style={{ flex: 1.2 }}>
            <Select value={f.unitaMisura} onChange={set('unitaMisura')} options={UNITA_MISURA.map(u => ({ value: u, label: u }))} />
          </div>
        </Row>
        <div style={{ marginTop: 8 }}>
          <Input type="number" value={f.quantita} onChange={set('quantita')} placeholder="Quantita in stock" min="0" step="0.5" />
        </div>
        {f.costoUnitario > 0 && f.quantita > 0 && (
          <p style={{ marginTop: 6, fontSize: 12, color: 'var(--accent-warm)', fontWeight: 700 }}>
            Valore stock: euro{(parseFloat(f.costoUnitario) * parseFloat(f.quantita)).toFixed(2)}
          </p>
        )}
      </Field>

      <Divider />

      <Field label="Fornitore">
        <Input value={f.fornitore} onChange={set('fornitore')} placeholder="Nome del fornitore" />
      </Field>
      <Field label="Link fornitore">
        <Input value={f.linkFornitore} onChange={set('linkFornitore')} placeholder="https://..." />
      </Field>

      <Divider />

      <Field label="Foto" hint="I colori vengono rilevati automaticamente dalla foto">
        <input type="file" ref={fileRef} accept="image/*" onChange={handleImg} style={{ display: 'none' }} />
        {f.immagine ? (
          <div style={{ position: 'relative' }}>
            <img src={f.immagine} alt="" style={{ width: '100%', height: 130, objectFit: 'cover', borderRadius: 10 }} />
            {estraendo && (
              <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.4)', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 13, fontWeight: 700 }}>
                Rilevamento colori...
              </div>
            )}
            <button onClick={() => setF(p => ({ ...p, immagine: null }))}
              style={{ position: 'absolute', top: 8, right: 8, background: 'rgba(0,0,0,0.55)', color: '#fff', border: 'none', borderRadius: 8, padding: '4px 10px', fontSize: 12, fontWeight: 700, cursor: 'pointer' }}>
              Rimuovi
            </button>
          </div>
        ) : (
          <button onClick={() => fileRef.current.click()}
            style={{ width: '100%', height: 72, border: '2px dashed var(--border-s)', borderRadius: 10, background: 'var(--surface-2)', color: 'var(--text-3)', fontSize: 14, fontWeight: 600, cursor: 'pointer' }}>
            Aggiungi foto — i colori verranno rilevati automaticamente
          </button>
        )}
      </Field>

      <Field label="Note">
        <Textarea value={f.note} onChange={set('note')} placeholder="Misura foro, codice colore, note..." rows={2} />
      </Field>

      <div style={{ marginTop: 6 }}>
        <Btn fullWidth color="var(--accent)" onClick={save}>
          {isEdit ? 'Salva modifiche' : '+ Aggiungi materiale'}
        </Btn>
      </div>
    </Modal>
  )
}
