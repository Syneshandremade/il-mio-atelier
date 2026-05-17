// ══════════════════════════════════════════
// PERSONALIZZAZIONE GLOBALE
// ══════════════════════════════════════════

export const APP_NAME    = 'Il Mio Atelier'
export const APP_TAGLINE = 'Materiali & Creazioni'
export const APP_EMOJI   = '🪡'

// ── Categorie MATERIALI ──────────────────
export const CAT_MATERIALI = [
  { id: 'filati',   label: 'Filati',         emoji: '🧶', cssVar: 'var(--cat-filati)'   },
  { id: 'perline',  label: 'Perline',         emoji: '📿', cssVar: 'var(--cat-perline)'  },
  { id: 'fili',     label: 'Fili gioielli',   emoji: '✨', cssVar: 'var(--cat-fili)'     },
  { id: 'fermagli', label: 'Fermagli',        emoji: '🔗', cssVar: 'var(--cat-fermagli)' },
  { id: 'tessuti',  label: 'Tessuti/Rafia',   emoji: '🌿', cssVar: 'var(--cat-tessuti)'  },
  { id: 'altro',    label: 'Altro',           emoji: '📦', cssVar: 'var(--cat-altro)'    },
]

// ── Categorie IMBALLAGGI & SPEDIZIONE ────
export const CAT_IMBALLAGGI = [
  { id: 'scatole',    label: 'Scatole',       emoji: '📦', cssVar: 'var(--imb-scatole)'   },
  { id: 'sacchetti',  label: 'Sacchetti',     emoji: '🛍', cssVar: 'var(--imb-sacchetti)' },
  { id: 'carta',      label: 'Carta velina',  emoji: '📄', cssVar: 'var(--imb-carta)'     },
  { id: 'nastri',     label: 'Nastri/Spago',  emoji: '🎀', cssVar: 'var(--imb-nastri)'    },
  { id: 'etichette',  label: 'Etichette',     emoji: '🏷', cssVar: 'var(--imb-etich)'     },
  { id: 'spedizione', label: 'Spedizione',    emoji: '🚚', cssVar: 'var(--imb-sped)'      },
  { id: 'altro',      label: 'Altro',         emoji: '📋', cssVar: 'var(--imb-altro)'     },
]

// ── Categorie PRODOTTI FINITI ────────────
export const CAT_PRODOTTI = [
  { id: 'borse',     label: 'Borse',      emoji: '👜', cssVar: 'var(--prod-borse)'     },
  { id: 'collane',   label: 'Collane',    emoji: '📿', cssVar: 'var(--prod-collane)'   },
  { id: 'bracciali', label: 'Bracciali',  emoji: '✨', cssVar: 'var(--prod-bracciali)' },
  { id: 'orecchini', label: 'Orecchini',  emoji: '💎', cssVar: 'var(--prod-orecchini)' },
  { id: 'altro',     label: 'Altro',      emoji: '🎀', cssVar: 'var(--prod-altro)'     },
]

// ── Unità di misura ──────────────────────
export const UNITA_MISURA = [
  'matassa', 'bobina', 'metro', '100g', '50g',
  'pz', 'conf. da 10', 'conf. da 50', 'conf. da 100', 'kit',
]

export function getPezziPerUnita(unitaMisura = '') {
  const match = unitaMisura.match(/da (\d+)/)
  if (match) return parseInt(match[1])
  if (unitaMisura === '100g') return 100
  if (unitaMisura === '50g')  return 50
  return 1
}

export function getLabelUnitaBase(unitaMisura = '') {
  if (unitaMisura.includes('conf.')) return 'pz'
  if (unitaMisura === '100g')         return 'g'
  if (unitaMisura === '50g')          return 'g'
  return unitaMisura || 'pz'
}

export function calcolaCostoProporzionale(materiale, quantitaUsata) {
  if (!materiale?.costoUnitario || !quantitaUsata) return 0
  const ppu = getPezziPerUnita(materiale.unitaMisura)
  return (materiale.costoUnitario / ppu) * quantitaUsata
}

export const MAX_COLORI = 6

export const COLLEZIONI_DEFAULT = [
  {
    id: 'demo-col-1',
    nome: 'Estate 2026',
    descrizione: 'Borse rafia e collane colorate',
    colore: '#c4703a',
    materiali: [
      {
        id: 'demo-m-1',
        nome: 'Rafia naturale paglia',
        categoria: 'tessuti',
        colori: ['#d4a843', '#c8915a'],
        note: 'Perfetta per borse estive',
        immagine: null,
        costoUnitario: 3.50,
        unitaMisura: 'matassa',
        quantita: 8,
        fornitore: 'LaCariaRicami',
        linkFornitore: '',
        createdAt: Date.now(),
      },
      {
        id: 'demo-m-2',
        nome: 'Perline vetro turchese 4mm',
        categoria: 'perline',
        colori: ['#4ab8c1', '#2a8fa0'],
        note: 'Misura 4mm, foro 1mm',
        immagine: null,
        costoUnitario: 2.20,
        unitaMisura: 'conf. da 100',
        quantita: 5,
        fornitore: 'HobbyPerline',
        linkFornitore: '',
        createdAt: Date.now(),
      },
    ],
    createdAt: Date.now(),
  },
]

export const IMBALLAGGI_DEFAULT = [
  {
    id: 'imb-1',
    nome: 'Scatolina kraft 10x10',
    categoria: 'scatole',
    colori: ['#c8a878'],
    note: 'Per collane e bracciali',
    immagine: null,
    costoUnitario: 0.45,
    unitaMisura: 'pz',
    quantita: 50,
    fornitore: '',
    linkFornitore: '',
    createdAt: Date.now(),
  },
  {
    id: 'imb-2',
    nome: 'Carta velina avorio',
    categoria: 'carta',
    colori: ['#f5f0e8'],
    note: 'Fogli 50x70cm',
    immagine: null,
    costoUnitario: 3.80,
    unitaMisura: 'conf. da 100',
    quantita: 1,
    fornitore: '',
    linkFornitore: '',
    createdAt: Date.now(),
  },
]

export const PRODOTTI_DEFAULT = [
  {
    id: 'demo-p-1',
    nome: 'Borsa sole estiva',
    descrizione: "Borsa all'uncinetto in rafia con manici in legno",
    immagine: null,
    categoria: 'borse',
    materialiUsati: [
      { nome: 'Rafia naturale paglia', costo: 10.50, materialeId: 'demo-m-1', quantitaUsata: 3, unitaUsata: 'matassa' },
    ],
    costoAltro: 3.00,
    prezzoDiVendita: 55.00,
    venduto: false,
    dataVendita: null,
    linkModello: '',
    note: 'Tempo: ~6 ore',
    createdAt: Date.now(),
  },
]
