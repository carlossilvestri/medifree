const Sequelize = require('sequelize');

const sequelize = require('../../config/database');

const tableName = 'categorias';

const Categoria = sequelize.define('Categoria', {
    idCategoria: {
        type: Sequelize.INTEGER(11),
        primaryKey: true,
        autoIncrement: true
  },
  nameCategoria: {
    type: Sequelize.STRING(50),
    unique: {
        args: true,
        msg: 'La categoria ya esta registrada.'
    },
    allowNull: false,
    notEmpty: {
        msg: 'La categoria no puede ir vacia.'
    }
  },
  isVisible:{
    type: Sequelize.BOOLEAN,
    allowNull: false, //El campo no puede quedar vacio
  }
}, { tableName });

module.exports = Categoria;
