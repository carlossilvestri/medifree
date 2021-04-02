const jwt = require("jsonwebtoken");
require('dotenv').config({
    path: 'variables.env'
});

/*
===========================
 Verificar Token para la img
==========================
*/
exports.verificarTokenImg = (req, res, next) => {

    const token = req.query.token;
    jwt.verify(token, process.env.SEED_JSON_WEB_TOKEN, (err, decoded) => {
        // Si hay algun error del servidor
        if (err) {
            // 401 Unauthorized
            return res.status(401).json({
                ok: false,
                mensaje: 'Token incorrecto',
                errors: err
            });
        }
        req.user = decoded.user;
        next();
    });
}