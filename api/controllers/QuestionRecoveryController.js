const Gender = require('../models/Gender');
const Ciudad = require('../models/Gender');
const QuestionRecovery = require('../models/QuestionRecovery');
const User = require('../models/User');
/*
==========================================
Registrar un qr: POST - /qr Body: (x-www-form-urlencoded) q1, q2, r1, r2, idUsuarioF
==========================================
*/
exports.register = async (req, res) => {
    const {
        q1,
        q2,
        r1,
        r2,
        idUsuarioF
    } = req.body;
    if (q1 != '' && q2 != '' && r1 != '' && r2 != '') {
        try {
            const qr = await QuestionRecovery.create({
                q1,
                q2,
                r1,
                r2,
                idUsuarioF
            });
            return res.status(200).json({
                ok: true,
                qr
            });
        } catch (err) {
            console.log(err);
            return res.status(500).json({
                msg: 'Internal server error'
            });
        }
    }

    return res.status(400).json({
        msg: 'Bad Request: Verifique los datos q1, q2, r1 y r2.'
    });
}
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
                order: [
                    ['createdAt', 'DESC']
                ],
                include: [{
                    model: User,
                    as: 'usuario',
                    include: ['ciudades', 'sexos']
                }]
            });
            return res.status(200).json({
                ok: true,
                qres
            });
        } catch (err) {
            console.log(err);
            return res.status(500).json({
                msg: 'Internal server error'
            });
        }
    } else {
        // 400 (Bad Request)
        return res.status(400).json({
            ok: false,
            msg: 'El parametro desde no es válido'
        });
    }
}
/*
==========================================
Editar qres por id. PUT /qr/:idQr
==========================================
*/

exports.editById = async (req, res) => {
    // Debuggear
    // console.log('req.body ', req.body);

    // Obtener los datos por destructuring.
    const idQr = req.params.idQr;
        const {
            q1,
            q2,
            r1,
            r2
        } = req.body;

    if (q1 && q2 && r1 && r2) {
        try {
            let qr = await QuestionRecovery.findByPk(idQr);
            // console.log('preguntas de seguridad  ', qr);
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
                msg: 'Pregunta de Seguridad Actualizada',
                qr
            });
        } catch (err) {
            console.log(err);
            // console.log('err.errors[0] ', err.errors[0].type == 'Validation error');
            return res.status(500).json({
                ok: false,
                msg: 'Internal server error'
            });
        }
    } else {
        return res.status(400).json({
            ok: false,
            msg: 'Faltan datos por completar.'
        });
    }
}
// ==========================================
// Editar un qr: PUT /qr/:idQr Ejm. /qr/1 idQr: Params. nameP: Body (x-www-form-urlencoded)
// ==========================================
exports.edit = async (req, res) => {
    /*
    // Para debugger
    console.log('Por aqui');
    console.log(req.params);
    console.log(req.body);*/
    // Obtener los datos
    const idQr = req.params.idQr,
        nameP = req.body.nameP;
    if (idQr) {
        try {
            // Validar que no esten vacios los datos.
            if (nameP != '' && nameP) {
                const qr = await QuestionRecovery.findOne({
                    where: {
                        idQr
                    }
                });
                //Cambiar el nombre del qr:
                qr.nameP = nameP;
                qr.updatedAt = new Date();
                //Metodo save de sequelize para guardar en la BDD
                const resultado = await qr.save();
                if (!resultado) return next();
                return res.status(200).json({
                    ok: true,
                    msg: 'QuestionRecovery Actualizado'
                });
            }
            return res.status(400).json({
                ok: false,
                msg: 'Bad Request: Ingrese un qr valido don\'t match'
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
            msg: 'El id del qr es obligatorio'
        });
    }
}
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
    const {
        idQr
    } = req.params;
    if (idQr) {
        try {
            //Eliminar el qr
            const resultado = await QuestionRecovery.destroy({
                where: {
                    idQr
                }
            });
            if (!resultado) {
                return res.status(400).json({
                    ok: false,
                    msg: 'idQr no registrado'
                });
            }

            return res.status(200).json({
                ok: true,
                msg: 'Question Recovery Eliminado'
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
            msg: 'El id del qr es obligatorio'
        });
    }
}