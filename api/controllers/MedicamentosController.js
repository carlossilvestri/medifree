/*const Gender = require("../models/Gender");
const Ciudad = require("../models/Gender");*/
const { lePerteneceElToken } = require("../functions/function");
const Categoria = require("../models/Categoria");
const Medicamento = require("../models/Medicamento");
const User = require("../models/User");
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
            include: ["ciudades", "sexos"],
          },
        ],
      });
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
            as: "usuario",
            include: ["ciudades", "sexos"],
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
      msg: "El id del medicine es obligatorio",
    });
  }
};
