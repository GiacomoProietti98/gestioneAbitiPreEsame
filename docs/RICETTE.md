# Ricette

Snippet pronti per le cose che servono quasi sempre e che non stanno nello
scheletro base. Copiare e adattare i nomi.

Gli esempi usano `Libro`, `Autore` e `Categoria`: uno-a-molti tra categoria e
libri, molti-a-molti tra libri e autori.

---

## 1. Relazione uno-a-molti

Una categoria ha molti libri, un libro appartiene a una categoria.

`models/Libro.js` — la chiave esterna è un campo normale del modello:

```js
categoria_id: {
  type: DataTypes.INTEGER,
},
```

`models/index.js`:

```js
const sequelize = require("../config/db");
const Libro = require("./Libro");
const Categoria = require("./Categoria");

Categoria.hasMany(Libro, {
  foreignKey: "categoria_id",
  as: { singular: "libro", plural: "libri" },
});
Libro.belongsTo(Categoria, { foreignKey: "categoria_id", as: "categoria" });

module.exports = { sequelize, Libro, Categoria };
```

**`belongsTo` accetta solo un alias stringa.** La forma a oggetto
`{ singular, plural }` vale per `hasMany` e `belongsToMany`.

Nel service, per restituire il libro con la sua categoria:

```js
const includeCompleto = [{ model: Categoria, as: "categoria" }];

async function getLibri() {
  return await Libro.findAll({ include: includeCompleto });
}
```

L'alias `categoria` è anche la chiave con cui il dato annidato compare nel JSON.

---

## 2. Relazione molti-a-molti

```js
Libro.belongsToMany(Autore, {
  through: "libro_autore",
  foreignKey: "libro_id",
  otherKey: "autore_id",
  as: { singular: "autore", plural: "autori" },
});
Autore.belongsToMany(Libro, {
  through: "libro_autore",
  foreignKey: "autore_id",
  otherKey: "libro_id",
  as: { singular: "libro", plural: "libri" },
});
```

Sequelize genera la tabella ponte e aggiunge alle istanze i metodi
`getAutori`, `setAutori`, `addAutore`, `removeAutore`, `countAutori`: i nomi
derivano dall'alias, quindi cambiando `as` cambiano anche loro.

**Senza `as` esplicito** gli alias diventano inglesi (`Autores`) e i metodi
`setAutores`.

### Nascondere i campi della tabella ponte

```js
const includeCompleto = [
  { model: Categoria, as: "categoria" },
  { model: Autore, as: "autori", through: { attributes: [] } },
];
```

Senza `through: { attributes: [] }` nel JSON compaiono anche `libro_autore`
con le sue colonne interne.

### Timestamp della tabella ponte

Con `through: "libro_autore"` la tabella ponte nasce **con**
`createdAt`/`updatedAt` NOT NULL, anche se `Libro` e `Autore` hanno
`timestamps: false`. Due modi per gestirla:

Valorizzarli negli INSERT SQL scritti a mano:

```sql
INSERT INTO `libro_autore` (`libro_id`, `autore_id`, `createdAt`, `updatedAt`)
VALUES (1, 1, NOW(), NOW());
```

Oppure definire la tabella ponte come modello esplicito e spegnerli:

```js
const LibroAutore = sequelize.define(
  "LibroAutore",
  {},
  { tableName: "libro_autore", timestamps: false },
);

Libro.belongsToMany(Autore, { through: LibroAutore, foreignKey: "libro_id", otherKey: "autore_id", as: { singular: "autore", plural: "autori" } });
```

### Creare e aggiornare le associazioni

```js
async function createLibro(data, autoriIds = []) {
  const libro = await Libro.create(data);
  await libro.setAutori(autoriIds);
  return await getLibroById(libro.id);
}
```

Verificare prima che gli id esistano, altrimenti restano righe orfane:

```js
async function verificaAutori(autoriIds) {
  if (autoriIds.length === 0) return;

  const autori = await Autore.findAll({ where: { id: autoriIds } });
  if (autori.length !== autoriIds.length) {
    const trovati = autori.map((a) => a.id);
    const mancanti = autoriIds.filter((id) => !trovati.includes(id));
    throw erroreHttp(`Autori non trovati: ${mancanti.join(", ")}`, 404);
  }
}
```

---

## 3. Tabelle SQL con chiave esterna

Uno-a-molti:

```sql
CREATE TABLE `libro` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `titolo` varchar(255) NOT NULL,
  `categoria_id` int(11) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `categoria_id` (`categoria_id`),
  CONSTRAINT `libro_ibfk_1` FOREIGN KEY (`categoria_id`)
    REFERENCES `categoria` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
```

Tabella ponte:

```sql
CREATE TABLE `libro_autore` (
  `libro_id` int(11) NOT NULL,
  `autore_id` int(11) NOT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  PRIMARY KEY (`libro_id`,`autore_id`),
  KEY `autore_id` (`autore_id`),
  CONSTRAINT `libro_autore_ibfk_1` FOREIGN KEY (`libro_id`)
    REFERENCES `libro` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `libro_autore_ibfk_2` FOREIGN KEY (`autore_id`)
    REFERENCES `autore` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
```

Le tabelle si creano nell'ordine delle dipendenze: prima `categoria` e
`autore`, poi `libro`, poi `libro_autore`.

Nel seed l'ordine è lo stesso, e il `TRUNCATE` iniziale va fatto al contrario
(prima le tabelle che referenziano):

```sql
SET FOREIGN_KEY_CHECKS = 0;
TRUNCATE TABLE `libro_autore`;
TRUNCATE TABLE `libro`;
TRUNCATE TABLE `autore`;
TRUNCATE TABLE `categoria`;
SET FOREIGN_KEY_CHECKS = 1;
```

