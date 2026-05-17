import { useState } from 'react'
import { Modal } from './ui'
import { Dot } from './ColorPicker'

export default function AccostamentoModal({ collezione, onClose }) {
  const tutti = collezione.materiali.flatMap(m =>
    m.colori.map(c => ({ colore: c, materiale: m.nome, id: m.id + c }))
  )

  // Tutti selezionati di default
  const [selezionati, setSelezionati] = useState(
    Object.fromEntries(tutti.map(c => [c.id, true]))
  )

  function toggleColore(id) {
    setSelezionati(prev => ({ ...prev, [id]: !prev[id] }))
  }

  const attivi = tutti.filter(c => selezionati[c.id])

  return (
    <Modal title="Abbina colori" onClose={onClose} maxW={500}>
      {tutti.length < 2 ? (
        <p style={{ textAlign: 'center', color: 'var(--text-3)', padding: '20px 0' }}>
          Aggiungi almeno 2 materiali con colori per vedere gli accostamenti!
        </p>
      ) : (<>

        {/* Selezione colori */}
        <Section label="Scegli quali colori abbinare">
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
            {tutti.map(item => (
              <button key={item.id} onClick={() => toggleColore(item.id)}
                style={{
                  display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5,
                  background: 'none', border: 'none', cursor: 'pointer', padding: 4,
                  opacity: selezionati[item.id] ? 1 : 0.3,
                  transition: 'opacity 0.18s',
                }}>
                <div style={{
                  width: 48, height: 48, borderRadius: 12,
                  background: item.colore,
                  boxShadow: selezionati[item.id] ? '0 0 0 3px #fff, 0 0 0 5px ' + item.colore : 'var(--shadow-s)',
                  transition: 'box-shadow 0.18s',
                }} />
                <span style={{ fontSize: 9, color: 'var(--text-3)', textAlign: 'center', maxWidth: 56, lineHeight: 1.2 }}>
                  {item.materiale}
                </span>
              </button>
            ))}
          </div>
          <p style={{ fontSize: 11, color: 'var(--text-3)', marginTop: 8 }}>
            Clicca su un colore per includerlo o escluderlo dall'accostamento
          </p>
        </Section>

        {attivi.length < 2 ? (
          <p style={{ textAlign: 'center', color: 'var(--text-3)', padding: '10px 0', fontSize: 13 }}>
            Seleziona almeno 2 colori per vedere l'accostamento
          </p>
        ) : (<>
          <Section label="Bande affiancate">
            <div style={{ display: 'flex', height: 80, borderRadius: 14, overflow: 'hidden', boxShadow: 'var(--shadow-m)' }}>
              {attivi.map((item, i) => (
                <div key={i} style={{ flex: 1, background: item.colore }} title={item.materiale} />
              ))}
            </div>
          </Section>

          <Section label="Palette circolare">
            <div style={{ display: 'flex', paddingLeft: 6 }}>
              {attivi.map((item, i) => (
                <div key={i} title={item.materiale} style={{
                  width: 56, height: 56, borderRadius: '50%',
                  background: item.colore,
                  border: '3px solid var(--surface-s)',
                  marginLeft: i === 0 ? 0 : -18, zIndex: i,
                  boxShadow: 'var(--shadow-s)',
                }} />
              ))}
            </div>
          </Section>

          <Section label="Proporzioni">
            <div style={{ display: 'flex', height: 24, borderRadius: 8, overflow: 'hidden', gap: 2 }}>
              {attivi.map((item, i) => (
                <div key={i} style={{ flex: 1, background: item.colore, borderRadius: 4 }} title={item.materiale} />
              ))}
            </div>
          </Section>
        </>)}

        <Section label="Tutti i materiali">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
            {collezione.materiali.map(m => (
              <div key={m.id} style={{ display: 'flex', alignItems: 'center', gap: 10, background: 'var(--surface-2)', borderRadius: 10, padding: '8px 12px' }}>
                <div style={{ display: 'flex', gap: 3 }}>
                  {m.colori.map((c, i) => <Dot key={i} color={c} size={14} />)}
                </div>
                <span style={{ fontSize: 13, fontWeight: 600 }}>{m.nome}</span>
              </div>
            ))}
          </div>
        </Section>

      </>)}
    </Modal>
  )
}

function Section({ label, children }) {
  return (
    <div style={{ marginBottom: 22 }}>
      <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: 1.2, textTransform: 'uppercase', color: 'var(--text-3)', marginBottom: 10 }}>
        {label}
      </div>
      {children}
    </div>
  )
}
