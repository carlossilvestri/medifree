const Pais = require('../models/Pais');
/*
==========================================
Registrar un pais: POST - /pais Body: (x-www-form-urlencoded) nameP
==========================================
*/
exports.register = async (req, res) => {
    const {
        body
    } = req;
    if (body.nameP != '' && body.nameP) {
        try {
            const pais = await Pais.create({
                nameP: body.nameP,
            });
            return res.status(200).json({
                ok: true,
                pais
            });
        } catch (err) {
            console.log(err);
            return res.status(500).json({
                msg: 'Internal server error'
            });
        }
    }

    return res.status(400).json({
        msg: 'Bad Request: Ingrese un pais don\'t match'
    });
}
// ==========================================
// Obtiene todos los paises: GET /pais 
// ==========================================
exports.getAll = async (req, res) => {
    // console.log(req);
    try {
        const paises = await Pais.findAll({
            where: {
                isVisible: true
            },
            order: [
              ['createdAt', 'DESC']
            ],
        });
        return res.status(200).json({
            ok: true,
            paises
        });
    } catch (err) {
        console.log(err);
        return res.status(500).json({
            msg: 'Internal server error'
        });
    }
}
// ==========================================
// Editar un pais: PUT /pais/:idPais Ejm. /pais/1 idPais: Params. nameP: Body (x-www-form-urlencoded)
// ==========================================
exports.edit = async (req, res) => {
    /*
    // Para debugger
    console.log('Por aqui');
    console.log(req.params);
    console.log(req.body);*/
    // Obtener los datos
    const idPais = req.params.idPais,
        nameP = req.body.nameP;
    if (idPais) {
        try {
            // Validar que no esten vacios los datos.
            if (nameP != '' && nameP) {
                const pais = await Pais.findOne({
                    where: {
                        idPais
                    }
                });
                //Cambiar el nombre del pais:
                pais.nameP = nameP;
                pais.updatedAt = new Date();
                //Metodo save de sequelize para guardar en la BDD
                const resultado = await pais.save();
                if (!resultado) return next();
                return res.status(200).json({
                    ok: true,
                    msg: 'Pais Actualizado'
                });
            }
            return res.status(400).json({
                ok: false,
                msg: 'Bad Request: Ingrese un pais valido don\'t match'
            });

        } catch (err) {
            console.log(err);
            return res.status(500).json({
                ok: false,
                msg: 'Internal server error'
            });
        }
    } else {
        // Accion prohibida. (Error)
        return res.status(403).json({
            ok: false,
            msg: 'El id del pais es obligatorio'
        });
    }
}
// ==========================================
// Borrar un pais: DELETE /pais/:idPais Ejm. /pais/1 
// ==========================================
exports.delete = async (req, res, next) => {
    /*
    // Para debugger
    console.log('Por aqui');
    console.log(req.params);
    console.log(req.body);*/
    // Obtener los datos
    const {
        idPais
    } = req.params;
    if (idPais) {
        try {
            //Eliminar el pais
            const resultado = await Pais.destroy({
                where: {
                    idPais
                }
            });
            if (!resultado) {
                return res.status(400).json({
                    ok: false,
                    msg: 'idPais no registrado'
                });
            }

            return res.status(200).json({
                ok: true,
                msg: 'Pais Eliminado'
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
            msg: 'El id del pais es obligatorio'
        });
    }
}