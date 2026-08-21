const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const Capo = sequelize.define(
  "Capo",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    nome: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    descrizione: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    prezzo: {
      type: DataTypes.FLOAT,
      allowNull: false,
    },
    taglia: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    disponibile: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
    quantita:{
        type:DataTypes.INTEGER,
        allowNull:false,
        defaultValue:0
    }
  },
  {
    tableName: "capo",
    timestamps: false,
  },
);

module.exports = Capo;
