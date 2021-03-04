const Gender = require('../models/Gender');
const { isBoolean } = require('./CategoriasController');
/*
==========================================
Registrar un gender: POST - /gender Body: (x-www-form-urlencoded) nameGender (string), isVisible (boolean)
==========================================
*/
exports.register = async (req, res) => {
    const {
        body
    } = req;
    // console.log(body);
    if (body.nameGender != '' && body.nameGender && body.isVisible) {
        if(isBoolean(body.isVisible)){
            try {
                const gender = await Gender.create({
                    nameGender: body.nameGender,
                    isVisible: body.isVisible,
                });
                return res.status(200).json({
                    ok: true,
                    gender
                });
            } catch (err) {
                // console.log(err.errors[0].type);
                if(err.errors[0].type == 'unique violation'){
                    return res.status(500).json({
                        ok: false,
                        msg: err.errors[0].message
                    });
                }
                console.log(err);
                return res.status(500).json({
                    ok: false,
                    msg: 'Internal server error'
                });
            }
        }else{
            return res.status(400).json({
                ok: false,
                msg: 'Bad Request: isVisible debe ser true o false'
            });
        }
    }

    return res.status(400).json({
        ok: false,
        msg: 'Bad Request: Ingrese un gender'
    });
}
// ==========================================
// Obtiene todas los genders: GET /gender 
// ==========================================
exports.getAll = async (req, res) => {
    // console.log(req);
    try {
        const genders = await Gender.findAll();
        return res.status(200).json({
            ok: true,
            genders
        });
    } catch (err) {
        console.log(err);
        return res.status(500).json({
            ok: false,
            msg: 'Internal server error'
        });
    }
}
// ==========================================
// Editar un gender: PUT /gender/:idGender Ejm. /gender/1 idGender: Params. nameGender (string), idPaisF (int) Body (x-www-form-urlencoded)
// ==========================================
exports.edit = async (req, res) => {
    /*
    // Para debugger
    console.log('Por aqui');
    console.log(req.params);
    console.log(req.body);*/
    // Obtener los datos
    const idGender = req.params.idGender,
        nameGender = req.body.nameGender,
        isVisible = req.body.isVisible,
        validVisible = isBoolean(isVisible);
        // console.log(req.body);
    // Si existen los variables que se necesitan.
    if (idGender) {
        try {
            // Validar que no esten vacios los datos.
            if (nameGender != '' && nameGender && isVisible) {
                if(validVisible){
                    const gender = await Gender.findOne({
                        where: {
                            idGender
                        }
                    });
                    //Cambiar el nombre del gender:
                    gender.nameGender = nameGender;
                    gender.isVisible = isVisible;
                    gender.updatedAt = new Date();
                    //Metodo save de sequelize para guardar en la BDD
                    const resultado = await gender.save();
                    if (!resultado) return next();
                    return res.status(200).json({
                        ok: true,
                        msg: 'Gender Actualizado'
                    });
                }else{
                    return res.status(400).json({
                        ok: false,
                        msg: 'Bad Request: isVisible debe ser true o false'
                    });
                }
            }
            return res.status(400).json({
                ok: false,
                msg: 'Bad Request: Ingrese una gender valida'
            });

        } catch (err) {
            //console.log(err.original.errno);
            if(err.original.errno == 1452){
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
        // Accion prohibida. (Error)
        return res.status(403).json({
            ok: false,
            msg: 'El id de la gender es obligatorio'
        });
    }
}
// ==========================================
// Borrar un gender: DELETE /gender/:idGender Ejm. /gender/1 
// ==========================================
exports.delete = async (req, res, next) => {
    /*
    // Para debugger
    console.log('Por aqui');
    console.log(req.params);
    console.log(req.body);*/
    // Obtener los datos
    const {
        idGender
    } = req.params;
    if (idGender) {
        try {
            //Eliminar el gender
            const resultado = await Gender.destroy({
                where: {
                    idGender
                }
            });
            if (!resultado) {
                return res.status(400).json({
                    ok: false,
                    msg: 'idGender no registrado'
                });
            }

            return res.status(200).json({
                ok: true,
                msg: 'Gender Eliminado'
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
            msg: 'El id de la gender es obligatorio'
        });
    }
}