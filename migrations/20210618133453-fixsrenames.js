'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => 
  Promise.all([
    queryInterface.renameColumn('ciudades', 'idPaisF', 'idEstadoF')
    /**
     * Add altering commands here.
     *
     * Example:
     * await queryInterface.createTable('users', { id: Sequelize.INTEGER });
     */
  ]),

  down: async (queryInterface, Sequelize) => Promise.all([
    queryInterface.renameColumn('ciudades', 'idEstadoF', 'idPaisF')
    /**
     * Add reverting commands here.
     *
     * Example:
     * await queryInterface.dropTable('users');
     */
   ]),
};
