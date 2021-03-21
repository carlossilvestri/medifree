const express = require('express');
const router = express.Router();
const PaisController = require("../../api/controllers/PaisController");
const CiudadController = require("../../api/controllers/CiudadController");
const CategoriasController = require("../../api/controllers/CategoriasController");
const GenderController = require("../../api/controllers/GenderController");
const UserController = require("../../api/controllers/UserController");
const QuestionRecoveryController = require("../../api/controllers/QuestionRecoveryController");

/*const publicRoutes = {
  'POST /user': 'UserController.register',
  'POST /register': 'UserController.register', // alias for POST /user
  'POST /login': 'UserController.login',
  'POST /validate': 'UserController.validate',
};

module.exports = publicRoutes;*/
module.exports = () => {
  /**** PAISES ****/
  router.post('/pais', PaisController.register); // Registra nuevos paises.
  router.get('/pais', PaisController.getAll); // Obtener paises.
  router.put('/pais/:idPais', PaisController.edit); // Editar paises.
  router.delete('/pais/:idPais', PaisController.delete); // Borrar paises.
  /* CIUDADES */
  router.post('/ciudad', CiudadController.register); // Registra nuevos ciudades.
  router.get('/ciudad', CiudadController.getAll); // Obtener ciudades.
  router.put('/ciudad/:idCiudad', CiudadController.edit); // Editar ciudades.
  router.delete('/ciudad/:idCiudad', CiudadController.delete); // Borrar ciudades por ID.
  /* CATEGORIAS */
  router.post('/categoria', CategoriasController.register); // Registra nuevas categorias.
  router.get('/categoria', CategoriasController.getAll); // Obtener categorias.
  router.put('/categoria/:idCategoria', CategoriasController.edit); // Editar categoria por ID.
  router.delete('/categoria/:idCategoria', CategoriasController.delete); // Borrar una categoria por ID.
  /* GENDERS (SEXO) 'Masculino' 'Femenino'*/
  router.post('/gender', GenderController.register); // Registra nuevos genders.
  router.get('/gender', GenderController.getAll); // Obtener genders.
  router.put('/gender/:idGender', GenderController.edit); // Editar gender por ID.
  router.delete('/gender/:idGender', GenderController.delete); // Borrar un gender por ID.
  /* USUARIOS */
  router.post('/user', UserController.register); // Registra nuevos usuarios.
  router.post('/login', UserController.login); // Login para el usuario.
  router.get('/user', UserController.getAll); // Obtener usuarios. (Paginados, indicando desde).
  router.get('/user/:idUser', UserController.getUserById); // Obtener usuario por id.
  router.put('/user/:idUser', UserController.validarToken, UserController.editUserById); // Editar usuarios (Todo excepto email).
  /* Question Recovery */
  router.post('/qr', UserController.validarToken, QuestionRecoveryController.register); // Registra nuevas preguntas de seguridad.
  router.put('/qr/:idQr', UserController.validarToken, QuestionRecoveryController.editById); // Editar una pregunta de seguridad por Id
  router.get('/qr', QuestionRecoveryController.getAll); // Obtener las preguntas de recuperacion asi como sus respuestas. (Paginados, indicando desde).
  router.delete('/qr/:idQr', UserController.validarToken, QuestionRecoveryController.delete); // Borrar un QuestionRecovery por ID.
  // TODO create users CRUD.
  /* PRUEBAS */
  router.get('/', (req, res) => {
      res.send('inicio');
  });
  return router;
}