---

## 4. Ricerca case-insensitive portabile

Su MariaDB/MySQL con collation `_ci` basta `Op.like`, ed è quello che fanno i
service. Su Postgres `LIKE` distingue le maiuscole: questa versione funziona
su entrambi.

```js
const { Op, fn, col, where } = require("sequelize");

async function searchLibroByTitolo(titolo) {
  return await Libro.findAll({
    where: where(fn("LOWER", col("Libro.titolo")), {
      [Op.like]: `%${titolo.toLowerCase()}%`,
    }),
    include: includeCompleto,
  });
}
```

Il nome della colonna va qualificato (`Libro.titolo`): con degli `include` in
query, `titolo` da solo è ambiguo se esiste anche nelle tabelle collegate.

---

## 5. Filtri e ordinamenti

```js
// booleano
await Libro.findAll({ where: { disponibile: true } });

// intervallo
await Libro.findAll({ where: { prezzo: { [Op.between]: [10, 50] } } });

// più condizioni in OR
await Libro.findAll({
  where: { [Op.or]: [{ disponibile: true }, { prezzo: { [Op.lt]: 10 } }] },
});

// ordinamento
await Libro.findAll({ order: [["prezzo", "DESC"], ["titolo", "ASC"]] });

// conteggio raggruppato
await Libro.findAll({
  attributes: ["categoria_id", [fn("COUNT", col("id")), "totale"]],
  group: ["categoria_id"],
});
```

---

## 6. Paginazione

```js
async function getLibri({ pagina = 1, perPagina = 10 } = {}) {
  const limit = Math.min(Number(perPagina) || 10, 100);
  const offset = (Math.max(Number(pagina) || 1, 1) - 1) * limit;

  return await Libro.findAndCountAll({ limit, offset, include: includeCompleto });
}
```

`findAndCountAll` restituisce `{ count, rows }`. Nel controller:

```js
const { count, rows } = await libroService.getLibri(req.query);
res.status(200).json({
  status: "ok",
  message: "Libri trovati",
  totale: count,
  pagina: Number(req.query.pagina) || 1,
  libri: rows,
});
```

Con gli `include` di una molti-a-molti, `count` può gonfiarsi per via del JOIN:
in quel caso serve `distinct: true`.

---

## 7. Endpoint annidato

`GET /api/categorie/:id/libri` — si dichiara nella route della categoria:

```js
router.get("/:id/libri", categoriaController.getLibriByCategoria);
```

```js
async function getLibriByCategoria(id) {
  const categoria = await Categoria.findByPk(id);
  if (!categoria) {
    throw erroreHttp("Categoria non trovata", 404);
  }

  return await Libro.findAll({ where: { categoria_id: id } });
}
```

Il 404 sulla categoria inesistente va distinto dall'array vuoto di una
categoria che semplicemente non ha libri.

---

## 8. Cancellazione con figli collegati

Le FK generate da Sequelize sono `ON DELETE CASCADE`: cancellando una
categoria spariscono in silenzio tutti i suoi libri. Se non è il
comportamento voluto, il controllo va fatto prima, a livello applicativo:

```js
async function deleteCategoria(id) {
  const categoria = await Categoria.findByPk(id);
  if (!categoria) {
    throw erroreHttp("Categoria non trovata", 404);
  }

  const libri = await Libro.count({ where: { categoria_id: id } });
  if (libri > 0) {
    throw erroreHttp(`Categoria con ${libri} libri collegati`, 400);
  }

  return await categoria.destroy();
}
```

---

## 9. Operazioni su più tabelle: transazione

Se una create tocca più tabelle, o va tutto o non va niente:

```js
const sequelize = require("../config/db");

async function createLibro(data, autoriIds) {
  return await sequelize.transaction(async (t) => {
    const libro = await Libro.create(data, { transaction: t });
    await libro.setAutori(autoriIds, { transaction: t });
    return libro;
  });
}
```

Ogni query dentro il blocco deve ricevere `{ transaction: t }`, altrimenti
resta fuori dalla transazione e non viene annullata.

---

## 10. Aggiungere una seconda entità

Nell'ordine:

1. `models/Autore.js` — copiare `models/<Entita>.js` e cambiare campi e `tableName`
2. `models/index.js` — importare, dichiarare le associazioni, esportare
3. `services/autore.service.js` — copiare il service esistente
4. `controllers/autore.controller.js` — copiare il controller esistente
5. `routes/autore.route.js` — copiare la route, `/search` prima di `/:id`
6. `routes/index.js` — `router.use("/autori", autoreRoute);`
7. `sql/table.sql` e `sql/seed.sql` — nuova tabella e dati, nell'ordine giusto
8. `postman/` — duplicare le richieste

---

## 11. Collection Postman: catturare un id

Nel tab **Tests** della richiesta POST, per riusare l'id creato nelle
richieste successive:

```js
if (pm.response.code === 201) {
  pm.collectionVariables.set("libroId", pm.response.json().libro.id);
}
```

Poi negli URL si usa `{{libroId}}`. La variabile va dichiarata in
`"variable"` nella collection.

---

## 12. Errori Sequelize e status code

`utils/errori.js` traduce già i più comuni:

| Errore | Status | Quando |
| --- | --- | --- |
| `SequelizeUniqueConstraintError` | 400 | valore duplicato su un campo `unique` |
| `SequelizeValidationError` | 400 | `allowNull: false` violato, validatori del modello |
| `SequelizeForeignKeyConstraintError` | 400 | FK che punta a un id inesistente |
| `err.status` impostato a mano | quello | regole di business dai service |
| tutto il resto | 500 | imprevisti, loggati in console |

Per i casi propri si usa `erroreHttp("messaggio", 404)`.
