const Sequelize = require("sequelize");

const sequelize = require("../../config/database");
const Medicamento = require("./Medicamento");
const User = require("./User");

const tableName = "medicamentos";
/*
DonanteSeleccionados:
(Tabla)
idDonanteSeleccionado
idUserF
idMedicineF

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
DonanteSeleccionado.belongsTo(Medicamento, { as: "medicamento", foreignKey: "idMedicineF" });
DonanteSeleccionado.belongsTo(User, { as: "donanteSeleccionado", foreignKey: "idUsuarioF" });

module.exports = DonanteSeleccionado;
