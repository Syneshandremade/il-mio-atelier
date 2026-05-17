import { Modal } from './ui'
import { Dot } from './ColorPicker'

export default function AccostamentoModal({ collezione, onClose }) {
  const tutti = collezione.materiali.flatMap(m =>
    m.colori.map(c => ({ colore: c, materiale: m.nome }))
  )

  return (
    <Modal title={`🎨 Accostamenti — ${collezione.nome}`} onClose={onClose} maxW={500}>
      {tutti.length < 2 ? (
        <p style={{ textAlign: 'center', color: 'var(--text-3)', padding: '20px 0' }}>
          Aggiungi almeno 2 materiali con colori per vedere gli accostamenti!
        </p>
      ) : (<>
        <Section label="Swatches">
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12 }}>
            {tutti.map((item, i) => (
              <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5 }}>
                <div style={{ width: 54, height: 54, borderRadius: 14, background: item.colore, boxShadow: 'var(--shadow-m)' }} />
                <span style={{ fontSize: 9, color: 'var(--text-3)', textAlign: 'center', maxWidth: 60, lineHeight: 1.2 }}>{item.materiale}</span>
              </div>
            ))}
          </div>
        </Section>

        <Section label="Bande affiancate">
          <div style={{ display: 'flex', height: 70, borderRadius: 14, overflow: 'hidden', boxShadow: 'var(--shadow-m)' }}>
            {tutti.map((item, i) => (
              <div key={i} style={{ flex: 1, background: item.colore }} title={item.materiale} />
            ))}
          </div>
        </Section>

        <Section label="Palette circolare">
          <div style={{ display: 'flex', paddingLeft: 6 }}>
            {tutti.map((item, i) => (
              <div key={i} title={item.materiale} style={{
                width: 52, height: 52, borderRadius: '50%',
                background: item.colore,
                border: '3px solid var(--surface-s)',
                marginLeft: i === 0 ? 0 : -16, zIndex: i,
                boxShadow: 'var(--shadow-s)',
              }} />
            ))}
          </div>
        </Section>

        <Section label="Materiali">
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
