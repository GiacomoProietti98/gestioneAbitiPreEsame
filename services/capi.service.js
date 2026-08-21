const { Op } = require('sequelize');
const { Capo, Categoria } = require('../models');
const { erroreHttp } = require('../utils/errori');

const includeCategorie = [
  { model: Categoria, as: 'categorie', through: { attributes: [] } },
];

async function trovaCategorie(categoriaIds) {
  const categorie = await Categoria.findAll({ where: { id: categoriaIds } });
  if (categorie.length !== categoriaIds.length) {
    throw erroreHttp('Una o piu categorie specificate non esistono', 404);
  }
  return categorie;
}

async function getCapi() {
  return await Capo.findAll({ include: includeCategorie });
}

async function getCapoById(id) {
  return await Capo.findByPk(id, { include: includeCategorie });
}

async function createCapo(data, categoriaIds = []) {
  const categorie = await trovaCategorie(categoriaIds);

  const capo = await Capo.create(data);
  if (categorie.length > 0) {
    await capo.setCategorie(categorie);
  }

  return await Capo.findByPk(capo.id, { include: includeCategorie });
}

async function updateCapo(id, data, categoriaIds) {
  const capo = await Capo.findByPk(id);
  if (!capo) {
    throw erroreHttp('Capo non trovato', 404);
  }

  const aggiornaCategorie = Array.isArray(categoriaIds);
  const categorie = aggiornaCategorie
    ? await trovaCategorie(categoriaIds)
    : [];

  await capo.update(data);
  if (aggiornaCategorie) {
    await capo.setCategorie(categorie);
  }

  return await Capo.findByPk(id, { include: includeCategorie });
}

async function deleteCapo(id) {
  const capo = await Capo.findByPk(id);
  if (!capo) {
    throw erroreHttp('Capo non trovato', 404);
  }

  return await capo.destroy();
}

async function searchCapiByNome(nome) {
  return await Capo.findAll({
    where: { nome: { [Op.like]: `%${nome}%` } },
    include: includeCategorie,
  });
}

async function getCapiDisponibili() {
  return await Capo.findAll({
    where: { disponibile: true },
    include: includeCategorie,
  });
}

module.exports = {
  getCapi,
  getCapoById,
  createCapo,
  updateCapo,
  deleteCapo,
  searchCapiByNome,
  getCapiDisponibili,
};
