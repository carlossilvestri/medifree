const Categoria = require('../models/Categoria');
/*
==========================================
Registrar un categoria: POST - /categoria Body: (x-www-form-urlencoded) nameCategoria (string), isVisible (boolean)
==========================================
*/
exports.register = async (req, res) => {
    const {
        body
    } = req;
    // console.log(body);
    if (body.nameCategoria != '' && body.nameCategoria && body.isVisible) {
        try {
            const categoria = await Categoria.create({
                nameCategoria: body.nameCategoria,
                isVisible: body.isVisible,
            });
            return res.status(200).json({
                ok: true,
                categoria
            });
        } catch (err) {
            console.log(err);
            return res.status(500).json({
                msg: 'Internal server error'
            });
        }
    }

    return res.status(400).json({
        msg: 'Bad Request: Ingrese una categoria'
    });
}
// ==========================================
// Obtiene todas las categorias: GET /categoria 
// ==========================================
exports.getAll = async (req, res) => {
    // console.log(req);
    try {
        const categorias = await Categoria.findAll();
        return res.status(200).json({
            ok: true,
            categorias
        });
    } catch (err) {
        console.log(err);
        return res.status(500).json({
            msg: 'Internal server error'
        });
    }
}
// ==========================================
// Editar un categoria: PUT /categoria/:idCategoria Ejm. /categoria/1 idCategoria: Params. nameCategoria (string), idPaisF (int) Body (x-www-form-urlencoded)
// ==========================================
exports.edit = async (req, res) => {
    /*
    // Para debugger
    console.log('Por aqui');
    console.log(req.params);
    console.log(req.body);*/
    // Obtener los datos
    const idCategoria = req.params.idCategoria,
        nameCategoria = req.body.nameCategoria,
        isVisible = req.body.isVisible,
        validVisible = isBoolean(isVisible);
        // console.log(req.body);
    // Si existen las variables que se necesitan.
    if (idCategoria) {
        try {
            // Validar que no esten vacios los datos.
            if (nameCategoria != '' && nameCategoria && isVisible) {
                if(validVisible){
                    const categoria = await Categoria.findOne({
                        where: {
                            idCategoria
                        }
                    });
                    //Cambiar el nombre del categoria:
                    categoria.nameCategoria = nameCategoria;
                    categoria.isVisible = isVisible;
                    categoria.updatedAt = new Date();
                    //Metodo save de sequelize para guardar en la BDD
                    const resultado = await categoria.save();
                    if (!resultado) return next();
                    return res.status(200).json({
                        ok: true,
                        msg: 'Categoria Actualizada'
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
                msg: 'Bad Request: Ingrese una categoria valida'
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
            msg: 'El id de la categoria es obligatorio'
        });
    }
}
/*
Funcion que comprueba si el booleano es valido. Regresa true si es valida y false si no es valida.
*/
exports.isBoolean = (string = '') => {
    console.log('string ', string);
    if(string == '1' || string == '0'){
        return true;
    }else{
        return false;
    }
}
// ==========================================
// Borrar un categoria: DELETE /categoria/:idCategoria Ejm. /categoria/1 
// ==========================================
exports.delete = async (req, res, next) => {
    /*
    // Para debugger
    console.log('Por aqui');
    console.log(req.params);
    console.log(req.body);*/
    // Obtener los datos
    const {
        idCategoria
    } = req.params;
    if (idCategoria) {
        try {
            //Eliminar el categoria
            const resultado = await Categoria.destroy({
                where: {
                    idCategoria
                }
            });
            if (!resultado) {
                return res.status(400).json({
                    ok: false,
                    msg: 'idCategoria no registrada'
                });
            }

            return res.status(200).json({
                ok: true,
                msg: 'Categoria Eliminada'
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
            msg: 'El id de la categoria es obligatorio'
        });
    }
}