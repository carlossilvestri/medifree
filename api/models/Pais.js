const Sequelize = require('sequelize');

const sequelize = require('../../config/database');

const tableName = 'paises';

const Pais = sequelize.define('Pais', {
    idPais: {
        type: Sequelize.INTEGER(11),
        primaryKey: true,
        autoIncrement: true
  },
  nameP: {
    type: Sequelize.STRING(50),
    unique: {
        args: true,
        msg: 'El pais ya registrado.'
    },
    notEmpty: {
        msg: 'El pais no puede ir vacio.'
    }
  },
}, { tableName });

module.exports = Pais;
