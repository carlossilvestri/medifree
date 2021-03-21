const Sequelize = require('sequelize');

const sequelize = require('../../config/database');
const User = require('./User');
const tableName = 'preguntas';

const QuestionRecovery = sequelize.define('QuestionRecovery', {
  idQr: {
        type: Sequelize.INTEGER(11),
        primaryKey: true,
        autoIncrement: true
  },
  q1: {
    type: Sequelize.STRING(50),
    allowNull: false,
    notEmpty: {
        msg: 'La pregunta no puede ir vacia.'
    }
  },
  q2: {
    type: Sequelize.STRING(50),
    allowNull: false,
    notEmpty: {
        msg: 'La pregunta no puede ir vacia.'
    }
  },
  r1: {
    type: Sequelize.STRING(50),
    allowNull: false,
    notEmpty: {
        msg: 'La respuesta no puede ir vacia.'
    }
  },
  r2: {
    type: Sequelize.STRING(50),
    allowNull: false,
    notEmpty: {
        msg: 'La respuesta no puede ir vacia.'
    }
  },
}, { tableName });

QuestionRecovery.belongsTo(User, {as: 'usuario', foreignKey: 'idUsuarioF'}); //Para colocar una llave foranea.
module.exports = QuestionRecovery;
