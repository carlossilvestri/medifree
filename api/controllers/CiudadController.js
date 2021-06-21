const Ciudad = require('../models/Ciudad');
const Estado = require('../models/Estado');
const {
    isBoolean
} = require('./CategoriasController');
/*
==========================================
Registrar un ciudad: POST - /ciudad Body: (x-www-form-urlencoded) nameCiudad (string), idEstadoF (int)
==========================================
*/
exports.register = async (req, res) => {
    const {
        body
    } = req;
    console.log(body);
    if (body.nameCiudad != '' && body.nameCiudad && body.idEstadoF) {
        const validVisible = isBoolean(body.isVisible);
        if (validVisible) {
            try {
                const ciudad = await Ciudad.create({
                    nameCiudad: body.nameCiudad,
                    idEstadoF: body.idEstadoF,
                    isVisible: body.isVisible
                });
                return res.status(200).json({
                    ok: true,
                    ciudad
                });
            } catch (err) {
                if (err.original) {
                    if (err.original.errno == 1452) {
                        // Accion Prohibida
                        return res.status(403).json({
                            ok: false,
                            msg: err.original.sqlMessage
                        });
                    }
                }
                console.log(err);
                return res.status(500).json({
                    msg: 'Internal server error'
                });
            }
        } else {
            return res.status(400).json({
                ok: false,
                msg: 'Bad Request: isVisible debe ser true o false'
            });
        }
    }

    return res.status(400).json({
        msg: 'Bad Request: Ingrese una ciudad'
    });
}
// ==========================================
// Obtiene todas las ciudades: GET /ciudad 
// ==========================================
exports.getAll = async (req, res) => {
    // console.log(req);
    try {
        const ciudades = await Ciudad.findAll({ include: { all: true }});
        return res.status(200).json({
            ok: true,
            ciudades
        });
    } catch (err) {
        console.log(err);
        return res.status(500).json({
            msg: 'Internal server error'
        });
    }
}
// ==========================================
// Obtiene todos las ciudades de un estado en especifico: GET /ciudad-por-idestadof?idEstadoF=0
// ==========================================
exports.getCityByStateId = async (req, res) => {
    let idEstadoF = req.query.idEstadoF || 0;
    // console.log(req);
    if (idEstadoF) {
      try {
        const ciudades = await Ciudad.findAll({
          order: [["nameCiudad", "ASC"]], // Ordenar por orden alfabetico los nombres de los ciudades.
          where: {
            isVisible: true,
            idEstadoF,
          },
          include: [
            {
              model: Estado,
              required: true,
              as: "estado",
            },
          ],
        });
        const cantidadEstados = ciudades.length;
        return res.status(200).json({
          ok: true,
          cantidadEstados,
          ciudades,
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
        msg: "Debe enviar un idEstadoF",
      });
    }
  };
// ==========================================
// Editar un ciudad: PUT /ciudad/:idCiudad Ejm. /ciudad/1 idCiudad: Params. nameCiudad (string), idEstadoF (int) Body (x-www-form-urlencoded)
// ==========================================
exports.edit = async (req, res) => {
    /*
    // Para debugger
    console.log('Por aqui');
    console.log(req.params);
    console.log(req.body);*/
    // Obtener los datos
    const idCiudad = req.params.idCiudad,
        nameCiudad = req.body.nameCiudad,
        idEstadoF = req.body.idEstadoF,
        isVisible = req.body.isVisible;
    // Si existen las variables que se necesitan.
    if (idCiudad) {
        if (isBoolean(isVisible)) {
            try {
                // Validar que no esten vacios los datos.
                if (nameCiudad != '' && nameCiudad && idEstadoF) {
                    const ciudad = await Ciudad.findOne({
                        where: {
                            idCiudad
                        }
                    });
                    //Cambiar el nombre del ciudad:
                    ciudad.nameCiudad = nameCiudad;
                    ciudad.idEstadoF = idEstadoF;
                    ciudad.updatedAt = new Date();
                    //Metodo save de sequelize para guardar en la BDD
                    const resultado = await ciudad.save();
                    if (!resultado) return next();
                    return res.status(200).json({
                        ok: true,
                        msg: 'Ciudad Actualizada'
                    });
                }
                return res.status(400).json({
                    ok: false,
                    msg: 'Bad Request: Ingrese una ciudad valida'
                });

            } catch (err) {
                //console.log(err.original.errno);
                if (err.original.errno == 1452) {
                    // Accion Prohibida
                    return res.status(403).json({
                        ok: false,
                        msg: err.original.sqlMessage
                    });
                }
                return res.status(500).json({
                    ok: false,
                    msg: 'Internal server error'
                });
            }
        } else {
            return res.status(400).json({
                ok: false,
                msg: 'Bad Request: isVisible debe ser true o false'
            });
        }
    } else {
        // Accion prohibida. (Error)
        return res.status(403).json({
            ok: false,
            msg: 'El id de la ciudad es obligatorio'
        });
    }
}
// ==========================================
// Borrar un ciudad: DELETE /ciudad/:idCiudad Ejm. /ciudad/1 
// ==========================================
exports.delete = async (req, res, next) => {
    /*
    // Para debugger
    console.log('Por aqui');
    console.log(req.params);
    console.log(req.body);*/
    // Obtener los datos
    const {
        idCiudad
    } = req.params;
    if (idCiudad) {
        try {
            //Eliminar el ciudad
            const resultado = await Ciudad.destroy({
                where: {
                    idCiudad
                }
            });
            if (!resultado) {
                return res.status(400).json({
                    ok: false,
                    msg: 'idCiudad no registrada'
                });
            }

            return res.status(200).json({
                ok: true,
                msg: 'Ciudad Eliminada'
            });

        } catch (err) {
            console.log(err);
            return res.status(500).json({
                msg: 'Internal server error'
            });
        }
    } else {
        // Accion prohibida. (Error)
        return res.status(403).json({
            ok: false,
            msg: 'El id de la ciudad es obligatorio'
        });
    }
}