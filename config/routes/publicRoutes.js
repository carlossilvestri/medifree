const express = require('express');
const router = express.Router();
const PaisController = require("../../api/controllers/PaisController");

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
  router.get('/pais', PaisController.getAll); // Registra nuevos usuarios.
  router.put('/pais/:idPais', PaisController.edit); // Registra nuevos usuarios.
  router.delete('/pais/:idPais', PaisController.delete); // Registra nuevos usuarios.


  /* PRUEBAS */
  router.get('/', (req, res) => {
      res.send('inicio');
  });
  return router;
}
