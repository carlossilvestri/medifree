/*const Gender = require("../models/Gender");
const Ciudad = require("../models/Gender");*/
const { lePerteneceElToken } = require("../functions/function");
const QuestionRecovery = require("../models/QuestionRecovery");
const User = require("../models/User");
const authService = require('../services/auth.service');

/*
==========================================
Registrar un qr: POST - /qr Body: (x-www-form-urlencoded) q1, q2, r1, r2, idUsuarioF
==========================================
*/
exports.register = async (req, res) => {
  const { q1, q2, r1, r2, idUsuarioF } = req.body;
  if (q1 != "" && q2 != "" && r1 != "" && r2 != "") {
    try {
      const qr = await QuestionRecovery.create({
        q1,
        q2,
        r1,
        r2,
        idUsuarioF,
      });
      return res.status(200).json({
        ok: true,
        qr,
      });
    } catch (err) {
      console.log(err);
      return res.status(500).json({
        msg: "Internal server error",
      });
    }
  }

  return res.status(400).json({
    msg: "Bad Request: Verifique los datos q1, q2, r1 y r2.",
  });
};
// ==========================================
// Obtiene todos los qres: GET /qr
// ==========================================
exports.getAll = async (req, res) => {
  let desde = req.query.desde || 0;
  desde = Number(desde);
  // console.log(req);
  if (desde == 0 || desde > 0) {
    try {
      const qres = await QuestionRecovery.findAll({
        limit: 10,
        offset: desde,
        order: [["createdAt", "DESC"]],
        include: [
          {
            model: User,
            as: "usuario",
            include: ["ciudades", "sexos"],
          },
        ],
      });
      return res.status(200).json({
        ok: true,
        qres,
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
// Obtiene los qres segun su id: GET /qr/:idQr
// ==========================================
exports.getQRById = async (req, res) => {
  // Obtener los datos por destructuring.
  const idQr = Number(req.params.idQr);
  const user = req.user; // Al tener el token puedo tener acceso a req.usuario
  // const token = req.query.token;
  // console.log(user);
  // console.log('req ', req);
  if (idQr && user) {
    try {
      /* Preguntar si el idQR le pertenece al usuario del token */
      let lePertenecee = await lePerteneceElToken(user, idQr, QuestionRecovery);
      if (!lePertenecee) {
        // Accion prohibida
        return res.status(403).json({
          ok: false,
          msg: "Acción prohibida",
        });
      }
      /*const resultado = await QuestionRecovery.findOne({
        where: {
          idUsuarioF: user.idUser,
        },
      });
      if (!resultado) {
        return res.status(400).json({
          ok: false,
          msg: "Ese idQr no le pertenece",
        });
      }*/
      const qres = await QuestionRecovery.findByPk(idQr, {
        include: [
          {
            model: User,
            as: "usuario",
            include: ["ciudades", "sexos"],
          },
        ],
      });
      if (!qres) {
        return res.status(400).json({
          ok: false,
          msg: "No hay resultados de preguntas de seguridad para ese id",
        });
      }
      return res.status(200).json({
        ok: true,
        qres,
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
      msg: "Verificar el idQr y el token",
    });
  }
};
//==========================================
// Edita una qr segun el email y las respuesta correctas. Params: 
//==========================================
exports.getTokenByEmailAndAnswers = async (req, res) => {
  // Obtener la info del body (email, r1, r2).
  const { email, r1, r2 } = req.body;

  // Comprobar que no vengan valores vacios.
  if(!email || !r1 || !r2){
    return res.status(400).json({
      ok: false,
      msg: "Ingrese un email y las respuestas a las preguntas de seguridad.",
    });
  }

  // Obtener el qr del email y que las respuestas coincidan.
  const qr = await QuestionRecovery.findOne({
    include: [
      {
        model: User,
        as: "usuario",
        where: {
          emailU: email
        }
      },
    ],
    where: {
      r1,
      r2
    }
  });
  // Validar que venga una qr
  if (!qr) {
    // Accion prohibida
    return res.status(403).json({
      ok: false,
      msg: "Revise sus respuestas",
    });
  }
  const token = authService().issue({
    user: qr.usuario
  });
  // Todo bien
  return res.status(200).json({
    ok: true,
    token,
    qr,
  });
}
//==========================================
// Obtener qr por email. Params: email
//==========================================
exports.getByEmail = async (req, res) => {
  // Obtener la info del body (email, r1, r2).
  const { email} = req.body;

  // Comprobar que no vengan valores vacios.
  if(!email){
    return res.status(400).json({
      ok: false,
      msg: "Ingrese un email.",
    });
  }

  // Obtener el qr del email y que las respuestas coincidan.
  const qr = await QuestionRecovery.findOne({
    include: [
      {
        model: User,
        as: "usuario",
        where: {
          emailU: email
        }
      },
    ],
  });
  // Validar que venga una qr
  if (!qr) {
    // Accion prohibida
    return res.status(403).json({
      ok: false,
      msg: "No se encontraron preguntas de seguridad según el email especificado",
    });
  }
  // Todo bien
  return res.status(200).json({
    ok: true,
    qr,
  });
}
/*
==========================================
Editar qres por id. PUT /qr/:idQr  Body (x-www-form-urlencoded) q1, q2, r1, r2, token
==========================================
*/

exports.editById = async (req, res) => {
  // Debuggear
  // console.log('req.body ', req.body);

  // Obtener los datos por destructuring.
  const idQr = req.params.idQr;
  const { q1, q2, r1, r2 } = req.body;
  const user = req.user; // Al tener el token puedo tener acceso a req.usuario
  if (q1 && q2 && r1 && r2 && user) {
    try {
      /* Preguntar si el idQR le pertenece al usuario del token */
      let lePertenecee = await lePerteneceElToken(user, idQr, QuestionRecovery);
      if (!lePertenecee) {
        // Accion prohibida
        return res.status(403).json({
          ok: false,
          msg: "No le pertenece esa pregunta de seguridad",
        });
      }
      /* Buscar la pregunta de seguridad. */
      let qr = await QuestionRecovery.findByPk(idQr);
      // console.log('preguntas de seguridad  ', qr);
      /* Preguntar si el idQR le pertenece al usuario del token */
      /*if (qr.idUsuarioF != user.idUser) {
        return res.status(400).json({
          ok: false,
          msg: "Ese idQr no le pertenece",
        });
      }*/
      //Cambiar las preguntas de seguridad.
      qr.q1 = q1;
      qr.q2 = q2;
      qr.r1 = r1;
      qr.r2 = r2;

      qr.updatedAt = new Date();
      //Metodo save de sequelize para guardar en la BDD
      const resultado = await qr.save();
      if (!resultado) return next();
      return res.status(200).json({
        ok: true,
        msg: "Pregunta de Seguridad Actualizada",
        qr,
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
// Borrar un qr: DELETE /qr/:idQr Ejm. /qr/1
// ==========================================
exports.delete = async (req, res, next) => {
  /*
    // Para debugger
    console.log('Por aqui');
    console.log(req.params);
    console.log(req.body);*/
  // Obtener los datos
  const { idQr } = req.params;
  const user = req.user; // Al tener el token puedo tener acceso a req.usuario
  if (idQr && user) {
    try {
      //Eliminar el qr
      const resultado = await QuestionRecovery.destroy({
        where: {
          idQr,
        },
      });
      if (!resultado) {
        return res.status(400).json({
          ok: false,
          msg: "idQr no registrado",
        });
      }

      return res.status(200).json({
        ok: true,
        msg: "Question Recovery Eliminado",
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
      msg: "El id del qr es obligatorio",
    });
  }
};


