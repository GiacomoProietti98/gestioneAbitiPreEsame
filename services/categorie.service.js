const { Categoria, capo_categoria } = require('../models');
const { erroreHttp } = require('../utils/errori');

async function getCategorie() {
  return await Categoria.findAll();
}

async function createCategoria(data) {
  return await Categoria.create(data);
}


async function deleteCategoria(id){
    const categoria = await Categoria.findByPk(id);
    if(!categoria){
        throw erroreHttp('Categoria non trovata', 404);
    }

    const capiAssociati = await capo_categoria.count({ where: { categoria_id: id } });
    if (capiAssociati > 0) {
        throw erroreHttp('Impossibile eliminare categoria con capo', 400);
    }

    return await categoria.destroy();
}

module.exports = {
  getCategorie,
  createCategoria,
  deleteCategoria,
};
