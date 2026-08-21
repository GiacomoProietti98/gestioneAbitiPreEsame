const capiService = require('../services/capi.service');
const { gestisciErrore, idValido } = require('../utils/errori');

async function getCapi(req, res) {
  try {
    const capi = await capiService.getCapi();
    res.status(200).json({ status: 'ok', message: 'Capi trovati', capi });
  } catch (err) {
    gestisciErrore(res, err);
  }
}

async function getCapiById(req, res) {
  try {
    const { id } = req.params;
    if (!idValido(id)) {
      return res
        .status(400)
        .json({ status: 'errore', message: 'Id non valido' });
    }

    const capo = await capiService.getCapoById(id);
    if (!capo) {
      return res
        .status(404)
        .json({ status: 'errore', message: 'Capo non trovato' });
    }

    res.status(200).json({ status: 'ok', message: 'Capo trovato', capo });
  } catch (err) {
    gestisciErrore(res, err);
  }
}

async function createCapo(req, res) {
  try {
    const {
      nome,
      prezzo,
      taglia,
      descrizione,
      disponibile,
      quantita,
      categorieIds,
    } = req.body;
    if (!nome || prezzo === undefined || !taglia) {
      return res.status(400).json({
        status: 'errore',
        message: 'nome, prezzo e taglia sono obbligatori',
      });
    }
    if (categorieIds !== undefined && !Array.isArray(categorieIds)) {
      return res.status(400).json({
        status: 'errore',
        message: 'categorieIds deve essere un array di id',
      });
    }

    const datiCapo = {
      nome,
      prezzo,
      taglia,
      descrizione,
      disponibile,
      quantita,
    };
    const capo = await capiService.createCapo(datiCapo, categorieIds || []);

    res.status(201).json({ status: 'ok', message: 'Capo creato', capo });
  } catch (err) {
    gestisciErrore(res, err);
  }
}

async function updateCapo(req, res) {
  try {
    const { id } = req.params;
    if (!idValido(id)) {
      return res
        .status(400)
        .json({ status: 'errore', message: 'Id non valido' });
    }

    const {
      nome,
      descrizione,
      prezzo,
      taglia,
      quantita,
      disponibile,
      categorieIds,
    } = req.body;
    if (categorieIds !== undefined && !Array.isArray(categorieIds)) {
      return res.status(400).json({
        status: 'errore',
        message: 'categorieIds deve essere un array di id',
      });
    }

    const data = {};
    if (nome !== undefined) data.nome = nome;
    if (descrizione !== undefined) data.descrizione = descrizione;
    if (prezzo !== undefined) data.prezzo = prezzo;
    if (taglia !== undefined) data.taglia = taglia;
    if (quantita !== undefined) data.quantita = quantita;
    if (disponibile !== undefined) data.disponibile = disponibile;

    const capo = await capiService.updateCapo(id, data, categorieIds);
    res.status(200).json({ status: 'ok', message: 'Capo aggiornato', capo });
  } catch (err) {
    gestisciErrore(res, err);
  }
}

async function deleteCapo(req, res) {
  try {
    const { id } = req.params;
    if (!idValido(id)) {
      return res
        .status(400)
        .json({ status: 'errore', message: 'Id non valido' });
    }

    await capiService.deleteCapo(id);
    res.status(204).end();
  } catch (err) {
    gestisciErrore(res, err);
  }
}

async function searchCapiByNome(req, res) {
  try {
    const { q } = req.query;
    if (!q) {
      return res.status(400).json({
        status: 'errore',
        message: 'Parametro di ricerca q non presente',
      });
    }

    const capi = await capiService.searchCapiByNome(q);
    res.status(200).json({ status: 'ok', message: 'Capi trovati', capi });
  } catch (err) {
    gestisciErrore(res, err);
  }
}

async function getCapiDisponibili(req, res) {
  try {
    const capiDisponibili = await capiService.getCapiDisponibili();
    res.status(200).json({
      status: 'ok',
      message: 'Capi disponibili trovati',
      capiDisponibili,
    });
  } catch (err) {
    gestisciErrore(res, err);
  }
}

module.exports = {
  getCapi,
  getCapiById,
  createCapo,
  updateCapo,
  deleteCapo,
  searchCapiByNome,
  getCapiDisponibili,
};
