const Sequelize = require("sequelize");

const sequelize = require("../../config/database");
const Categoria = require("./Categoria");
const User = require("./User");

const hooks = {
  beforeUpdate(medicamento) {
    if (medicamento.inventaryM > 0) {
      medicamento.isAvailable = true;
    }else{
        medicamento.isAvailable = false;
    }
  },
  beforeCreate(medicamento) {
    if (medicamento.inventaryM > 0) {
      medicamento.isAvailable = true;
    }else{
        medicamento.isAvailable = false;
    }
  },
};
const tableName = "medicamentos";
/*
Medicamentos:
(Tabla)
idMedicine, nameM, descriptionM, inventaryM, pictureM, isAvailable (boolean), idCategoriaF, idUsuarioF.

*/
const Medicamento = sequelize.define(
  "Medicamento",
  {
    idMedicine: {
      type: Sequelize.INTEGER(11),
      primaryKey: true,
      autoIncrement: true,
    },
    nameM: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    descriptionM: {
      type: Sequelize.TEXT,
      allowNull: false,
    },
    inventaryM: {
      type: Sequelize.INTEGER,
      allowNull: false,
    },
    pictureM: {
      type: Sequelize.TEXT,
      allowNull: true,
    },
    isAvailable: {
      type: Sequelize.BOOLEAN
    },
    isActive: {
      type: Sequelize.BOOLEAN,
      defaultValue: true,
    },
  },
  { hooks, tableName }
);

// Llaves foraneas.
Medicamento.belongsTo(Categoria, { as: "categoria", foreignKey: "idCategoriaF" });
Medicamento.belongsTo(User, { as: "creador", foreignKey: "idUsuarioF" });

module.exports = Medicamento;
