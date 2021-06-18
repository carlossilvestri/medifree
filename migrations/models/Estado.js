const Sequelize = require('sequelize');

const sequelize = require('../../config/database');

const tableName = 'estado';

const Pais = sequelize.define('Estado', {
    idEstado: {
        type: Sequelize.INTEGER(11),
        primaryKey: true,
        autoIncrement: true
  },
  nombreEstado: {
    type: Sequelize.STRING(50),
    unique: {
        args: true,
        msg: 'Estado ya registrado.'
    },
    allowNull: false,
    notEmpty: {
        msg: 'El estado no puede ir vacio.'
    }
  },
}, { tableName });

module.exports = Pais;
