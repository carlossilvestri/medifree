const Sequelize = require('sequelize');

const sequelize = require('../../config/database');
const Medicamento = require('./Medicamento');
const User = require('./User');

const tableName = 'imagen';

const Image = sequelize.define('Image', {
   idImage: {
        type: Sequelize.INTEGER(11),
        primaryKey: true,
        autoIncrement: true
  },
  nameImage: {
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
  mainImage:{
    type: Sequelize.BOOLEAN,
    allowNull: false, //El campo no puede quedar vacio
    defaultValue: false
  },
  isVisible: {
    type: Sequelize.BOOLEAN,
    allowNull: false, //El campo no puede quedar vacio
    defaultValue: true
  },
}, { tableName });

// Image.belongsTo(Medicamento, { as: "medicina", foreignKey: {allowNull: true, name: 'idMedicamentoF' } });
// Image.belongsTo(User, { as: "user", foreignKey: {allowNull: true, name: 'idUserF' }});
Image.belongsTo(Medicamento, { as: "medicina", foreignKey:  {allowNull: true, name: 'idMedicamentoF' }  });
Image.belongsTo(User, { as: "user", foreignKey:  {allowNull: true, name: 'idUserF' } });
module.exports = Image;
