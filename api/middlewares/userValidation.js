const { check, validationResult } = require("express-validator");

const validateNewUser = async (req, res, next) => {
  // Validaciones.
  const rules = [
    // El nombre no puede estar vacio.
    check([
      "password",
      "password2",
      "namesU",
      "lastNamesU",
      "identificationU",
      "directionU",
      "tlf1",
    ])
      .notEmpty()
      .trim()
      .withMessage("Faltan campos que son obligatorios.")
      .escape(),
    //Email no puede estar vacio, que  sea un email valido con @.
    check("emailU")
      .notEmpty()
      .trim()
      .withMessage("El emailU es obligatorio.")
      .isEmail()
      .withMessage("Ingresa un email válido")
      .escape(),
    // password must be at least 5 chars long
    check("password")
      .notEmpty()
      .withMessage("La contraseña es obligatoria")
      .isLength({ min: 3 })
      .withMessage("La contraseña debe ser mayor de 3 carácteres")
      .matches(/\d/)
      .withMessage("La contraseña debe contener almenos un número")
      .escape(),
    check("password2")
      .equals(req.body.password)
      .withMessage("Los passwords no son iguales"),
    check("idCiudadF")
      .isNumeric()
      .not()
      .withMessage("idCiudadF debe ser un número")
      .notEmpty()
      .trim()
      .withMessage("idCiudadF es Obligatorio")
      .escape(),
    check("idGenderF")
      .isNumeric()
      .not()
      .withMessage("idGenderF debe ser un número")
      .notEmpty()
      .trim()
      .withMessage("idGenderF es Obligatorio")
      .escape(),
    check("dateOfBirth")
      .isDate()
      .not()
      .withMessage("dateOfBirth debe ser un dato tipo date")
      .notEmpty()
      .trim()
      .withMessage("dateOfBirth es Obligatoria")
      .escape(),
  ];
  // console.log("rules ", JSON.stringify(rules));
  //***********Ejecutar Validaciones Express***********/
  await Promise.all(rules.map((validation) => validation.run(req)));
  // Meter en "errores" los errores de Express-Validator
  const erroresExpress = validationResult(req);
  let errExp = [];
  errExp = erroresExpress.errors.map((err) => err.msg);
  /*
      // For debugging.
      console.log("erroresExpress ", erroresExpress);
      console.log("errExp ", errExp);
      */
  if (errExp.length === 0) {
    /*
    // For debugging.
    return res.status(400).json({
      ok: false,
      error: "Bien",
    });
    */
    next();
  } else {
    // Accion prohibida. (Error)
    return res.status(400).json({
      ok: false,
      error: errExp,
    });
  }
};
const validateEditUser = async (req, res, next) => {
    // Validaciones.
    const rules = [
      // El nombre no puede estar vacio.
      check([
        "namesU",
        "lastNamesU",
        "identificationU",
        "directionU",
        "tlf1",
      ])
        .notEmpty()
        .trim()
        .withMessage("Faltan campos que son obligatorios.")
        .escape(),
      //Email no puede estar vacio, que  sea un email valido con @.
      check("emailU")
        .notEmpty()
        .trim()
        .withMessage("El emailU es obligatorio.")
        .isEmail()
        .withMessage("Ingresa un email válido")
        .escape(),
      check("idGenderF")
        .isNumeric()
        .not()
        .withMessage("idGenderF debe ser un número")
        .notEmpty()
        .trim()
        .withMessage("idGenderF es Obligatorio")
        .escape(),
      check("dateOfBirth")
        .isDate()
        .not()
        .withMessage("dateOfBirth debe ser un dato tipo date")
        .notEmpty()
        .trim()
        .withMessage("dateOfBirth es Obligatoria")
        .escape(),
    ];
    // console.log("rules ", JSON.stringify(rules));
    //***********Ejecutar Validaciones Express***********/
    await Promise.all(rules.map((validation) => validation.run(req)));
    // Meter en "errores" los errores de Express-Validator
    const erroresExpress = validationResult(req);
    let errExp = [];
    errExp = erroresExpress.errors.map((err) => err.msg);
    /*
        // For debugging.
        console.log("erroresExpress ", erroresExpress);
        console.log("errExp ", errExp);
        */
    if (errExp.length === 0) {
      /*
      // For debugging.
      return res.status(400).json({
        ok: false,
        error: "Bien",
      });
      */
      next();
    } else {
      // Accion prohibida. (Error)
      return res.status(400).json({
        ok: false,
        error: errExp,
      });
    }
  };

module.exports = {
  validateNewUser,
  validateEditUser
};
