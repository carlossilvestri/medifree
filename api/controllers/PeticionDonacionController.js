const PeticionDonacion = require("../models/PeticionDonacion");
const { isBoolean } = require("./CategoriasController");
/*
==========================================
Registrar un peticion-donacion: POST - /peticion-donacion Body: (x-www-form-urlencoded) msjDonacion
==========================================
*/
exports.register = async (req, res) => {
  const { msjDonacion, idMedicineF } = req.body;
  const user = req.user; // Al tener el token puedo tener acceso a req.usuario
  if (msjDonacion && idMedicineF && user) {
    try {
      const peticionDonacion = await PeticionDonacion.create({
        msjDonacion,
        idMedicineF,
        idUsuarioF: user.idUser,
      });
      return res.status(200).json({
        ok: true,
        peticionDonacion,
      });
    } catch (err) {
      console.log(err);
      return res.status(500).json({
        msg: "Internal server error",
      });
    }
  }

  return res.status(400).json({
    msg: "Bad Request: Revise los campos body (msjDonacion, idMedicineF, token)",
  });
};
// ==========================================
// Obtiene todos los peticion-donacion: GET /peticion-donacion ?desde
// ==========================================
exports.getAll = async (req, res) => {
  let desde = req.query.desde || 0;
  desde = Number(desde);

  // For debugging purposes
  // console.log(' desde ', desde);
  // return;
  if (desde == 0 || desde > 0) {
    try {
      let peticionDonacion = await PeticionDonacion.findAll({
        limit: 10,
        offset: desde,
        order: [["createdAt", "DESC"]],
        include: [
          {
            model: Ciudad,
            as: "ciudades",
            include: "paises",
          },
          {
            model: Gender,
            as: "sexos",
          },
        ],
      });
      const cantidadPD = peticionDonacion.length;
      // console.log('users ', users.length);
      return res.status(200).json({
        ok: true,
        cantidadPD,
        peticionDonacion,
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
// SOLO SE PUEDE EDITAR el campo "seleccionado"
// TOKEN REQUIRED
// ==========================================
// Editar un peticion-donacion: PUT /peticion-donacion/:idPDonacion Ejm. /peticion-donacion/1 idPDonacion: Params. nameP: Body (x-www-form-urlencoded)
// ==========================================
exports.editById = async (req, res) => {
  // Debuggear
  // console.log('req.body ', req.body);

  // Obtener los datos por destructuring.
  const idPDonacion = req.params.idPDonacion;
  const { seleccionado } = req.body;
  const validSeleccionado = isBoolean(seleccionado);
  const user = req.user; // Al tener el token puedo tener acceso a req.usuario
  if (validSeleccionado) {
    try {
      /* Preguntar si el idPDonacion le pertenece al usuario del token */
      let lePertenecee = await lePerteneceElToken(
        user,
        idPDonacion,
        PeticionDonacion
      );
      if (!lePertenecee) {
        // Accion prohibida
        return res.status(403).json({
          ok: false,
          msg: "No le pertenece esa petición de donación",
        });
      }
      /* Buscar la pregunta de seguridad. */
      let peticionDonacion = await PeticionDonacion.findByPk(idPDonacion);
      // console.log('preguntas de seguridad  ', qr);
      /* Preguntar si el idPDonacion le pertenece al usuario del token */
      /*if (qr.idUsuarioF != user.idUser) {
        return res.status(400).json({
          ok: false,
          msg: "Ese idPDonacion no le pertenece",
        });
      }*/
      //Cambiar las preguntas de seguridad.
      peticionDonacion.seleccionado = seleccionado;

      peticionDonacion.updatedAt = new Date();
      //Metodo save de sequelize para guardar en la BDD
      const resultado = await qr.save();
      if (!resultado) return next();
      return res.status(200).json({
        ok: true,
        msg: "Petición de donación Actualizada",
        peticionDonacion,
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
// Borrar un peticion-donacion: DELETE /peticion-donacion/:idPDonacion Ejm. /peticion-donacion/1
// ==========================================
exports.delete = async (req, res, next) => {
  /*
    // Para debugger
    console.log('Por aqui');
    console.log(req.params);
    console.log(req.body);*/
  // Obtener los datos
  const idPDonacion = Number(req.params.idPDonacion);
  const user = req.user; // Al tener el token puedo tener acceso a req.usuario
  if (idPDonacion > 0) {
    try {
      /* Preguntar si el idQR le pertenece al usuario del token */
      let lePertenecee = await lePerteneceElToken(user, idPDonacion, PeticionDonacion);
      if (!lePertenecee) {
        // Accion prohibida
        return res.status(403).json({
          ok: false,
          msg: "No le pertenece esa peticion de donacion",
        });
      }
      //Eliminar el peticionDonacion
      const resultado = await PeticionDonacion.destroy({
        where: {
          idPDonacion,
        },
      });
      if (!resultado) {
        return res.status(400).json({
          ok: false,
          msg: "idPDonacion no registrado",
        });
      }

      return res.status(200).json({
        ok: true,
        msg: "PeticionDonacion Eliminado",
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
      msg: "El id del peticionDonacion es obligatorio o mayor que 0",
    });
  }
};
