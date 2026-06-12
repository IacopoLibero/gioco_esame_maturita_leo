# Leonardo Campaign — Gioco Narrativo Multi-Device

Gioco narrativo interattivo per il colloquio di maturità di Leonardo Nullo Bernabei.  
La **lavagna** (PC/proiettore) controlla il ritmo; i **telefoni** dei commissari ricevono le domande e rispondono in modo anonimo.

---

## Come funziona

| Chi | Cosa vede |
|-----|-----------|
| Lavagna | QR code → narrazione → risposte aggregate in tempo reale |
| Telefono | Una domanda alla volta → risposta anonima → schermata di attesa |

**Flusso:**
1. Apri `/?board` su PC/proiettore → genera codice stanza e QR code
2. I commissari scansionano il QR con il telefono → si collegano automaticamente
3. Premi **Avanti** → parte il Livello 1 sui telefoni
4. I telefoni rispondono → la lavagna vede le barre di risposta in tempo reale
5. Premi **Avanti** → Livello 2 sui telefoni (le risposte precedenti scompaiono)
6. Ripeti per tutti e 6 i livelli → schermata finale

---

## Stack tecnico

| Layer | Tecnologia |
|-------|-----------|
| Framework | Next.js 14 (App Router) |
| Frontend | React 18 |
| Realtime | Polling HTTP ogni 1.5 secondi |
| Stato | In-memory (Map su `globalThis`) |
| QR code | `react-qr-code` |
| Deploy | Vercel (tutto in un solo progetto) |

---

## Avvio locale

```bash
npm install
npm run dev
```

Apri:
- Lavagna: http://localhost:3000/?board
- Telefono (su rete LAN): http://IP-del-PC:3000/?room=CODICE

---

## Deploy su Vercel ✅

Questo progetto è ottimizzato per Vercel. Passi:

### 1. Pubblica su GitHub

```bash
git init
git add .
git commit -m "feat: leonardo campaign multi-device"
git remote add origin https://github.com/TUO_UTENTE/maturita-leo.git
git push -u origin main
```

### 2. Collega su Vercel

1. Vai su [vercel.com](https://vercel.com) → **Add New Project**
2. Importa il repository GitHub
3. Framework: **Next.js** (auto-rilevato)
4. Clicca **Deploy**

Nessuna variabile d'ambiente necessaria.

### 3. Usa

- Lavagna: `https://tuo-progetto.vercel.app/?board`
- Telefono: scansiona il QR (URL auto-generato)

---

## Nota sullo stato in-memory

Lo stato delle stanze vive in RAM nella singola istanza Next.js.  
Su Vercel free tier, con poche decine di utenti, resterà sulla stessa istanza per tutta la durata della presentazione (~10 minuti).

Se il server si riavvia (es. primo accesso dopo idle), la stanza si ricrea automaticamente con un nuovo codice — basta ricaricare la lavagna e far rescansionare il QR.

Per una soluzione persistente a lungo termine: aggiungere [Vercel KV](https://vercel.com/docs/storage/vercel-kv) come storage esterno.

---

## Struttura del progetto

```
├── app/
│   ├── layout.jsx          # Root layout Next.js
│   ├── page.jsx            # Router: ?board | ?room=CODE | landing
│   └── api/
│       ├── room/route.js   # POST — la lavagna crea la stanza
│       ├── state/route.js  # GET  — polling dello stato (ogni 1.5s)
│       └── action/route.js # POST — advance / restart / answer / join
├── lib/
│   └── state.js            # Singleton in-memory store
├── src/
│   ├── Board.jsx           # Interfaccia lavagna
│   ├── Phone.jsx           # Interfaccia telefono
│   ├── Landing.jsx         # Pagina iniziale
│   ├── useGameState.js     # Hook di polling
│   ├── content.js          # I 6 livelli del gioco (testi, domande, scelte)
│   └── styles.css          # Design system
└── leonardo-campaign.html  # Demo statica originale (riferimento)
```

---

## Personalizzare i contenuti

Modifica **`src/content.js`** per cambiare testi, domande o scelte di ogni livello.  
Ogni livello ha questa struttura:

```js
{
  years: 'Prima superiore',
  title: 'Titolo del livello',
  phase: 'Nome della fase',
  text1: 'Paragrafo narrativo 1',
  text2: 'Paragrafo narrativo 2',
  tags: ['Tag1', 'Tag2', 'Tag3'],
  question: 'La domanda per la commissione?',
  choices: ['Opzione A', 'Opzione B', 'Opzione C'],
  feedback: 'Commento riservato alla lavagna dopo le risposte.',
}
```

---

## Requisiti browser

| Dispositivo | Browser |
|-------------|---------|
| Lavagna | Chrome / Firefox / Safari recenti |
| Telefono | Qualsiasi browser mobile moderno |

Nessuna app da installare. Il telefono apre semplicemente l'URL via QR code.
