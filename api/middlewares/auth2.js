const jwt = require("jsonwebtoken");
require("dotenv").config({
  path: "variables.env",
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
        mensaje: "Token incorrecto",
        errors: err,
      });
    }
    req.user = decoded.user;
    next();
  });
};
/*
===========================
 Verificar Token sin body, sino con query, es decir ?token=aquivaeltoken
==========================
*/
exports.verificarTokenDesdeQuery = (req, res, next) => {
  const token = req.query.token;
  jwt.verify(token, process.env.SEED_JSON_WEB_TOKEN, (err, decoded) => {
    // Si hay algun error del servidor
    if (err) {
      // console.log("err ", err);
      // console.log('err ', err.error.errors.message);
      // 401 Unauthorized
      return res.status(401).json({
        ok: false,
        mensaje: "Token incorrecto",
        errors: err,
      });
    }
    req.user = decoded.user;
    next();
  });
};
/*
===========================
 Verificar Token sin body, sino con query, es decir ?token=aquivaeltoken. TE DEJA PASAR SI EL TOKEN ESTA EXPIRADO
==========================
*/
exports.verificarTokenDesdeQueryLight = (req, res, next) => {
  const token = req.query.token;
  jwt.verify(token, process.env.SEED_JSON_WEB_TOKEN, (err, decoded) => {
    // Si hay algun error del token. La funcion decoded queda como undefined.
    if (err) {
      // console.log('err ', err);
      console.log("err.message ", err.message);
      if (err.message !== "jwt expired") {
        // 401 Unauthorized
        return res.status(401).json({
          ok: false,
          mensaje: "Token incorrecto",
          errors: err,
        });
      }else{
          // Si el token esta expirado decoded
          next();
          return; 
      }
    }
    req.user = decoded.user;
    next();
  });
};
