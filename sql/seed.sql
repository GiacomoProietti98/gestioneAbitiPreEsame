USE `gestione_abiti`;

INSERT INTO `capo` (`id`, `nome`, `descrizione`, `prezzo`, `taglia`, `quantita`, `disponibile`)
VALUES
  (1, 'Camicia bianca',  'Cotone, manica lunga',            19.9, 'M',  10, 1),
  (2, 'Camicia a righe', 'Cotone, manica corta',            24.9, 'L',   4, 1),
  (3, 'Giacca blu',      'Non disponibile, per filtrare',   89.9, 'M',   0, 0),
  (4, 'Cappotto grigio', 'Prezzo alto, per ordinamenti',   149.9, 'L',   2, 1),
  (5, 'Maglione rosso',  'Lana merino',                     39.9, 'S',   7, 1),
  (6, 'Jeans slim',      'Non disponibile, per filtrare',   49.9, 'M',   0, 0),
  (7, 'Gonna nera',      'Nome con la a, per search',       34.9, 'S',   5, 1),
  (8, 'Sciarpa a quadri','Altro nome con la a, per search', 14.9, 'U',  12, 1);

INSERT INTO `categoria` (`id`, `nome`, `descrizione`)
VALUES
  (1, 'Camicie',     'Camicie da uomo e da donna'),
  (2, 'Giacche',     'Giacche e blazer'),
  (3, 'Cappotti',    'Capispalla pesanti'),
  (4, 'Maglieria',   'Maglioni e cardigan'),
  (5, 'Pantaloni',   'Pantaloni e jeans'),
  (6, 'Gonne',       'Gonne di ogni lunghezza'),
  (7, 'Accessori',   'Sciarpe, cinture, cappelli'),
  (8, 'Saldi',       'Categoria trasversale, per testare la M:N');

INSERT INTO `capo_categoria` (`capo_id`, `categoria_id`)
VALUES
  (1, 1),
  (2, 1),
  (2, 8),
  (3, 2),
  (4, 3),
  (4, 8),
  (5, 4),
  (6, 5),
  (7, 6),
  (8, 7);
