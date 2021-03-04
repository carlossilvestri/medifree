const Sequelize = require('sequelize');
const Pais = require('./Pais');
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
    unique: {
        args: true,
        msg: 'Ciudad ya registrada.'
    },
    allowNull: false,
    notEmpty: {
        msg: 'La ciudad no puede ir vacia.'
    }
  },
}, { tableName });
Ciudad.belongsTo(Pais, {foreignKey: 'idPaisF'}); //Para colocar una llave foranea.
module.exports = Ciudad;
