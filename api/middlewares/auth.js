const jwt = require("jsonwebtoken");
require('dotenv').config({
    path: 'variables.env'
});

module.exports = (req, res, next) => {

    const token = req.body.token;

    jwt.verify(token, process.env.SEED_JSON_WEB_TOKEN, (err, decoded) => {
        // Si hay algun error del servidor
        if (err) {
            console.log('err ', err);
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