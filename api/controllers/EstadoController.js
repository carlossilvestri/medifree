const Estado = require("../models/Estado");
const Pais = require("../models/Pais");
const { isBoolean } = require("./CategoriasController");
const { check, validationResult, params } = require("express-validator");
/*
==========================================
Registrar un estado: POST - /estado Body: (x-www-form-urlencoded) nombreEstado : string, isVisible : boolean, idPaisF : number
==========================================
*/
exports.register = async (req, res) => {
  const { nombreEstado, isVisible, idPaisF } = req.body;
  if (nombreEstado != "" && nombreEstado && isBoolean(isVisible) && idPaisF) {
    try {
      const estado = await Estado.create({
        nombreEstado,
        isVisible,
        idPaisF,
      });
      return res.status(200).json({
        ok: true,
        estado,
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
    msg: "Bad Request: Ingrese un nombreEstado : string, isVisible : boolean, idPaisF : number ",
  });
};
// ==========================================
// Obtiene todos los estados: GET /estado
// ==========================================
exports.getAll = async (req, res) => {
  // console.log(req);
  try {
    const estados = await Estado.findAll({
      order: [["createdAt", "DESC"]],
      include: [
        {
          model: Pais,
          required: true,
          as: "paises",
        },
      ],
    });
    const cantidadEstados = estados.length;
    return res.status(200).json({
      ok: true,
      cantidadEstados,
      estados,
    });
  } catch (err) {
    console.log(err);
    return res.status(500).json({
      msg: "Internal server error",
    });
  }
};
// ==========================================
// Obtiene todos los estados: GET /states-by-country?desde=0&idPaisF=1
// ==========================================
exports.getStateByPaisF = async (req, res) => {
  let idPaisF = req.query.idPaisF || 0;
  // console.log(req);
  if (idPaisF) {
    try {
      const estados = await Estado.findAll({
        order: [["nombreEstado", "ASC"]], // Ordenar por orden alfabetico los nombres de los estados.
        where: {
          isVisible: true,
          idPaisF,
        },
        /*
        include: [
          {
            model: Pais,
            required: true,
            as: "paises",
          },
        ],
        */
      });
      const cantidadEstados = estados.length;
      return res.status(200).json({
        ok: true,
        cantidadEstados,
        estados,
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
      msg: "Debe enviar un idPaisF",
    });
  }
};
// ==========================================
// Editar un estado: PUT /estado/:idEstado Ejm. /estado/1 idEstado: Params. nombreEstado: Body (x-www-form-urlencoded)
// ==========================================
exports.edit = async (req, res) => {
  /*
    // For debugging.
    console.log('Por aqui');
    console.log(req.params);
    console.log(req.body);*/
  // Obtener los datos
  const idEstado = req.params.idEstado,
    { nombreEstado, isVisible, idPaisF } = req.body;
  try {
    // Validar que no esten vacios los datos.
    if (nombreEstado.trim() != "" && nombreEstado) {
      const estado = await Estado.findOne({
        where: {
          idEstado,
        },
      });
      //Cambiar el nombre del estado:
      estado.nombreEstado = nombreEstado;
      estado.isVisible = isVisible;
      estado.idPaisF = idPaisF;
      estado.updatedAt = new Date();
      //Metodo save de sequelize para guardar en la BDD
      const resultado = await estado.save();
      if (!resultado) return next();
      return res.status(200).json({
        ok: true,
        msg: "Estado Actualizado",
        estado: resultado,
      });
    }
    return res.status(400).json({
      ok: false,
      msg: "Bad Request: Ingrese un nombreEstado valido.",
    });
  } catch (err) {
    console.log(err);
    return res.status(500).json({
      ok: false,
      msg: "Internal server error",
    });
  }
};
// ==========================================
// Deshabilitar un estado: PATCH /estado/:idEstado Ejm. /estado/1 idEstado: Params. Body: isVisible: boolean (x-www-form-urlencoded)
// ==========================================
exports.habilitarODeshabilitarUnEstado = async (req, res) => {
  /*
      // Para debugger
      console.log('Por aqui');
      console.log(req.params);
      console.log(req.body);*/
  // Obtener los datos
  const idEstado = req.params.idEstado,
    { isVisible } = req.body;
    try {
        const estado = await Estado.findOne({
          where: {
            idEstado,
          },
        });
        //Cambiar
        estado.isVisible = isVisible;
        estado.updatedAt = new Date();
        //Metodo save de sequelize para guardar en la BDD
        const resultado = await estado.save();
        if (!resultado) return next();
        return res.status(200).json({
          ok: true,
          msg: "Estado Actualizado",
          estado: resultado,
        });
    } catch (err) {
      console.log(err);
      return res.status(500).json({
        ok: false,
        msg: "Internal server error",
      });
    }
};

// ==========================================
// Borrar un estado: DELETE /estado/:idEstado Ejm. /estado/1
// ==========================================
exports.delete = async (req, res, next) => {
  /*
    // Para debugger
    console.log('Por aqui');
    console.log(req.params);
    console.log(req.body);*/
  // Obtener los datos
  const { idEstado } = req.params;
  if (idEstado) {
    try {
      //Eliminar el estado
      const resultado = await Estado.destroy({
        where: {
          idEstado,
        },
      });
      if (!resultado) {
        return res.status(400).json({
          ok: false,
          msg: "idEstado no registrado",
        });
      }

      return res.status(200).json({
        ok: true,
        msg: "Estado Eliminado",
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
      msg: "El id del estado es obligatorio",
    });
  }
};
