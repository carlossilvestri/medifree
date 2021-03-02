const express = require('express');
const router = express.Router();
const PaisController = require("../../api/controllers/PaisController");
const CiudadController = require("../../api/controllers/CiudadController");
const CategoriasController = require("../../api/controllers/CategoriasController");

/*const publicRoutes = {
  'POST /user': 'UserController.register',
  'POST /register': 'UserController.register', // alias for POST /user
  'POST /login': 'UserController.login',
  'POST /validate': 'UserController.validate',
};

module.exports = publicRoutes;*/
module.exports = () => {
  /**** PAISES ****/
  router.post('/pais', PaisController.register); // Registra nuevos usuarios.
  router.get('/pais', PaisController.getAll); // Obtener usuarios.
  router.put('/pais/:idPais', PaisController.edit); // Editar usuarios.
  router.delete('/pais/:idPais', PaisController.delete); // Borrar usuarios.
  /* CIUDADES */
  router.post('/ciudad', CiudadController.register); // Registra nuevos usuarios.
  router.get('/ciudad', CiudadController.getAll); // Obtener usuarios.
  router.put('/ciudad/:idCiudad', CiudadController.edit); // Editar usuarios.
  router.delete('/ciudad/:idCiudad', CiudadController.delete); // Borrar usuarios.
  /* CATEGORIAS */
  router.post('/categoria', CategoriasController.register); // Registra nuevas categorias.
  router.get('/categoria', CategoriasController.getAll); // Obtener categorias.
  /* PRUEBAS */
  router.get('/', (req, res) => {
      res.send('inicio');
  });
  return router;
}
