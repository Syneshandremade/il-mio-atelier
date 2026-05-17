// ══════════════════════════════════════════
// PERSONALIZZAZIONE GLOBALE
// Modifica questo file per adattare l'app!
// ══════════════════════════════════════════

export const APP_NAME    = 'Il Mio Atelier'
export const APP_TAGLINE = 'Materiali & Creazioni'
export const APP_EMOJI   = '🪡'

// ── Categorie MATERIALI ──────────────────
// Aggiungi, rimuovi o rinomina liberamente
export const CAT_MATERIALI = [
  { id: 'filati',   label: 'Filati',         emoji: '🧶', cssVar: 'var(--cat-filati)'   },
  { id: 'perline',  label: 'Perline',         emoji: '📿', cssVar: 'var(--cat-perline)'  },
  { id: 'fili',     label: 'Fili gioielli',   emoji: '✨', cssVar: 'var(--cat-fili)'     },
  { id: 'fermagli', label: 'Fermagli',        emoji: '🔗', cssVar: 'var(--cat-fermagli)' },
  { id: 'tessuti',  label: 'Tessuti/Rafia',   emoji: '🌿', cssVar: 'var(--cat-tessuti)'  },
  { id: 'altro',    label: 'Altro',           emoji: '📦', cssVar: 'var(--cat-altro)'    },
]

// ── Categorie PRODOTTI FINITI ────────────
export const CAT_PRODOTTI = [
  { id: 'borse',     label: 'Borse',      emoji: '👜', cssVar: 'var(--prod-borse)'     },
  { id: 'collane',   label: 'Collane',    emoji: '📿', cssVar: 'var(--prod-collane)'   },
  { id: 'bracciali', label: 'Bracciali',  emoji: '✨', cssVar: 'var(--prod-bracciali)' },
  { id: 'orecchini', label: 'Orecchini',  emoji: '💎', cssVar: 'var(--prod-orecchini)' },
  { id: 'altro',     label: 'Altro',      emoji: '🎀', cssVar: 'var(--prod-altro)'     },
]

// ── Unità di misura per i costi ──────────
export const UNITA_MISURA = [
  'matassa', 'bobina', 'metro', '100g', '50g',
  'pz', 'conf. da 10', 'conf. da 50', 'conf. da 100', 'kit',
]

// ── Numero max colori per materiale ──────
export const MAX_COLORI = 6

// ── Dati di esempio al primo avvio ───────
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
        fornitore: 'La Merceria Online',
        linkFornitore: 'https://example.com',
        createdAt: Date.now(),
      },
      {
        id: 'demo-m-2',
        nome: 'Perline vetro turchese 4mm',
        categoria: 'perline',
        colori: ['#4ab8c1', '#2a8fa0', '#7dd4d8'],
        note: 'Misura 4mm, foro 1mm',
        immagine: null,
        costoUnitario: 2.20,
        unitaMisura: 'conf. da 100',
        quantita: 5,
        fornitore: 'Bead Shop IT',
        linkFornitore: '',
        createdAt: Date.now(),
      },
    ],
    createdAt: Date.now(),
  },
]

export const PRODOTTI_DEFAULT = [
  {
    id: 'demo-p-1',
    nome: 'Borsa sole estiva',
    descrizione: 'Borsa all\'uncinetto in rafia con manici in legno',
    immagine: null,
    categoria: 'borse',
    materialiUsati: [{ nome: 'Rafia naturale paglia', costo: 10.50 }],
    costoAltro: 3.00,
    prezzoDiVendita: 55.00,
    venduto: false,
    linkModello: '',
    note: 'Tempo: ~6 ore',
    createdAt: Date.now(),
  },
]
