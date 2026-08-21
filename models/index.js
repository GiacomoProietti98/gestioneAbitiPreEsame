const sequelize = require("../config/db");
const Capo = require("./Capo");
const Categoria = require("./Categoria");

const capo_categoria = sequelize.define(
  "CapoCategoria",{},
  {
    tableName: "capo_categoria",
    timestamps: false,
  },
);

Capo.belongsToMany(Categoria,{through:capo_categoria,foreignKey:"capo_id",otherKey:"categoria_id",as:{singular:"categoria",plural:"categorie"}});
Categoria.belongsToMany(Capo,{through:capo_categoria,foreignKey:"categoria_id",otherKey:"capo_id",as:{singular:"capo",plural:"capi"}});

module.exports = {
  sequelize,
  Capo,
  Categoria,
  capo_categoria,
};
