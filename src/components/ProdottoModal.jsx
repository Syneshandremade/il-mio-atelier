import { useState, useRef } from 'react'
import { Modal, Field, Input, Textarea, Btn, Row, Divider } from './ui'
import { CAT_PRODOTTI } from '../constants'

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

export default function ProdottoModal({ editData, onSave, onClose }) {
  const isEdit  = !!editData
  const fileRef = useRef()
  const [f, setF] = useState({
    nome:             editData?.nome || '',
    descrizione:      editData?.descrizione || '',
    immagine:         editData?.immagine || null,
    categoria:        editData?.categoria || 'borse',
    materialiUsati:   editData?.materialiUsati ? [...editData.materialiUsati] : [{ nome: '', costo: '' }],
    costoAltro:       editData?.costoAltro ?? '',
    prezzoDiVendita:  editData?.prezzoDiVendita ?? '',
    linkModello:      editData?.linkModello || '',
    note:             editData?.note || '',
    venduto:          editData?.venduto || false,
  })
  const set = k => v => setF(p => ({ ...p, [k]: v }))

  // Materiali usati
  function setMat(i, field, val) {
    const m = [...f.materialiUsati]
    m[i] = { ...m[i], [field]: val }
    setF(p => ({ ...p, materialiUsati: m }))
  }
  function addMat()    { setF(p => ({ ...p, materialiUsati: [...p.materialiUsati, { nome: '', costo: '' }] })) }
  function removeMat(i){ setF(p => ({ ...p, materialiUsati: p.materialiUsati.filter((_, j) => j !== i) })) }

  const costoTot = f.materialiUsati.reduce((s, m) => s + (parseFloat(m.costo) || 0), 0) + (parseFloat(f.costoAltro) || 0)
  const margine  = (parseFloat(f.prezzoDiVendita) || 0) - costoTot

  function handleImg(e) {
    const file = e.target.files[0]
    if (file) compressImage(file, url => setF(p => ({ ...p, immagine: url })))
  }

  function save() {
    if (!f.nome.trim()) return
    onSave({
      id:        editData?.id || ('p-' + Date.now()),
      nome:      f.nome,
      descrizione: f.descrizione,
      immagine:  f.immagine,
      categoria: f.categoria,
      materialiUsati: f.materialiUsati.map(m => ({ nome: m.nome, costo: parseFloat(m.costo) || 0 })),
      costoAltro:      parseFloat(f.costoAltro) || 0,
      prezzoDiVendita: parseFloat(f.prezzoDiVendita) || 0,
      linkModello: f.linkModello,
      note:        f.note,
      venduto:     f.venduto,
      createdAt:   editData?.createdAt || Date.now(),
    })
  }

  return (
    <Modal title={isEdit ? 'Modifica Prodotto' : 'Nuovo Prodotto'} onClose={onClose} maxW={480}>
      <Field label="Nome prodotto">
        <Input value={f.nome} onChange={set('nome')} placeholder="Es. Borsa sole estiva, Collana boho…" />
      </Field>

      <Field label="Categoria">
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 7 }}>
          {CAT_PRODOTTI.map(cat => (
            <button key={cat.id} onClick={() => setF(p => ({ ...p, categoria: cat.id }))}
              style={{
                padding: '7px 13px', borderRadius: 'var(--r-pill)',
                border: '1.5px solid',
                borderColor: f.categoria === cat.id ? cat.cssVar : 'var(--border-s)',
                background:  f.categoria === cat.id ? cat.cssVar + '22' : '#fff',
                color:       f.categoria === cat.id ? cat.cssVar : 'var(--text-3)',
                fontSize: 13, fontWeight: 700, cursor: 'pointer',
              }}>{cat.emoji} {cat.label}</button>
          ))}
        </div>
      </Field>

      <Divider />

      {/* Costi materiali */}
      <Field label="Materiali utilizzati" hint="Inserisci il costo totale dei materiali usati per questo pezzo">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {f.materialiUsati.map((m, i) => (
            <Row key={i} gap={8}>
              <div style={{ flex: 2 }}>
                <Input value={m.nome} onChange={v => setMat(i, 'nome', v)} placeholder="Nome materiale" />
              </div>
              <div style={{ flex: 1 }}>
                <Input type="number" value={m.costo} onChange={v => setMat(i, 'costo', v)} placeholder="€" min="0" step="0.01" />
              </div>
              <button onClick={() => removeMat(i)}
                style={{ background: 'none', border: 'none', color: 'var(--text-3)', fontSize: 18, cursor: 'pointer', flexShrink: 0 }}>×</button>
            </Row>
          ))}
          <button onClick={addMat}
            style={{ border: '1.5px dashed var(--border-s)', borderRadius: 'var(--r-m)', background: 'none', padding: '7px', fontSize: 13, color: 'var(--text-3)', cursor: 'pointer', fontWeight: 600 }}>
            + Aggiungi materiale
          </button>
        </div>
      </Field>

      <Field label="Altri costi (manici, chiusure, spedizione…)">
        <Input type="number" value={f.costoAltro} onChange={set('costoAltro')} placeholder="€" min="0" step="0.01" />
      </Field>

      {/* Riepilogo costi */}
      {costoTot > 0 && (
        <div style={{ background: 'var(--surface-2)', borderRadius: 10, padding: '10px 14px', marginBottom: 18, fontSize: 13 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
            <span style={{ color: 'var(--text-3)' }}>Costo totale</span>
            <b>€{costoTot.toFixed(2)}</b>
          </div>
          {parseFloat(f.prezzoDiVendita) > 0 && (
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-3)' }}>Margine lordo</span>
              <b style={{ color: margine >= 0 ? '#4a8e4a' : '#c04a4a' }}>€{margine.toFixed(2)}</b>
            </div>
          )}
        </div>
      )}

      <Field label="Prezzo di vendita (€)">
        <Input type="number" value={f.prezzoDiVendita} onChange={set('prezzoDiVendita')} placeholder="€" min="0" step="0.50" />
      </Field>

      <Divider />

      <Field label="Link al modello" hint="URL del pattern o del tutorial usato">
        <Input value={f.linkModello} onChange={set('linkModello')} placeholder="https://…" />
      </Field>

      <Field label="Foto">
        <input type="file" ref={fileRef} accept="image/*" onChange={handleImg} style={{ display: 'none' }} />
        {f.immagine ? (
          <div style={{ position: 'relative' }}>
            <img src={f.immagine} alt="" style={{ width: '100%', height: 130, objectFit: 'cover', borderRadius: 10 }} />
            <button onClick={() => setF(p => ({ ...p, immagine: null }))}
              style={{ position: 'absolute', top: 8, right: 8, background: 'rgba(0,0,0,0.55)', color: '#fff', border: 'none', borderRadius: 8, padding: '4px 10px', fontSize: 12, fontWeight: 700, cursor: 'pointer' }}>
              ✕ Rimuovi
            </button>
          </div>
        ) : (
          <button onClick={() => fileRef.current.click()}
            style={{ width: '100%', height: 72, border: '2px dashed var(--border-s)', borderRadius: 10, background: 'var(--surface-2)', color: 'var(--text-3)', fontSize: 14, fontWeight: 600, cursor: 'pointer' }}>
            📷 Aggiungi foto
          </button>
        )}
      </Field>

      <Field label="Note">
        <Textarea value={f.note} onChange={set('note')} placeholder="Tempo di realizzazione, taglie, varianti…" rows={2} />
      </Field>

      <Btn fullWidth color="var(--accent)" onClick={save}>
        {isEdit ? '✓ Salva modifiche' : '+ Aggiungi prodotto'}
      </Btn>
    </Modal>
  )
}
