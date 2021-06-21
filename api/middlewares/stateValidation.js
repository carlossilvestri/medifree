const { check, validationResult } = require("express-validator");

const validarTodosLosCamposDelEstado = async (req, res, next)=> {
// Validaciones.
  const rules = [
    // El nombre no puede estar vacio.
    check("nombreEstado")
      .notEmpty()
      .trim()
      .withMessage("El nombreEstado es Obligatorio")
      .escape(),
    //Email no puede estar vacio, que  sea un email valido con @.
    check("isVisible")
      .isBoolean()
      .not()
      .withMessage("isVisible debe ser un boolean"),
    // password must be at least 5 chars long
    check("idPaisF")
      .isNumeric()
      .not()
      .withMessage("idPaisF debe ser un numero")
      .notEmpty()
      .trim()
      .withMessage("idPaisF es Obligatorio")
      .escape(),
  ];
  // console.log("rules ", JSON.stringify(rules));
  //***********Ejecutar Validaciones Express***********/
  await Promise.all(rules.map((validation) => validation.run(req)));
  // Meter en "errores" los errores de Express-Validator
  const erroresExpress = validationResult(req);
  let errExp = [];
  errExp = erroresExpress.errors.map(err => err.msg);
  /*
  // For debugging.
  console.log("erroresExpress ", erroresExpress);
  console.log("errExp ", errExp);
  */
  if (errExp.length === 0) {
    next();
  }else{
    // Accion prohibida. (Error)
    return res.status(400).json({
        ok: false,
        error: errExp,
      });
  }
}
const validarPatchDelEstado = async (req, res, next)=> {
    // Validaciones.
      const rules = [
        //Email no puede estar vacio, que  sea un email valido con @.
        check("isVisible")
          .isBoolean()
          .not()
          .withMessage("isVisible debe ser un boolean"),
        // password must be at least 5 chars long
        check("idEstado")
          .isNumeric()
          .not()
          .withMessage("idEstado debe ser un numero")
          .notEmpty()
          .trim()
          .withMessage("idEstado es Obligatorio")
          .escape(),
      ];
      // console.log("rules ", JSON.stringify(rules));
      //***********Ejecutar Validaciones Express***********/
      await Promise.all(rules.map((validation) => validation.run(req)));
      // Meter en "errores" los errores de Express-Validator
      const erroresExpress = validationResult(req);
      let errExp = [];
      errExp = erroresExpress.errors.map(err => err.msg);
      /*
      // For debugging.
      console.log("erroresExpress ", erroresExpress);
      console.log("errExp ", errExp);
      */
      if (errExp.length === 0) {
        next();
      }else{
        // Accion prohibida. (Error)
        return res.status(400).json({
            ok: false,
            error: errExp,
          });
      }
    }

module.exports = {
    validarTodosLosCamposDelEstado,
    validarPatchDelEstado
}