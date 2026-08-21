# gestione_abiti

Backend REST per la gestione di abiti (Express + Sequelize + MariaDB).

Due entita' legate da una relazione molti-a-molti: un **capo** appartiene a piu'
**categorie**, una categoria raccoglie piu' capi. La tabella ponte e'
`capo_categoria`.

## Requisiti

- Node.js 20 o superiore
- MariaDB / MySQL in esecuzione su localhost

## Installazione

```bash
npm install
cp .env.example .env        # poi correggi utente e password del database
mysql -u root -p < sql/table.sql
mysql -u root -p < sql/seed.sql
```

`sql/table.sql` crea il database `gestione_abiti` e le tre tabelle,
`sql/seed.sql` inserisce 8 capi e 8 categorie gia' associati.

Le tabelle si possono creare anche senza gli script: `sequelize.sync()`
all'avvio del server le genera dai modelli. In quel caso serve pero' che il
database `gestione_abiti` esista gia'.

## Avvio

```bash
npm run dev    # nodemon, riavvio automatico
npm start      # node
```

Controllo rapido: `curl http://localhost:3000/hello`.

## Endpoint

Base URL: `http://localhost:3000/api`

### Capi

| Metodo | URL | Descrizione | Esiti |
| ------ | --- | ----------- | ----- |
| GET | `/capi` | Elenco completo, categorie incluse | 200 |
| POST | `/capi` | Crea (`nome`, `prezzo`, `taglia` obbligatori) | 201, 400, 404 |
| GET | `/capi/search?q=...` | Ricerca parziale sul nome | 200, 400 |
| GET | `/capi/disponibili` | Solo i capi con `disponibile: true` | 200 |
| GET | `/capi/:id` | Dettaglio con le categorie | 200, 400, 404 |
| PUT | `/capi/:id` | Aggiorna i campi presenti nel body | 200, 400, 404 |
| DELETE | `/capi/:id` | Elimina | 204, 400, 404 |

### Categorie

| Metodo | URL | Descrizione | Esiti |
| ------ | --- | ----------- | ----- |
| GET | `/categorie` | Elenco completo | 200 |
| POST | `/categorie` | Crea (`nome` obbligatorio e unico) | 201, 400 |
| DELETE | `/categorie/:id` | Elimina, solo se non ha capi associati | 204, 400, 404 |

La collection Postman e' in `postman/`.

## Categorie di un capo

`POST /api/capi` e `PUT /api/capi/:id` accettano `categorieIds`, un array di
id di categorie esistenti:

```json
{ "nome": "Camicia bianca", "prezzo": 19.9, "taglia": "M", "categorieIds": [1, 8] }
```

Se anche un solo id non esiste la risposta e' `404` e il capo non viene creato.
Nella PUT il campo e' facoltativo: se manca le categorie restano quelle di
prima, se e' un array vuoto vengono tolte tutte.

## Formato delle risposte

```json
{ "status": "ok", "message": "Capo trovato", "capo": { "id": 1 } }
{ "status": "errore", "message": "Capo non trovato" }
```

`DELETE` risponde `204 No Content` senza body.
Status code: 200 lettura e modifica, 201 creazione, 204 cancellazione,
400 validazione, 404 risorsa assente.

## Struttura

```
├── server.js       # avvio: connessione DB + sync + listen
├── app.js          # middleware, montaggio /api, 404 e error handler
├── config/db.js    # istanza Sequelize da .env
├── models/         # entita'; index.js dichiara le associazioni
├── routes/         # solo montaggio dei path
├── controllers/    # leggono req, validano, scelgono lo status code
├── services/       # tutte le query Sequelize
├── utils/errori.js # gestisciErrore: da Error a risposta HTTP
├── sql/            # table.sql + seed.sql
├── postman/        # collection da importare
└── docs/RICETTE.md # snippet di riferimento
```

`docs/RICETTE.md` raccoglie gli snippet di riferimento usati durante lo
sviluppo (relazioni, ricerche, paginazione, transazioni): e' materiale di
lavoro, si puo' togliere a fine progetto.

Direzione unica delle dipendenze: **route -> controller -> service -> modello**.
I service lanciano `Error` con una proprieta' `status` e non toccano mai
`res`; i controller non fanno mai query.

I modelli si importano da `require('../models')`, mai dal file singolo: e'
`models/index.js` che dichiara le associazioni.

## Punti delicati

**Ordine delle route.** `/search` e `/disponibili` sono dichiarate prima di
`/:id`: invertendole, Express interpreta `search` come un id.

**`through: { attributes: [] }`.** Nasconde le colonne della tabella ponte
lasciando visibili le categorie. Con `attributes: []` si svuota invece la
categoria stessa e la relazione sparisce dalla risposta.

**404 in JSON.** Il middleware finale in `app.js` evita che una rotta
inesistente risponda con la pagina HTML di default di Express.

**Errori con `status`.** L'error handler di `app.js` rispetta `err.status` se
minore di 500: cosi' un body JSON malformato risponde `400` e non `500`.

**`timestamps: false`.** Senza, Sequelize aggiunge `createdAt`/`updatedAt`
NOT NULL e gli INSERT di `sql/seed.sql` falliscono.

**Ricerca case-insensitive.** Si appoggia alla collation
`utf8mb4_general_ci` di MariaDB, dove `LIKE` ignora gia' le maiuscole.

**PUT parziale.** Il controller copia solo i campi diversi da `undefined`:
un PUT con il solo `prezzo` non azzera gli altri campi.

**Categorie con capi associati.** `DELETE /api/categorie/:id` risponde `400`
se la categoria e' ancora usata: va svuotata prima.
