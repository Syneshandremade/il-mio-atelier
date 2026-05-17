# 🪡 Il Mio Atelier v2

App per organizzare materiali, prodotti e analisi economica delle tue creazioni all'uncinetto.

## ✨ Cosa puoi fare

### 🧶 Materiali
- Organizza in collezioni con colore e descrizione personalizzati
- Per ogni materiale: foto, colori, categoria, note
- Costo unitario + unità di misura + quantità in stock → valore stock automatico
- Fornitore con link esterno cliccabile
- Accostamenti di colore visivi (bande, swatches, palette circolare)

### 👜 Prodotti finiti
- Registra borse, collane, bracciali, orecchini…
- Elenca i materiali usati con relativo costo
- Altri costi (manici, chiusure, spedizioni…)
- Prezzo di vendita → margine calcolato automaticamente
- Link al modello/pattern
- Segna come "venduto" con un click

### 📊 Analisi
- Investimento totale per categoria materiale (filati, perline, fili gioielli…)
- Ricavi e margini per tipo di prodotto
- Top 5 prodotti più redditizi per margine %
- Stock da vendere con ricavo potenziale

---

## 🚀 Deploy su Vercel

### 1. Installa Node.js
Da https://nodejs.org — versione 18 o superiore

### 2. Installa dipendenze
```bash
cd il-mio-atelier
npm install
```

### 3. (Opzionale) Prova in locale
```bash
npm run dev
# apri http://localhost:5173
```

### 4. Carica su GitHub
- Crea account su https://github.com
- Nuovo repository → chiama `il-mio-atelier`
- Carica tutti i file con "uploading an existing file"

### 5. Deploy su Vercel
- Vai su https://vercel.com → accedi con GitHub
- "Add New Project" → seleziona `il-mio-atelier`
- Clicca **Deploy** — Vercel riconosce Vite automaticamente
- In 1-2 minuti hai il tuo link personale!

---

## 🎨 Personalizzazione

### Nome e struttura app → `src/constants.js`
```js
export const APP_NAME    = 'Il Mio Atelier'   // ← cambia il nome
export const APP_TAGLINE = 'Materiali & Creazioni'
export const APP_EMOJI   = '🪡'

// Aggiungi/rinomina categorie materiali e prodotti
export const CAT_MATERIALI = [ ... ]
export const CAT_PRODOTTI  = [ ... ]
```

### Colori interfaccia → `src/index.css`
```css
:root {
  --bg:          #f7f2eb;   /* sfondo principale */
  --accent-warm: #c4703a;   /* colore accento caldo */
  /* ecc. */
}
```

---

## 📁 Struttura file

```
src/
├── App.jsx                    # App principale (3 tab)
├── index.css                  # Design system + variabili
├── constants.js               # ← Personalizza qui!
├── hooks/
│   └── useStorage.js          # Salvataggio automatico browser
└── components/
    ├── ui.jsx                 # Componenti base (Modal, Input, Btn…)
    ├── ColorPicker.jsx        # Selettore colori
    ├── MaterialeCard.jsx      # Card materiale
    ├── MaterialeModal.jsx     # Form materiale
    ├── CollezioneModal.jsx    # Form collezione
    ├── AccostamentoModal.jsx  # Vista accostamenti
    ├── ProdottoCard.jsx       # Card prodotto finito
    ├── ProdottoModal.jsx      # Form prodotto
    └── AnalisiDashboard.jsx   # Dashboard analisi
```

---

*I dati sono salvati nel browser (localStorage). Fai un backup esportando i dati se cambi dispositivo.*
