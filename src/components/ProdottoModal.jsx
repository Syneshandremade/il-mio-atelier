import { useState, useRef } from 'react'
import { Modal, Field, Input, Textarea, Btn, Row, Divider } from './ui'
import { CAT_PRODOTTI, getPezziPerUnita, getLabelUnitaBase, calcolaCostoProporzionale } from '../constants'

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

function MagazzinoSelector({ tuttiMateriali, onSeleziona, onClose }) {
  const [cerca, setCerca] = useState('')
  const [matScelta, setMatScelta] = useState(null)
  const [quantita, setQuantita] = useState('')

    const filtrati = tuttiMateriali.filter(m =>
    (parseFloat(m.quantita) || 0) > 0 && (
      !cerca || m.nome.toLowerCase().includes(cerca.toLowerCase()) ||
      m._collezione?.toLowerCase().includes(cerca.toLowerCase())
    )
  )

  const ppu      = matScelta ? getPezziPerUnita(matScelta.unitaMisura) : 1
  const unitaB   = matScelta ? getLabelUnitaBase(matScelta.unitaMisura) : ''
  const costoCalc = matScelta && quantita
    ? calcolaCostoProporzionale(matScelta, parseFloat(quantita) || 0)
    : null

  function conferma() {
    if (!matScelta || !quantita) return
    onSeleziona({
      nome:          matScelta.nome,
      costo:         parseFloat(costoCalc.toFixed(4)),
      materialeId:   matScelta.id,
      quantitaUsata: parseFloat(quantita),
      unitaUsata:    unitaB,
    })
  }

  return (
    <div style={{ border: '1.5px solid var(--border-s)', borderRadius: 'var(--r-l)', overflow: 'hidden', marginBottom: 14 }}>
      <div style={{ padding: '10px 12px', borderBottom: '1px solid var(--border-s)', background: 'var(--surface-2)' }}>
        <input value={cerca} onChange={e => setCerca(e.target.value)}
          placeholder="🔍 Cerca nel magazzino…" autoFocus
          style={{ width: '100%', padding: '7px 10px', borderRadius: 'var(--r-m)', border: '1.5px solid var(--border-s)', fontSize: 13, fontFamily: 'var(--ff-body)', outline: 'none', background: '#fff' }} />
      </div>

      <div style={{ maxHeight: 200, overflowY: 'auto' }}>
        {filtrati.length === 0 ? (
          <p style={{ textAlign: 'center', padding: '16px', color: 'var(--text-3)', fontSize: 13 }}>Nessun materiale trovato</p>
        ) : filtrati.map(m => (
          <div key={m.id} onClick={() => { setMatScelta(m); setQuantita('') }}
            style={{
              padding: '9px 14px', cursor: 'pointer',
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              background: matScelta?.id === m.id ? 'var(--accent-warm)18' : 'transparent',
              borderLeft: matScelta?.id === m.id ? '3px solid var(--accent-warm)' : '3px solid transparent',
              transition: 'background 0.12s',
            }}>
            <div>
              <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)' }}>{m.nome}</div>
              <div style={{ fontSize: 11, color: 'var(--text-3)' }}>{m._collezione}</div>
            </div>
            <div style={{ textAlign: 'right', flexShrink: 0, marginLeft: 10 }}>
              {m.costoUnitario > 0 && (
                <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--accent-warm)' }}>
                  €{m.costoUnitario.toFixed(2)}/{m.unitaMisura}
                </div>
              )}
              {ppu > 1 && matScelta?.id === m.id && (
                <div style={{ fontSize: 10, color: 'var(--text-3)' }}>1 {m.unitaMisura} = {ppu} {unitaB}</div>
              )}
            </div>
          </div>
        ))}
      </div>

      {matScelta && (
        <div style={{ padding: '12px 14px', borderTop: '1px solid var(--border-s)', background: 'var(--surface-2)' }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-2)', marginBottom: 8 }}>
            Quante unità di «{matScelta.nome}» hai usato?
          </div>
          <Row gap={8}>
            <div style={{ flex: 1 }}>
              <input type="number" value={quantita} onChange={e => setQuantita(e.target.value)}
                placeholder={`Numero di ${unitaB}`} min="0" step={ppu > 1 ? '1' : '0.1'} autoFocus
                style={{ width: '100%', padding: '8px 12px', borderRadius: 'var(--r-m)', border: '1.5px solid var(--border-s)', fontSize: 14, fontFamily: 'var(--ff-body)', outline: 'none' }} />
            </div>
            <span style={{ fontSize: 13, color: 'var(--text-3)', flexShrink: 0 }}>{unitaB}</span>
          </Row>
          {costoCalc !== null && costoCalc > 0 && (
            <p style={{ marginTop: 6, fontSize: 12, fontWeight: 700, color: '#4a8e4a' }}>
              Costo calcolato: €{costoCalc.toFixed(2)}
              {ppu > 1 && <span style={{ fontWeight: 400, color: 'var(--text-3)' }}> ({quantita} {unitaB} su {ppu} = {((parseFloat(quantita)||0)/ppu*100).toFixed(0)}% della confezione)</span>}
            </p>
          )}
          <Row gap={8} style={{ marginTop: 10 }}>
            <Btn small color="var(--accent)" onClick={conferma} disabled={!quantita || !costoCalc}>✓ Aggiungi</Btn>
            <Btn small outline onClick={() => { setMatScelta(null); setQuantita('') }}>Annulla</Btn>
          </Row>
        </div>
      )}

      <div style={{ padding: '8px 14px', borderTop: '1px solid var(--border-s)', textAlign: 'right' }}>
        <button onClick={onClose} style={{ fontSize: 12, color: 'var(--text-3)', background: 'none', border: 'none', cursor: 'pointer' }}>
          Chiudi selettore
        </button>
      </div>
    </div>
  )
}

