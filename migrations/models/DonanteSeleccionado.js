const Sequelize = require("sequelize");

const sequelize = require("../../config/database");
const PeticionDonacion = require("./PeticionDonacion");

const tableName = "donanteseleccionado";
/*
DonanteSeleccionados:
(Tabla)
idDonanteSeleccionado
idPDonacionF

*/
const DonanteSeleccionado = sequelize.define(
  "DonanteSeleccionado",
  {
    idDonanteSeleccionado: {
      type: Sequelize.INTEGER(11),
      primaryKey: true,
      autoIncrement: true,
    }
  },
  { tableName }
);
 
// Llaves foraneas.
DonanteSeleccionado.belongsTo(PeticionDonacion, { as: "peticionDonacion", foreignKey: "idPDonacionF" });

module.exports = DonanteSeleccionado;
