import { useState } from 'react'
import { Modal, Field, Input, Textarea, Btn } from './ui'

const PRESETS = ['#c4703a','#7378c0','#6e9a5e','#c4a44a','#5a8eaa','#c07878','#8e6e5e','#5e7a8e']

export default function CollezioneModal({ editData, onSave, onClose }) {
  const [nome, setNome]       = useState(editData?.nome || '')
  const [desc, setDesc]       = useState(editData?.descrizione || '')
  const [colore, setColore]   = useState(editData?.colore || '#c4703a')

  function save() {
    if (!nome.trim()) return
    onSave({ id: editData?.id || ('col-' + Date.now()), nome, descrizione: desc, colore, materiali: editData?.materiali || [], createdAt: editData?.createdAt || Date.now() })
  }

  return (
    <Modal title={editData ? 'Modifica Collezione' : 'Nuova Collezione'} onClose={onClose}>
      <Field label="Nome collezione">
        <Input value={nome} onChange={setNome} placeholder="Es. Estate 2026, Boho Autunno…" />
      </Field>
      <Field label="Descrizione">
        <Textarea value={desc} onChange={setDesc} placeholder="Tema, ispirazione, modelli previsti…" rows={2} />
      </Field>
      <Field label="Colore etichetta">
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
          {PRESETS.map(c => (
            <button key={c} onClick={() => setColore(c)}
              style={{
                width: 30, height: 30, borderRadius: '50%', background: c,
                border: colore === c ? `3px solid ${c}` : 'none',
                boxShadow: colore === c ? `0 0 0 3px #fff, 0 0 0 5px ${c}` : 'var(--shadow-s)',
                cursor: 'pointer', transform: colore === c ? 'scale(1.15)' : 'scale(1)',
                transition: 'all 0.15s',
              }} />
          ))}
          <input type="color" value={colore} onChange={e => setColore(e.target.value)}
            style={{ width: 30, height: 30, borderRadius: '50%', border: '2px dashed var(--border-s)', padding: 2, cursor: 'pointer' }} />
        </div>
        <div style={{ marginTop: 10 }}>
          <span style={{ background: colore, color: '#fff', padding: '5px 14px', borderRadius: 'var(--r-pill)', fontSize: 13, fontWeight: 700 }}>
            {nome || 'Anteprima'}
          </span>
        </div>
      </Field>
      <Btn fullWidth color={colore} onClick={save}>
        {editData ? '✓ Salva' : '+ Crea Collezione'}
      </Btn>
    </Modal>
  )
}