export default function ProdottoModal({ editData, tuttiMateriali, onSave, onClose }) {
  const isEdit  = !!editData
  const fileRef = useRef()

  const [f, setF] = useState({
    nome:            editData?.nome            || '',
    descrizione:     editData?.descrizione     || '',
    immagine:        editData?.immagine        || null,
    categoria:       editData?.categoria       || 'borse',
    materialiUsati:  editData?.materialiUsati  ? [...editData.materialiUsati] : [],
    costoAltro:      editData?.costoAltro      ?? '',
    prezzoDiVendita: editData?.prezzoDiVendita ?? '',
    linkModello:     editData?.linkModello     || '',
    note:            editData?.note            || '',
    venduto:         editData?.venduto         || false,
  })
  const set = k => v => setF(p => ({ ...p, [k]: v }))

  const [showMagazzino, setShowMagazzino] = useState(false)

  function addManuale()       { setF(p => ({ ...p, materialiUsati: [...p.materialiUsati, { nome: '', costo: '' }] })) }
  function setMat(i, fld, v)  { const m = [...f.materialiUsati]; m[i] = { ...m[i], [fld]: v }; setF(p => ({ ...p, materialiUsati: m })) }
  function removeMat(i)        { setF(p => ({ ...p, materialiUsati: p.materialiUsati.filter((_, j) => j !== i) })) }
  function addDaMagazzino(mat) { setF(p => ({ ...p, materialiUsati: [...p.materialiUsati, mat] })); setShowMagazzino(false) }

  const costoTot = f.materialiUsati.reduce((s, m) => s + (parseFloat(m.costo) || 0), 0) + (parseFloat(f.costoAltro) || 0)
  const margine  = (parseFloat(f.prezzoDiVendita) || 0) - costoTot

  function handleImg(e) {
    const file = e.target.files[0]
    if (file) compressImage(file, url => setF(p => ({ ...p, immagine: url })))
  }

  function save() {
    if (!f.nome.trim()) return
    onSave({
      id:              editData?.id || ('p-' + Date.now()),
      nome:            f.nome,
      descrizione:     f.descrizione,
      immagine:        f.immagine,
      categoria:       f.categoria,
      materialiUsati:  f.materialiUsati.map(m => ({ ...m, costo: parseFloat(m.costo) || 0 })),
      costoAltro:      parseFloat(f.costoAltro)      || 0,
      prezzoDiVendita: parseFloat(f.prezzoDiVendita) || 0,
      linkModello:     f.linkModello,
      note:            f.note,
      venduto:         f.venduto,
      dataVendita:     editData?.dataVendita || null,
      createdAt:       editData?.createdAt   || Date.now(),
    })
  }

  return (
    <Modal title={isEdit ? 'Modifica Prodotto' : 'Nuovo Prodotto'} onClose={onClose} maxW={500}>

      <Field label="Nome prodotto">
        <Input value={f.nome} onChange={set('nome')} placeholder="Es. Borsa sole estiva, Collana boho…" />
      </Field>

      <Field label="Categoria">
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 7 }}>
          {CAT_PRODOTTI.map(cat => (
            <button key={cat.id} onClick={() => setF(p => ({ ...p, categoria: cat.id }))}
              style={{ padding: '7px 13px', borderRadius: 'var(--r-pill)', border: '1.5px solid', borderColor: f.categoria === cat.id ? cat.cssVar : 'var(--border-s)', background: f.categoria === cat.id ? cat.cssVar + '22' : '#fff', color: f.categoria === cat.id ? cat.cssVar : 'var(--text-3)', fontSize: 13, fontWeight: 700, cursor: 'pointer' }}>
              {cat.emoji} {cat.label}
            </button>
          ))}
        </div>
      </Field>

      <Divider />

      <Field label="Materiali utilizzati">
        {f.materialiUsati.length > 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 10 }}>
            {f.materialiUsati.map((m, i) => (
              <div key={i} style={{ display: 'flex', gap: 6, alignItems: 'center', background: 'var(--surface-2)', borderRadius: 'var(--r-m)', padding: '8px 10px' }}>
                {m.materialeId ? (
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13, fontWeight: 600 }}>{m.nome}</div>
                    <div style={{ fontSize: 11, color: 'var(--text-3)' }}>
                      {m.quantitaUsata} {m.unitaUsata} → <b style={{ color: 'var(--accent-warm)' }}>€{parseFloat(m.costo).toFixed(2)}</b>
                    </div>
                  </div>
                ) : (
                  <>
                    <div style={{ flex: 2 }}>
                      <input value={m.nome} onChange={e => setMat(i, 'nome', e.target.value)} placeholder="Nome materiale"
                        style={{ width: '100%', padding: '6px 9px', borderRadius: 'var(--r-s)', border: '1px solid var(--border-s)', fontSize: 13, fontFamily: 'var(--ff-body)', outline: 'none' }} />
                    </div>
                    <div style={{ flex: 1 }}>
                      <input type="number" value={m.costo} onChange={e => setMat(i, 'costo', e.target.value)} placeholder="€"
                        style={{ width: '100%', padding: '6px 9px', borderRadius: 'var(--r-s)', border: '1px solid var(--border-s)', fontSize: 13, fontFamily: 'var(--ff-body)', outline: 'none' }} />
                    </div>
                  </>
                )}
                <button onClick={() => removeMat(i)} style={{ background: 'none', border: 'none', color: '#ccc', fontSize: 18, cursor: 'pointer', flexShrink: 0, lineHeight: 1, padding: 0 }}>×</button>
              </div>
            ))}
          </div>
        )}

        {showMagazzino && (
          <MagazzinoSelector tuttiMateriali={tuttiMateriali} onSeleziona={addDaMagazzino} onClose={() => setShowMagazzino(false)} />
        )}

        {!showMagazzino && (
          <div style={{ display: 'flex', gap: 8 }}>
            <button onClick={() => setShowMagazzino(true)}
              style={{ flex: 1, padding: '9px', borderRadius: 'var(--r-m)', border: '1.5px solid var(--accent-warm)', background: 'var(--accent-warm)18', color: 'var(--accent-warm)', fontSize: 13, fontWeight: 700, cursor: 'pointer' }}>
              📦 Dal magazzino
            </button>
            <button onClick={addManuale}
              style={{ flex: 1, padding: '9px', borderRadius: 'var(--r-m)', border: '1.5px dashed var(--border-s)', background: 'none', color: 'var(--text-3)', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
              ✏️ Manuale
            </button>
          </div>
        )}
      </Field>

      <Field label="Altri costi (manici, chiusure, spedizione…)">
        <Input type="number" value={f.costoAltro} onChange={set('costoAltro')} placeholder="€" min="0" step="0.01" />
      </Field>

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

      <Field label="Link al modello/pattern" hint="URL del tutorial o schema usato">
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
        <Textarea value={f.note} onChange={set('note')} placeholder="Tempo di realizzazione, varianti, taglie…" rows={2} />
      </Field>

      <Btn fullWidth color="var(--accent)" onClick={save}>
        {isEdit ? '✓ Salva modifiche' : '+ Aggiungi prodotto'}
      </Btn>
    </Modal>
  )
}
