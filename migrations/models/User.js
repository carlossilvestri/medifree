const Sequelize = require('sequelize');
const bcryptService = require('../services/bcrypt.service');

const sequelize = require('../../config/database');
const Ciudad = require('./Ciudad');
const Gender = require('./Gender');
const Pais = require('./Pais');

const hooks = {
  beforeCreate(user) {
    user.password = bcryptService().password(user); // eslint-disable-line no-param-reassign
  }
};

const tableName = 'users';
/*
Users:
(Tabla)
IdUser, password, emailU, namesU, lastNamesU, identificationU, idCiudadF, donatorU (boolean), dateOfBirth, directionU, idGenderF, tlf1U, tlf2U.
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
  img: {
    type: Sequelize.STRING,
    allowNull: true,
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
  isSuperAdministrator: {
    type: Sequelize.BOOLEAN,
    defaultValue: false,
  },
  isActive: {
    type: Sequelize.BOOLEAN,
    defaultValue: true,
  },
}, { hooks, tableName });

// Llaves foraneas.
User.belongsTo(Ciudad, {as: 'ciudades', foreignKey: 'idCiudadF'});
User.belongsTo(Gender, {as: 'sexos', foreignKey: 'idGenderF'});
// eslint-disable-next-line
User.prototype.toJSON = function () {
  const values = Object.assign({}, this.get());

  delete values.passwordU;

  return values;
};

module.exports = User;
