const { lePerteneceElToken } = require("../functions/function");
const Ciudad = require("../models/Ciudad");
const Gender = require("../models/Gender");
const Medicamento = require("../models/Medicamento");
const DonanteSeleccionado = require("../models/DonanteSeleccionado");
const User = require("../models/User");
const { isBoolean } = require("./CategoriasController");
const PeticionDonacion = require("../models/PeticionDonacion");
const enviarEmail = require("../handlers/emails");
const Estado = require("../models/Estado");
//Extraer valores de variables.env
require('dotenv').config({ path: 'variables.env' });
/*
==========================================
Registrar un donante-seleccionado: POST - /donante-seleccionado Body: (x-www-form-urlencoded) idPDonacionF
==========================================
*/
exports.register = async (req, res) => {
  const { idPDonacionF } = req.body;
  const user = req.user; // Al tener el token puedo tener acceso a req.user
  if (idPDonacionF && user) {
    try {
      // Buscar el medicamento.
      const peticionDonacion = await PeticionDonacion.findByPk(idPDonacionF);
      // Hay que ver si el usuario logueado es el creador del medicamento.
      /* Preguntar si el idDonanteSeleccionado le pertenece al usuario del token */
      let lePertenecee = await lePerteneceElToken(
        user,
        peticionDonacion.idMedicineF,
        Medicamento
      );
      if (!lePertenecee) {
        // Accion prohibida
        return res.status(403).json({
          ok: false,
          msg: "Acción prohibida, no es el creador del medicamento.",
        });
      }
      // Modificar el medicamento. Editarlo para restarle uno al inventario.
      /* Buscar la medicamento. */
      let medicine = await Medicamento.findByPk(peticionDonacion.idMedicineF);
      // Existe el medicamento?
      if (medicine) {
        // El inventario del medicamento no es 0?
        if (medicine.inventaryM) {
          // Restarle uno
          medicine.inventaryM = medicine.inventaryM - 1;
          await medicine.save(); // Guardar
        } else {
          return res.status(403).json({
            ok: false,
            msg: "Se acabó el inventario del medicamento",
          });
        }
      } else {
        return res.status(404).json({
          ok: false,
          msg: "Medicine was not Found",
        });
      }
      // Crear donante seleccionado.
      const donanteS = await DonanteSeleccionado.create({
        idPDonacionF,
      });
      if (donanteS) {
        // Enviar email de notificacion al usuario de que fue seleccionado para recibir la donacion del medicamento.
        const hostingFrontend = process.env.HOSTING_FRONTEND;
        // Obtener los datos del usuario reciobidor de la donacion peticionDonacion.idUsuarioF
        const usuarioRecibidorDelMedicamento = await User.findByPk(peticionDonacion.idUsuarioF);
        //Envia el correo.
        await enviarEmail.enviar({
          usuario: usuarioRecibidorDelMedicamento,
          subject:
            "¡Felicidades! Has sido seleccionado/a para recibir una donación de medicamentos.",
          archivo: "notificacionDonanteS",
          medicine,
          hostingFrontend
        });
      }
      return res.status(200).json({
        ok: true,
        donanteS,
      });
    } catch (err) {
      console.log(err);
      return res.status(500).json({
        ok: false,
        msg: "Internal server error",
      });
    }
  }

  return res.status(400).json({
    ok: false,
    msg: "Bad Request: Revise los campos body (idPDonacionF, token)",
  });
};
// ==========================================
// Obtiene todos los donante-seleccionado: GET /donante-seleccionado ?desde
// ==========================================
exports.getAll = async (req, res) => {
  let desde = req.query.desde || 0;
  desde = Number(desde);

  // For debugging purposes
  // console.log(' desde ', desde);
  // return;
  if (desde == 0 || desde > 0) {
    try {
      let donanteS = await DonanteSeleccionado.findAll({
        limit: 10,
        offset: desde,
        order: [["createdAt", "DESC"]],
        include: [
          {
            model: PeticionDonacion,
            as: "peticionDonacion",
            include: [
              {
                model: Medicamento,
                as: "medicamento",
                include: [
                  "categoria",
                  {
                    model: User,
                    as: "creador",
                    include: [
                      "sexos",
                      {
                        model: Ciudad,
                        as: "ciudades",
                        required: true,
                        include: [
                          {
                            model: Estado,
                            as: "estado",
                            include: "paises",
                          },
                        ],
                      },
                    ],
                  },
                ],
              },
              {
                model: User,
                as: "solicitante",
                include: [
                  "sexos",
                  {
                    model: Ciudad,
                    as: "ciudades",
                    required: true,
                    include: [
                      {
                        model: Estado,
                        as: "estado",
                        include: "paises",
                      },
                    ],
                  },
                ],
              },
            ],
          },
        ],
      });
      const cantidadDS = donanteS.length;
      // console.log('users ', users.length);
      return res.status(200).json({
        ok: true,
        desde,
        cantidadDS,
        donanteS,
      });
    } catch (err) {
      console.log(err);
      return res.status(500).json({
        ok: false,
        msg: "Internal server error",
      });
    }
  } else {
    // 400 (Bad Request)
    return res.status(400).json({
      ok: false,
      msg: "El parametro desde no es válido",
    });
  }
};
// ==========================================
// Obtiene una peticion de donacion especifica por su Id: GET /donante-seleccionado/:idDonanteSeleccionado
// ==========================================
exports.getById = async (req, res) => {
  // Obtener los datos por destructuring.
  const idDonanteSeleccionado = Number(req.params.idDonanteSeleccionado);

  if (idDonanteSeleccionado) {
    try {
      const donanteS = await DonanteSeleccionado.findByPk(
        idDonanteSeleccionado,
        {
          include: [
            {
              model: PeticionDonacion,
              as: "peticionDonacion",
              include: [
                {
                  model: Medicamento,
                  as: "medicamento",
                  include: [
                    "categoria",
                    {
                      model: User,
                      as: "creador",
                      include: [
                        "sexos",
                        {
                          model: Ciudad,
                          as: "ciudades",
                          required: true,
                          include: [
                            {
                              model: Estado,
                              as: "estado",
                              include: "paises",
                            },
                          ],
                        },
                      ],
                    },
                  ],
                },
                {
                  model: User,
                  as: "solicitante",
                  include: [
                    "sexos",
                    {
                      model: Ciudad,
                      as: "ciudades",
                      required: true,
                      include: [
                        {
                          model: Estado,
                          as: "estado",
                          include: "paises",
                        },
                      ],
                    },
                  ],
                },
              ],
            },
          ],
        }
      );
      if (!donanteS) {
        return res.status(400).json({
          ok: false,
          msg: "No hay resultados para ese id",
        });
      }
      return res.status(200).json({
        ok: true,
        donanteS,
      });
    } catch (err) {
      console.log(err);
      return res.status(500).json({
        ok: false,
        msg: "Internal server error",
      });
    }
  } else {
    // 400 (Bad Request)
    return res.status(400).json({
      ok: false,
      msg: "Verificar el idDonanteSeleccionado y el token",
    });
  }
};
// ==========================================
// Obtiene una peticion de donacion especifica por su Id: GET /donante-seleccionado-creador/:idUser
// ==========================================
exports.getByUserCreadorId = async (req, res) => {
  // Obtener los datos por destructuring.
  const idUser = Number(req.params.idUser);
  let desde = req.query.desde || 0;
  desde = Number(desde);

  // For debugging purposes
  // console.log(' desde ', desde);
  // return;
  if (desde == 0 || desde > 0) {
    if (idUser) {
      try {
        let donanteS = await DonanteSeleccionado.findAll({
          limit: 10,
          offset: desde,
          order: [["createdAt", "DESC"]],
          include: [
            {
              model: PeticionDonacion,
              as: "peticionDonacion",
              include: [
                {
                  model: Medicamento,
                  as: "medicamento",
                  include: [
                    "categoria",
                    {
                      model: User,
                      as: "creador",
                      where: {
                        idUser,
                      },
                      include: [
                        "sexos",
                        {
                          model: Ciudad,
                          as: "ciudades",
                          required: true,
                          include: [
                            {
                              model: Estado,
                              as: "estado",
                              include: "paises",
                            },
                          ],
                        },
                      ],
                    },
                  ],
                },
                {
                  model: User,
                  as: "solicitante",
                  include: [
                    "sexos",
                    {
                      model: Ciudad,
                      as: "ciudades",
                      include: ["paises"],
                    },
                  ],
                },
              ],
            },
          ],
        });
        /*
        // For debugging
        console.log('donanteS ', donanteS);
        console.log('donanteS[0].dataValues.peticionDonacion.dataValues.medicamento ', donanteS[0].dataValues.peticionDonacion.dataValues.medicamento);
        */
        if (donanteS[0]) {
          if (donanteS[0].dataValues) {
            if (
              !donanteS[0].dataValues.peticionDonacion.dataValues.medicamento
            ) {
              donanteS = [];
            }
          }
        }
        const cantidadDS = donanteS.length;
        // console.log('users ', users.length);
        return res.status(200).json({
          ok: true,
          desde,
          cantidadDS,
          donanteS,
        });
      } catch (err) {
        console.log(err);
        return res.status(500).json({
          ok: false,
          msg: "Internal server error",
        });
      }
    } else {
      // 400 (Bad Request)
      return res.status(400).json({
        ok: false,
        msg: "Verificar el idUser y el token",
      });
    }
  } else {
    // 400 (Bad Request)
    return res.status(400).json({
      ok: false,
      msg: "El parametro desde no es válido",
    });
  }
};
// ==========================================
// Obtiene una peticion de donacion especifica por su Id: GET /donante-seleccionado-solicitante/:idUser
// ==========================================
exports.getByUserSolicitanteId = async (req, res) => {
  // Obtener los datos por destructuring.
  const idUser = Number(req.params.idUser);
  let desde = req.query.desde || 0;
  desde = Number(desde);

  // For debugging purposes
  // console.log(' desde ', desde);
  // return;
  if (desde == 0 || desde > 0) {
    if (idUser) {
      try {
        let donanteS = await DonanteSeleccionado.findAll({
          limit: 10,
          offset: desde,
          order: [["createdAt", "DESC"]],
          include: [
            {
              model: PeticionDonacion,
              as: "peticionDonacion",
              include: [
                {
                  model: Medicamento,
                  as: "medicamento",
                  include: [
                    "categoria",
                    {
                      model: User,
                      as: "creador",
                      where: {
                        idUser,
                      },
                      include: [
                        "sexos",
                        {
                          model: Ciudad,
                          as: "ciudades",
                          required: true,
                          include: [
                            {
                              model: Estado,
                              as: "estado",
                              include: "paises",
                            },
                          ],
                        },
                      ],
                    },
                  ],
                },
                {
                  model: User,
                  as: "solicitante",
                  where: {
                    idUser,
                  },
                  include: [
                    "sexos",
                    {
                      model: Ciudad,
                      as: "ciudades",
                      include: ["paises"],
                    },
                  ],
                },
              ],
            },
          ],
        });
        /*
        // For debugging
        console.log('donanteS ', donanteS);
        console.log('donanteS[0].dataValues.peticionDonacion.solicitante.dataValues.idUser ', donanteS[0].dataValues.peticionDonacion.solicitante.dataValues.idUser);
        console.log('donanteS[0].dataValues.peticionDonacion ', donanteS[0].dataValues.peticionDonacion);
        */
        if (donanteS[0]) {
          if (donanteS[0].dataValues) {
            if (!donanteS[0].dataValues.peticionDonacion) {
              donanteS = [];
            }
          }
        }
        const cantidadDS = donanteS.length;
        // console.log('users ', users.length);
        return res.status(200).json({
          ok: true,
          desde,
          cantidadDS,
          donanteS,
        });
      } catch (err) {
        console.log(err);
        return res.status(500).json({
          ok: false,
          msg: "Internal server error",
        });
      }
    } else {
      // 400 (Bad Request)
      return res.status(400).json({
        ok: false,
        msg: "Verificar el idUser y el token",
      });
    }
  } else {
    // 400 (Bad Request)
    return res.status(400).json({
      ok: false,
      msg: "El parametro desde no es válido",
    });
  }
};
// ==========================================
// Borrar un donante-seleccionado: DELETE /donante-seleccionado/:idDonanteSeleccionado Ejm. /donante-seleccionado/1
// ==========================================
exports.delete = async (req, res, next) => {
  /*
    // Para debugger
    console.log('Por aqui');
    console.log(req.params);
    console.log(req.body);*/
  // Obtener los datos
  const idDonanteSeleccionado = Number(req.params.idDonanteSeleccionado);
  const user = req.user; // Al tener el token puedo tener acceso a req.usuario
  if (idDonanteSeleccionado > 0 && user) {
    try {
      // Buscar el medicamento.
      /* const donanteS = await DonanteSeleccionado.findByPk(idDonanteSeleccionado);
      // Hay que ver si el usuario logueado es el creador del medicamento.
       Preguntar si el idDonanteSeleccionado le pertenece al usuario del token */
      /*let lePertenecee = await lePerteneceElToken(
        user,
        donanteS.idMedicineF,
        Medicamento
      );
      if (!lePertenecee) {
        // Accion prohibida
        return res.status(403).json({
          ok: false,
          msg: "Acción prohibida, no es el creador del medicamento.",
        });
      }*/
      //Eliminar el donanteS
      const resultado = await DonanteSeleccionado.destroy({
        where: {
          idDonanteSeleccionado,
        },
      });
      if (!resultado) {
        return res.status(400).json({
          ok: false,
          msg: "idDonanteSeleccionado no registrado",
        });
      }

      return res.status(200).json({
        ok: true,
        msg: "DonanteSeleccionado Eliminado",
      });
    } catch (err) {
      console.log(err);
      return res.status(500).json({
        msg: "Internal server error",
      });
    }
  } else {
    // Accion prohibida. (Error)
    return res.status(403).json({
      ok: false,
      msg: "El id del donanteS es obligatorio o mayor que 0",
    });
  }
};
