const Sequelize = require('sequelize');
const bcryptService = require('../services/bcrypt.service');

const sequelize = require('../../config/database');
const Ciudad = require('./Ciudad');
const Gender = require('./Gender');

const hooks = {
  beforeCreate(user) {
    user.passwordU = bcryptService().password(user); // eslint-disable-line no-param-reassign
  },
};

const tableName = 'users';
/*
Users:
(Tabla)
IdUser, passwordU, emailU, namesU, lastNamesU, identificationU, idCiudadF, donatorU (boolean), dateOfBirth, directionU, idGenderF, tlf1U, tlf2U.
*/
const User = sequelize.define('User', {
  idUser: {
    type: Sequelize.INTEGER(11),
    primaryKey: true,
    autoIncrement: true
  },
  emailU: {
    type: Sequelize.STRING,
    unique: {
      args: true,
      msg: 'Email ya registrado.'
    },
    validate:{
      isEmail: true,
    },
    allowNull: false,
  },
  password: {
    type: Sequelize.STRING,
  },
  namesU: {
    type: Sequelize.STRING,
    allowNull: false,
  },
  lastNamesU: {
    type: Sequelize.STRING,
    allowNull: false,
  },
  identificationU: {
    type: Sequelize.STRING,
    unique: {
      args: true,
      msg: 'Identificacion ya registrada.'
    },
    allowNull: false,
  },
  donatorU: {
    type: Sequelize.BOOLEAN,
    allowNull: false, //El campo no puede quedar vacio
  },
  dateOfBirth: {
    type: Sequelize.DATE,
    allowNull: false,
  },
  directionU: {
    type: Sequelize.TEXT,
    allowNull: false, 
  },
  // Tlf obligatorio.
  tlf1: {
    type: Sequelize.STRING,
    allowNull: false,
  },
  // Tlf Alternativo.
  tlf2: {
    type: Sequelize.STRING,
    allowNull: false,
  },
}, { hooks, tableName });

// Llaves foraneas.
User.belongsTo(Ciudad, {foreignKey: 'idCiudadF'});
User.belongsTo(Gender, {foreignKey: 'idGenderF'});

// eslint-disable-next-line
User.prototype.toJSON = function () {
  const values = Object.assign({}, this.get());

  delete values.passwordU;

  return values;
};

module.exports = User;
