const Sequelize = require("sequelize");
const Pais = require("./Pais");
const sequelize = require("../../config/database");

const tableName = "estado";

const Estado = sequelize.define(
  "Estado",
  {
    idEstado: {
      type: Sequelize.INTEGER(11),
      primaryKey: true,
      autoIncrement: true,
    },
    nombreEstado: {
      type: Sequelize.STRING(50),
      unique: {
        args: true, 
        msg: "Estado ya registrado.",
      },
      allowNull: false,
      notEmpty: {
        msg: "El estado no puede ir vacio.",
      },
    },
    isVisible: {
      type: Sequelize.BOOLEAN,
      allowNull: false, //El campo no puede quedar vacio
    },
  },
  { tableName }
);
Estado.belongsTo(Pais, { as: "paises", foreignKey: "idPaisF" }); //Para colocar una llave foranea.
module.exports = Estado;
