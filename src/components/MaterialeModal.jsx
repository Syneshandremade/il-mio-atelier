import { useState, useRef } from 'react'
import { Modal, Field, Input, Textarea, Select, Btn, Row, Divider } from './ui'
import { ColorPicker } from './ColorPicker'
import { CAT_MATERIALI, UNITA_MISURA } from '../constants'

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

export default function MaterialeModal({ editData, onSave, onClose }) {
  const isEdit = !!editData
  const fileRef = useRef()
  const [f, setF] = useState({
    nome:          editData?.nome || '',
    categoria:     editData?.categoria || 'filati',
    colori:        editData?.colori ? [...editData.colori] : ['#d4a870'],
    note:          editData?.note || '',
    immagine:      editData?.immagine || null,
    costoUnitario: editData?.costoUnitario ?? '',
    unitaMisura:   editData?.unitaMisura || 'matassa',
    quantita:      editData?.quantita ?? '',
    fornitore:     editData?.fornitore || '',
    linkFornitore: editData?.linkFornitore || '',
  })
  const set = k => v => setF(p => ({ ...p, [k]: v }))

  function handleImg(e) {
    const file = e.target.files[0]
    if (file) compressImage(file, url => setF(p => ({ ...p, immagine: url })))
  }

  function save() {
    if (!f.nome.trim()) return
    onSave({
      id: editData?.id || ('m-' + Date.now()),
      ...f,
      costoUnitario: parseFloat(f.costoUnitario) || 0,
      quantita: parseFloat(f.quantita) || 0,
      createdAt: editData?.createdAt || Date.now(),
    })
  }

  return (
    <Modal title={isEdit ? 'Modifica Materiale' : 'Nuovo Materiale'} onClose={onClose}>
      <Field label="Nome">
        <Input value={f.nome} onChange={set('nome')} placeholder="Es. Rafia naturale, Perline rosa 4mm…" />
      </Field>

      <Field label="Categoria">
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 7 }}>
          {CAT_MATERIALI.map(cat => (
            <button key={cat.id} onClick={() => setF(p => ({ ...p, categoria: cat.id }))}
              style={{
                padding: '7px 13px', borderRadius: 'var(--r-pill)',
                border: '1.5px solid',
                borderColor: f.categoria === cat.id ? cat.cssVar : 'var(--border-s)',
                background: f.categoria === cat.id ? cat.cssVar + '22' : '#fff',
                color: f.categoria === cat.id ? cat.cssVar : 'var(--text-3)',
                fontSize: 13, fontWeight: 700, cursor: 'pointer',
              }}>{cat.emoji} {cat.label}</button>
          ))}
        </div>
      </Field>

      <Field label="Colori">
        <ColorPicker colori={f.colori} setColori={set('colori')} />
      </Field>

      <Divider />

      <Field label="Costo & Quantità">
        <Row gap={10}>
          <div style={{ flex: 1 }}>
            <Input type="number" value={f.costoUnitario} onChange={set('costoUnitario')}
              placeholder="€ costo" min="0" step="0.01" />
          </div>
          <span style={{ color: 'var(--text-3)', fontSize: 13 }}>per</span>
          <div style={{ flex: 1.2 }}>
            <Select value={f.unitaMisura} onChange={set('unitaMisura')}
              options={UNITA_MISURA.map(u => ({ value: u, label: u }))} />
          </div>
        </Row>
        <div style={{ marginTop: 8 }}>
          <Input type="number" value={f.quantita} onChange={set('quantita')}
            placeholder="Quantità in stock" min="0" step="0.5" />
        </div>
        {f.costoUnitario > 0 && f.quantita > 0 && (
          <p style={{ marginTop: 6, fontSize: 12, color: 'var(--accent-warm)', fontWeight: 700 }}>
            Valore stock: €{(parseFloat(f.costoUnitario) * parseFloat(f.quantita)).toFixed(2)}
          </p>
        )}
      </Field>

      <Divider />

      <Field label="Fornitore">
        <Input value={f.fornitore} onChange={set('fornitore')} placeholder="Nome del fornitore" />
      </Field>
      <Field label="Link fornitore" hint="Incolla l'URL alla pagina del prodotto">
        <Input value={f.linkFornitore} onChange={set('linkFornitore')} placeholder="https://…" />
      </Field>

      <Divider />

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
        <Textarea value={f.note} onChange={set('note')} placeholder="Misura foro, codice colore, note di lavorazione…" rows={2} />
      </Field>

      <div style={{ marginTop: 6 }}>
        <Btn fullWidth color="var(--accent)" onClick={save}>
          {isEdit ? '✓ Salva modifiche' : '+ Aggiungi materiale'}
        </Btn>
      </div>
    </Modal>
  )
}
