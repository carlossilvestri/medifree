const Sequelize = require('sequelize');
const Estado = require('./Estado');
const sequelize = require('../../config/database');

const tableName = 'ciudades';

const Ciudad = sequelize.define('Ciudad', {
    idCiudad: {
        type: Sequelize.INTEGER(11),
        primaryKey: true,
        autoIncrement: true
  },
  nameCiudad: {
    type: Sequelize.STRING(50),
    allowNull: false,
    notEmpty: {
        msg: 'La ciudad no puede ir vacia.'
    }
  },
  isVisible: {
    type: Sequelize.BOOLEAN,
    allowNull: false, //El campo no puede quedar vacio
  },
}, { tableName });
Ciudad.belongsTo(Estado, {as: 'estado', foreignKey: 'idEstadoF'}); //Para colocar una llave foranea.
module.exports = Ciudad;
