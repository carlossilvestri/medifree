/*const Gender = require("../models/Gender");
const Ciudad = require("../models/Gender");*/
const { lePerteneceElToken } = require("../functions/function");
const Categoria = require("../models/Categoria");
// const Ciudad = require("../models/Ciudad");
const Medicamento = require("../models/Medicamento");
const User = require("../models/User");
const { Op } = require("sequelize"); // Sequelize operator.
const Ciudad = require("../models/Ciudad");
const Pais = require("../models/Pais");

/*
==========================================
Registrar un medicine: POST - /medicine Body: (x-www-form-urlencoded) nameM, descriptionM, inventaryM, idCategoriaF, idUsuarioF
==========================================
*/
exports.register = async (req, res) => {
  const { nameM, descriptionM, inventaryM, idCategoriaF } = req.body;
  const user = req.user; // Al tener el token puedo tener acceso a req.usuario
  if (
    nameM != "" &&
    descriptionM != "" &&
    inventaryM != "" &&
    idCategoriaF != ""
  ) {
    try {
      const medicine = await Medicamento.create({
        nameM,
        descriptionM,
        inventaryM,
        idCategoriaF,
        idUsuarioF: user.idUser,
      });
      return res.status(200).json({
        ok: true,
        medicine,
      });
    } catch (err) {
      console.log(err);
      return res.status(500).json({
        msg: "Internal server error",
      });
    }
  }

  return res.status(400).json({
    msg:
      "Bad Request: Verifique los datos nameM, descriptionM, inventaryM y idCategoriaF.",
  });
};
// ==========================================
// Obtiene todos los medicamentos en general: GET /medicine ?desde=0
// ==========================================
exports.getAll = async (req, res) => {
  let desde = req.query.desde || 0;
  desde = Number(desde);
  // console.log(req);
  if (desde == 0 || desde > 0) {
    try {
      const medicines = await Medicamento.findAll({
        limit: 10,
        offset: desde,
        order: [["createdAt", "DESC"]],
        include: [
          {
            model: Categoria,
            as: "categoria",
          },
          {
            model: User,
            as: "creador",
            include: ["sexos", 
            {
              model: Ciudad,
              as: "ciudades",
              include: [ {
                model: Pais,
                as: "paises",
              }]
            },
          ],
          },
        ],
      });
      if (!medicines) {
        // 400 (Bad Request)
        return res.status(400).json({
          ok: false,
          msg: "No hay medicamentos",
        });
      }
      const cantidadMedicamentos = medicines.length;
      return res.status(200).json({
        ok: true,
        desde,
        cantidadMedicamentos,
        medicines,
      });
    } catch (err) {
      console.log(err);
      return res.status(500).json({
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
// Obtiene todos los medicamentos en general: GET /medicine-by-keyword ?desde=0
// ==========================================
exports.getMedicineByKeyword = async (req, res) => {
  let desde = req.query.desde || 0;
  const nameM  = req.query.nameM;
  desde = Number(desde);
  // console.log(req);
  if (desde == 0 || desde > 0) {
    if (nameM) {
      try {
        const medicines = await Medicamento.findAll({
          limit: 10,
          offset: desde,
          where: {
            nameM: {
              [Op.like]: '%' + nameM + '%',
            }
          },
          order: [["createdAt", "DESC"]],
          include: [
            {
              model: Categoria,
              as: "categoria",
            },
            {
              model: User,
              as: "creador",
              include: ["sexos", 
              {
                model: Ciudad,
                as: "ciudades",
                include: [ {
                  model: Pais,
                  as: "paises",
                }]
              },
            ],
            },
          ],
        });
        if (!medicines) {
          // 400 (Bad Request)
          return res.status(400).json({
            ok: false,
            medicines: [],
            msg: "No hay medicamentos",
          });
        }
        const cantidadMedicamentos = medicines.length;
        return res.status(200).json({
          ok: true,
          desde,
          cantidadMedicamentos,
          medicines,
        });
      } catch (err) {
        console.log(err);
        return res.status(500).json({
          msg: "Internal server error",
        });
      }
    } else {
      // 400 (Bad Request)
      return res.status(400).json({
        ok: false,
        msg: "Debe ingresar un nameM",
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
// Obtiene todos los medicamentos en general: GET /medicines-by-city ?desde=0 Body: idCiudad
// ==========================================
exports.getByCityId = async (req, res) => {
  let desde = req.query.desde || 0;
  let idCiudad  = req.query.idCiudad || 0;
  desde = Number(desde);
  idCiudad = Number(idCiudad);
  // console.log(req);
  if (desde == 0 || desde > 0) {
    if (idCiudad) {
      try {
        const medicines = await Medicamento.findAll({
          limit: 10,
          offset: desde,
          order: [["createdAt", "DESC"]],
          include: [
            {
              model: Categoria,
              as: "categoria",
            },
            {
              model: User,
              as: "creador",
              where: {
                idCiudadF: idCiudad,
              },
            },
            {
              model: User,
              as: "creador",
              include: ["sexos", 
              {
                model: Ciudad,
                as: "ciudades",
                include: [ {
                  model: Pais,
                  as: "paises",
                }]
              },
            ],
            },
          ],
        });
        if (!medicines) {
          // 400 (Bad Request)
          return res.status(400).json({
            ok: false,
            msg: "No hay medicamentos",
          });
        }
        const cantidadMedicamentos = medicines.length;
        return res.status(200).json({
          ok: true,
          desde,
          cantidadMedicamentos,
          medicines,
        });
      } catch (err) {
        console.log(err);
        return res.status(500).json({
          msg: "Internal server error",
        });
      }
    } else {
      // 400 (Bad Request)
      return res.status(400).json({
        ok: false,
        msg: "Debe enviar un idCiudad",
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
// Obtiene todos los medicines: GET /medicine-by-user-id?desde=0&token= == TOKEN REQUIRED ==
// ==========================================
exports.getMedicineByUserId = async (req, res) => {
  const user = req.user; // Al tener el token puedo tener acceso a req.usuario
  let desde = req.query.desde || 0;
  desde = Number(desde);
  // console.log(user);
  // console.log(req);
  if (desde == 0 || desde > 0) {
    if (user) {
      try {
        const medicines = await Medicamento.findAll({
          limit: 10,
          offset: desde,
          where: {
            idUsuarioF: user.idUser,
          },
          order: [["createdAt", "DESC"]],
          include: [
            {
              model: Categoria,
              as: "categoria",
            },
            {
              model: User,
              as: "creador",
              include: ["sexos", 
              {
                model: Ciudad,
                as: "ciudades",
                include: [ {
                  model: Pais,
                  as: "paises",
                }]
              },
            ],
            },
          ],
        });
        if (!medicines) {
          return res.status(400).json({
            ok: false,
            msg: "No hay resultados de medicamentos para ese id",
          });
        }
        const cantidadMedicamentos = medicines.length;
        return res.status(200).json({
          ok: true,
          desde,
          cantidadMedicamentos,
          medicines,
        });
      } catch (err) {
        console.log(err);
        return res.status(500).json({
          msg: "Internal server error",
        });
      }
    } else {
      // 400 (Bad Request)
      return res.status(400).json({
        ok: false,
        msg: "Verificar el token",
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
// Obtiene todos los medicines: GET /medicine-by-category-id?desde=0&idCategoria=1
// ==========================================
exports.getMedicineByCategoryId = async (req, res) => {
  let desde = req.query.desde || 0;
  let idCategoria = req.query.idCategoria || 0;
  desde = Number(desde);
  idCategoria = Number(idCategoria);
  // console.log(user);
  // console.log(req);
  if (desde == 0 || desde > 0) {
    if (idCategoria) {
      try {
        const medicines = await Medicamento.findAll({
          limit: 10,
          offset: desde,
          where: {
            idCategoriaF: idCategoria,
          },
          order: [["createdAt", "DESC"]],
          include: [
            {
              model: Categoria,
              as: "categoria",
            },
            {
              model: User,
              as: "creador",
              include: ["sexos", 
              {
                model: Ciudad,
                as: "ciudades",
                include: [ {
                  model: Pais,
                  as: "paises",
                }]
              },
            ],
            },
          ],
        });
        if (!medicines) {
          return res.status(400).json({
            ok: false,
            msg: "No hay resultados de medicamentos para ese idCategoria",
          });
        }
        const cantidadMedicamentos = medicines.length;
        return res.status(200).json({
          ok: true,
          desde,
          cantidadMedicamentos,
          medicines,
        });
      } catch (err) {
        console.log(err);
        return res.status(500).json({
          msg: "Internal server error",
        });
      }
    } else {
      // 400 (Bad Request)
      return res.status(400).json({
        ok: false,
        msg: "Ingrese una idCategoria",
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
// Obtiene todos los medicines: GET /medicine/:idMedicine == NO TOKEN REQUIRED ==
// ==========================================
exports.getMedicineById = async (req, res) => {
  // Obtener los datos por destructuring.
  const idMedicine = Number(req.params.idMedicine);
  // console.log(user);
  // console.log(req);
  if (idMedicine) {
    try {
      const medicines = await Medicamento.findByPk(idMedicine, {
        include: [
          {
            model: Categoria,
            as: "categoria",
          },
          {
            model: User,
            as: "creador",
            include: ["sexos", 
            {
              model: Ciudad,
              as: "ciudades",
              include: [ {
                model: Pais,
                as: "paises",
              }]
            },
          ],
          },
        ],
      });
      if (!medicines) {
        return res.status(400).json({
          ok: false,
          msg: "No hay resultados de medicamentos para ese id",
        });
      }
      return res.status(200).json({
        ok: true,
        medicines,
      });
    } catch (err) {
      console.log(err);
      return res.status(500).json({
        msg: "Internal server error",
      });
    }
  } else {
    // 400 (Bad Request)
    return res.status(400).json({
      ok: false,
      msg: "Verificar el idMedicine y el token",
    });
  }
};
/*
== TOKEN REQUIRED ==
==========================================
Editar medicines por id. PUT /medicine/:idMedicine  Body (x-www-form-urlencoded) nameM, descriptionM, inventaryM, idCategoriaF, token
==========================================
*/

exports.editById = async (req, res) => {
  // Debuggear
  // console.log('req.body ', req.body);

  // Obtener los datos por destructuring.
  const idMedicine = req.params.idMedicine;
  const { nameM, descriptionM, inventaryM, idCategoriaF } = req.body;
  const user = req.user; // Al tener el token puedo tener acceso a req.usuario
  if (nameM && descriptionM && inventaryM && idCategoriaF && user) {
    try {
      /* Preguntar si el idQR le pertenece al usuario del token */
      let lePertenecee = await lePerteneceElToken(
        user,
        idMedicine,
        Medicamento
      );
      if (!lePertenecee) {
        // Accion prohibida
        return res.status(403).json({
          ok: false,
          msg: "No le pertenece ese medicamento",
        });
      }
      /* Buscar la medicamento. */
      let medicine = await Medicamento.findByPk(idMedicine);
      // console.log('medicamentos  ', medicine);
      /* Preguntar si el idQR le pertenece al usuario del token */
      /*if (medicine.idUsuarioF != user.idUser) {
        return res.status(400).json({
          ok: false,
          msg: "Ese idMedicine no le pertenece",
        });
      }*/
      //Cambiar las medicamentos.
      medicine.nameM = nameM;
      medicine.descriptionM = descriptionM;
      medicine.inventaryM = inventaryM;
      medicine.idCategoriaF = idCategoriaF;

      medicine.updatedAt = new Date();
      //Metodo save de sequelize para guardar en la BDD
      const resultado = await medicine.save();
      if (!resultado) return next();
      return res.status(200).json({
        ok: true,
        msg: "Medicamento Actualizado",
        medicine,
      });
    } catch (err) {
      console.log(err);
      // console.log('err.errors[0] ', err.errors[0].type == 'Validation error');
      return res.status(500).json({
        ok: false,
        msg: "Internal server error",
      });
    }
  } else {
    return res.status(400).json({
      ok: false,
      msg: "Faltan datos por completar. Verificar el token.",
    });
  }
};
// ==========================================
// Borrar un medicine: DELETE /medicine/:idMedicine Ejm. /medicine/1
// ==========================================
exports.delete = async (req, res, next) => {
  /*
    // Para debugger
    console.log('Por aqui');
    console.log(req.params);
    console.log(req.body);*/
  // Obtener los datos
  const { idMedicine } = req.params;
  const user = req.user; // Al tener el token puedo tener acceso a req.usuario
  if (idMedicine && user) {
    try {
      /* Preguntar si el idQR le pertenece al usuario del token */
      let lePertenecee = await lePerteneceElToken(
        user,
        idMedicine,
        Medicamento
      );
      if (!lePertenecee) {
        // Accion prohibida
        return res.status(403).json({
          ok: false,
          msg: "No le pertenece ese medicamento",
        });
      }
      //Eliminar el medicine
      const resultado = await Medicamento.destroy({
        where: {
          idMedicine,
        },
      });
      if (!resultado) {
        return res.status(400).json({
          ok: false,
          msg: "idMedicine no registrado",
        });
      }

      return res.status(200).json({
        ok: true,
        msg: "Medicamento Eliminado",
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
      msg: "El id del medicine es obligatorio",
    });
  }
};
