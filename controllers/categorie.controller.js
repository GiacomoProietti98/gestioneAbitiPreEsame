const categorieService = require("../services/categorie.service");
const { gestisciErrore, idValido } = require("../utils/errori");


async function getCategorie(req, res) {
  try {
    const categorie = await categorieService.getCategorie();
    res.status(200).json({ status: "ok", message: "Categorie trovati", categorie });
  } catch (err) {
    gestisciErrore(res, err);
  }
}

async function createCategoria(req, res) {
  try {
    const { nome, descrizione } = req.body;
    if (!nome) {
      return res
        .status(400)
        .json({ status: "errore", message: "Campi obbligatori non presenti" });
    }

    const categoria = await categorieService.createCategoria({
      nome,
      descrizione,
    });

    res.status(201).json({ status: "ok", message: "Categoria creata", categoria });
  } catch (err) {
    gestisciErrore(res, err);
  }
}

async function deleteCategoria(req, res) {
  try {
    const { id } = req.params;
    if (!idValido(id)) {
      return res
        .status(400)
        .json({ status: "errore", message: "Id non valido" });
    }

    await categorieService.deleteCategoria(id);
    res.status(204).end();
  } catch (err) {
    gestisciErrore(res, err);
  }
}



module.exports = {
  getCategorie,
  createCategoria,
  deleteCategoria,
};
