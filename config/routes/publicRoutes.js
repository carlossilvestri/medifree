const express = require("express");
const router = express.Router();
const PaisController = require("../../api/controllers/PaisController");
const CiudadController = require("../../api/controllers/CiudadController");
const EstadoController = require("../../api/controllers/EstadoController");
const CategoriasController = require("../../api/controllers/CategoriasController");
const GenderController = require("../../api/controllers/GenderController");
const UserController = require("../../api/controllers/UserController");
const QuestionRecoveryController = require("../../api/controllers/QuestionRecoveryController");
const MedicamentosController = require("../../api/controllers/MedicamentosController");
const PeticionDonacionController = require("../../api/controllers/PeticionDonacionController");
const DonanteSeleccionadoController = require("../../api/controllers/DonanteSeleccionadoController");
const uploadsController = require("../../api/controllers/uploadsController");
const { imageController } = require("../../api/controllers/ImageController");

const swaggerDocumentOne = require('../../api/swagger-doc/swagger-one.json');
//Middleware para proteger las rutas.
const auth = require("../../api/middlewares/auth");
const auth2 = require("../../api/middlewares/auth2");
// Swagger
const swaggerUI = require("swagger-ui-express");
const { validarTodosLosCamposDelEstado, validarPatchDelEstado } = require("../../api/middlewares/stateValidation");
const { validateNewUser, validateEditUser } = require("../../api/middlewares/userValidation");
const swaggerOptions = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Medifree API",
      version: "1.0.0",
      description: "Medifree Api for managing donations of medicines",
      contact: {
        name: "Carlos Silvestri"
      },
    },
  },
  apis: ["./publicRoutes"],
};
module.exports = () => {
  /* SWAGGER */
  router.use('/api-docs-one', swaggerUI.serveFiles(swaggerDocumentOne, swaggerOptions), swaggerUI.setup(swaggerDocumentOne));
  /**** PAISES ****/
  router.post("/pais", PaisController.register); // Registra nuevos paises.
  router.get("/pais", PaisController.getAll); // Obtener paises.
  router.put("/pais/:idPais", PaisController.edit); // Editar paises.
  router.delete("/pais/:idPais", PaisController.delete); // Borrar paises.

  /* CIUDADES */
  router.post("/ciudad", CiudadController.register); // Registra nuevos ciudades.
  router.get("/ciudad", CiudadController.getAll); // Obtener ciudades.
  router.get("/ciudad-por-idestadof", CiudadController.getCityByStateId); // Obtener ciudades segun el estado id.
  router.put("/ciudad/:idCiudad", CiudadController.edit); // Editar ciudades.
  router.delete("/ciudad/:idCiudad", CiudadController.delete); // Borrar ciudades por ID.

    /* ESTADOS */
  router.post("/estado", EstadoController.register); // Registra nuevos estados.
  router.get("/estado", EstadoController.getAll); // Obtener estados.
  router.get("/states-by-country", EstadoController.getStateByPaisF); // Obtener estados.
  router.put("/estado/:idEstado", validarTodosLosCamposDelEstado, EstadoController.edit); // Editar estados.
  router.patch("/estado/:idEstado", validarPatchDelEstado, EstadoController.habilitarODeshabilitarUnEstado); // Habilitar estados.
  router.delete("/estado/:idEstado", EstadoController.delete); // Borrar estados por ID.

  /* CATEGORIAS */
  router.post("/categoria", CategoriasController.register); // Registra nuevas categorias.
  router.get("/categoria", CategoriasController.getAll); // Obtener categorias.
  router.put("/categoria/:idCategoria", CategoriasController.edit); // Editar categoria por ID.
  router.delete("/categoria/:idCategoria", CategoriasController.delete); // Borrar una categoria por ID.

  /* GENDERS (SEXO) 'Masculino' 'Femenino'*/
  router.post("/gender", GenderController.register); // Registra nuevos genders.
  router.get("/gender", GenderController.getAll); // Obtener genders.
  router.put("/gender/:idGender", GenderController.edit); // Editar gender por ID.
  router.delete("/gender/:idGender", GenderController.delete); // Borrar un gender por ID.

  /* USUARIOS */
  router.post("/user", validateNewUser, UserController.register); // Registra nuevos usuarios.
  router.post("/login", UserController.login); // Login para el usuario.
  router.get("/user", UserController.getAll); // Obtener usuarios. (Paginados, indicando desde).
  router.get("/user/:idUser", UserController.getUserById); // Obtener usuario por id.
  router.put("/user/:idUser", [auth, validateEditUser], UserController.editUserById); // Editar usuarios (Todo excepto email).
  router.put(
    "/user/modify-password/password",
    auth,
    UserController.editPassword
  ); // Modificar solo el password. Sirve cuando se han contestado correctamente las preguntas de seguridad.
  
  /* ADMINISTRADOR */

  // ADM-USUARIOS
  router.get("/adm-statistics", UserController.getAdmStatistics); // Estadisticas de administrador.
  router.get("/users-by-keyword-all-countries", UserController.getUsersByKeywordAllCountries); // Estadisticas de administrador.
  router.patch("/super-adm/:id", UserController.editSuperAdministrator); // Editar permisos de superadministrador.
  router.patch("/activate-user/:id", UserController.deshabilitarOHabilitarUsuario); // Habilitar o deshabilitar un usuario.

  // ADM-MEDICAMENTOS
  router.patch("/activate-medicine/:idMedicine", MedicamentosController.editByIdisAvailableAdm); // Habilitar o deshabilitar un medicamento.
  router.get("/medicine-by-keyword-adm", MedicamentosController.getMedicineByKeywordAdm); // Obtener los medicamentos de todos los paises paginados, sin importar que esten deshabilitados (isActive = false).
  router.get("/medicines-all-countries-adm", MedicamentosController.getAllMedicinesAllCountriesAdm); // Obtener los medicamentos de todos los paises paginados, sin importar que esten deshabilitados (isActive = false).



  /* Question Recovery */
  router.post("/qr", auth, QuestionRecoveryController.register); // Registra nuevas preguntas de seguridad.
  // Modificar todos los campos de QR
  router.put("/qr/:idQr", auth, QuestionRecoveryController.editById); // Editar una pregunta de seguridad por Id
  router.get(
    "/qr/token/get-token-to-modify-pass-by-email-and-answers",
    QuestionRecoveryController.getTokenByEmailAndAnswers
  ); // Editar una pregunta de seguridad segun email y preguntas respondidas correctamente.
  router.get("/qr", QuestionRecoveryController.getAll); // Obtener las preguntas de recuperacion asi como sus respuestas. (Paginados, indicando desde).
  router.get("/qr/:idQr", auth2.verificarTokenDesdeQuery, QuestionRecoveryController.getQRById); // Obtener la preguntas de recuperacion por id
  router.get("/qr/get-by-email/email", QuestionRecoveryController.getByEmail); // Obtener la preguntas de recuperacion por email
  router.get("/qr/get-by-user-token/token",  auth2.verificarTokenDesdeQuery, QuestionRecoveryController.getQuestionsByUserId); // Obtener la preguntas de recuperacion por email
  router.delete("/qr/:idQr", auth, QuestionRecoveryController.delete); // Borrar un QuestionRecovery por ID.

  /* MEDICINES */
  router.post("/medicine", auth, MedicamentosController.register); // Registra un medicamento.
  router.put("/medicine/:idMedicine", auth, MedicamentosController.editById); // Editar un medicamento por Id
  router.put("/medicine-is-active/:idMedicine", auth, MedicamentosController.editByIdisAvailable); // Editar un medicamento por Id
  router.get("/medicine", MedicamentosController.getAll); // Obtener todos los medicamentos (Paginados, indicando desde).
  router.get("/medicines-by-city", MedicamentosController.getByCityId); // Obtener todos los medicamentos (Paginados, indicando desde) y por cityId.
  router.get("/medicines-by-state", MedicamentosController.getByStateId); // Obtener todos los medicamentos (Paginados, indicando desde) y por idEstado.
  router.get("/medicine/:idMedicine", MedicamentosController.getMedicineById); // Obtener los medicamentos por su id
  router.get("/medicines-by-country", MedicamentosController.getByCountryId); // Obtener los medicamentos por country id
  router.get(
    "/medicine-by-user-id",
    auth2.verificarTokenDesdeQuery,
    MedicamentosController.getMedicineByUserId
  ); // Obtener los medicamentos del usuario del token.
  router.get(
    "/medicine-by-category-id",
    MedicamentosController.getMedicineByCategoryId
  ); // Obtener los medicamentos de un categoria especifica, en TODOS los paises.
  router.get(
    "/medicines-by-city-and-category",
    MedicamentosController.getByCityIdAndCategoryId
  ); // Obtener los medicamentos  de un categoria especifica y de una ciudad especifica.
  router.get(
    "/medicines-by-state-and-category",
    MedicamentosController.getByStateIdAndCategoryId
  ); // Obtener los medicamentos de un categoria especifica y de un país especifico.
  router.get(
    "/medicine-by-category-id-and-country-id",
    MedicamentosController.getMedicineByCategoryIdAndCountryId
  ); // Obtener los medicamentos de un categoria especifica y de un país especifico.
  router.get(
    "/medicine-by-keyword",
    MedicamentosController.getMedicineByKeyword
  ); // Buscar los medicamentos por su nombre (Barra de busqueda).
  router.get(
    "/medicine-by-keyword-and-by-country",
    MedicamentosController.getMedicineByKeywordAndByCountry
  ); // Buscar los medicamentos por su nombre (Barra de busqueda).
  router.get(
    "/medicine-by-keyword-and-by-state",
    MedicamentosController.getMedicineByKeywordAndByState
  ); // Buscar los medicamentos por su nombre (Barra de busqueda).
  router.get(
    "/medicine-by-keyword-and-by-city",
    MedicamentosController.getMedicineByKeywordAndByCity
  ); // Buscar los medicamentos por su nombre (Barra de busqueda).
  router.delete("/medicine/:idMedicine", auth2.verificarTokenDesdeQuery, MedicamentosController.delete); // Borrar un QuestionRecovery por ID.

  /* PETICION DONACION */
  router.post("/peticion-donacion", auth, PeticionDonacionController.register); // Registra una peticion de donacion.
  router.get("/peticion-donacion", PeticionDonacionController.getAll); // Ver todas las peticiones de donaciones con diciendo ?desde y limite de 10.
  router.get(
    "/peticion-donacion/:idPDonacion",
    PeticionDonacionController.getById
  ); // Registra una peticion de donacion
  router.get(
    "/peticion-donacion-donador",
    auth2.verificarTokenDesdeQuery,
    PeticionDonacionController.getPDOfDonator
  ); // Obtener las peticiones de donaciones del donador/quien registro del medicamento.
  router.get(
    "/peticion-donacion-solicitante",
    auth2.verificarTokenDesdeQuery,
    PeticionDonacionController.getPDSolicitante
  ); // Obtener las peticiones de donaciones del solicitante.
  router.put(
    "/peticion-donacion/:idPDonacion",
    auth,
    PeticionDonacionController.editById
  ); // Editar una peticion de donacion, es necesario el token de quien la creo.
  router.delete(
    "/peticion-donacion/:idPDonacion",
    auth,
    PeticionDonacionController.delete
  ); // Editar una peticion de donacion, es necesario el token de quien la creo.

  /* DONANTES SELECCIONADOS */
  router.post(
    "/donante-seleccionado",
    auth,
    DonanteSeleccionadoController.register
  ); // Registra un donante seleccionado. Es necesario el token de quien registró del medicamento.
  router.get("/donante-seleccionado", DonanteSeleccionadoController.getAll); // Obtener todos los donantes seleccionados ?desde . No es necesario el token .
  router.get(
    "/donante-seleccionado/:idDonanteSeleccionado",
    DonanteSeleccionadoController.getById
  ); // Obtener todos los donantes seleccionados por su id. No es necesario el token .
  router.get(
    "/donante-seleccionado-creador/:idUser",
    DonanteSeleccionadoController.getByUserCreadorId
  ); // Obtener todos los donantes seleccionados or el id del creador.
  router.get(
    "/donante-seleccionado-solicitante/:idUser",
    DonanteSeleccionadoController.getByUserSolicitanteId
  ); // Obtener todos los donantes seleccionados por el id del solicitante.
  router.delete(
    "/donante-seleccionado/:idDonanteSeleccionado",
    auth2.verificarTokenDesdeQuery,
    DonanteSeleccionadoController.delete
  ); // Registra una peticion de donacion.

  /* SUBIDA DE ARCHIVOS */
  router.put("/upload/:tipo/:id", auth, uploadsController.uploadImgToServer); // Editar/Agregar una img
  // Es necesario mandar un /upload/:tipo/:img?token=
  router.get("/upload/:tipo/:img", uploadsController.getImageByType); // Editar/Agregar una img
  router.put(
    "/upload/cloudinary/:tipo/:id",
    auth,
    uploadsController.subirACloudinary
  ); // Editar/Agregar una img
  router.patch(
    "/upload-multiple/cloudinary/:tipo/:id",
    auth,
    uploadsController.subirACloudinaryMultipleImages
  ); // Editar/Agregar una img

  /* IMAGES */
  router.post(
    "/image/:tipo/:id",
    auth,
    imageController.crearImagen
  ); // Editar/Agregar una img 
  router.post(
    "/image-edit/:id",
    imageController.editarImagen
  ); // Editar una img eliminando del servidor local la img y luego guardando la nueva, en la tabla solo edita el nombre.
  router.delete(
    "/image/:idImage",
    imageController.eliminarImagen
  );
  router.patch(
    "/image-edit/:id",
    imageController.editarImgPrincipal
  ); // Solo editar el mainImg en la imagen y en los modelos ligados.
  router.get(
    "/image/:tipo/:id",
    imageController.getImagesBy
  );

  /* REFRESACAR TOKEN */
  router.get("/refresh-token", auth2.verificarTokenDesdeQueryLight, UserController.getTokenRefreshed); // Obtener usuarios. (Paginados, indicando desde).
  // TODO create users CRUD.
  /* PRUEBAS */
  router.get("/", (req, res) => {
    res.send("inicio");
  });
  return router;
};
