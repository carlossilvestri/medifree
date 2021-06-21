const Sequelize = require("sequelize");

const sequelize = require("../../config/database");
const Medicamento = require("./Medicamento");
const User = require("./User");

const tableName = "peticionDonacion";
/*
PeticionDonacions:
(Tabla)
idPDonacion, msjDonacion, idUsuarioF (Quien solicita la donacion), idMedicineF (PeticionDonacion con el idUsuario de quien creo el medicamento).

*/
const PeticionDonacion = sequelize.define(
  "PeticionDonacion",
  {
    idPDonacion: {
      type: Sequelize.INTEGER(11),
      primaryKey: true,
      autoIncrement: true,
    },
    msjDonacion: {
      type: Sequelize.TEXT,
      allowNull: false,
    },
    isSelected: {
      type: Sequelize.BOOLEAN,
      defaultValue: false,
    },
  },
  { tableName }
);

// Llaves foraneas.
PeticionDonacion.belongsTo(Medicamento, { as: "medicamento", foreignKey: "idMedicineF" });
PeticionDonacion.belongsTo(User, { as: "solicitante", foreignKey: "idUsuarioF" });

module.exports = PeticionDonacion;
