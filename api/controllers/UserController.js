const User = require('../models/User');
const authService = require('../services/auth.service');
const bcryptService = require('../services/bcrypt.service');
const {
  isBoolean
} = require('./CategoriasController');


exports.register = async (req, res) => {

  // Debuggear
  console.log('req.body ', req.body);

  // Obtener los datos.
  const {
    password,
    password2,
    emailU,
    namesU,
    lastNamesU,
    identificationU,
    idCiudadF,
    dateOfBirth,
    directionU,
    idGenderF,
    tlf1,
    tlf2
  } = req.body;
  let validDonatorBoolean = false;
  console.log('tlf1 ', tlf1);
  /*
  ===============================================
  TIPOS DE DATOS: Tabla User.
  ==============================================
  password string, password2 string, emailU string, namesU string, lastNamesU string, identificationU string, idCiudadF integer,  boolean, dateOfBirth date, directionU text, idGenderF tiny string, tlf1 string, tlf2 string (opcional)
  */
  // Validar los datos
  // Que existan los datos obligatorios.
  if (password && password2 && emailU && namesU && lastNamesU && identificationU && idCiudadF && dateOfBirth && directionU && idGenderF && tlf1) {
      /*
    El usuario debe enviar la clave y la clave repetida para confirmar su clave por seguridad.
    Clave = password
    Clave repetida = password2
    */
      if (password === password2) {
        try {
          let user;
          // Si el usuario ingreso un tlf adicional.
          if(tlf2){
            user = await User.create({
              emailU,
              password,
              namesU,
              lastNamesU,
              identificationU,
              idCiudadF,
              dateOfBirth,
              directionU,
              idGenderF,
              tlf1,
              tlf2
            });
          }else{
            user = await User.create({
              emailU,
              password,
              namesU,
              lastNamesU,
              identificationU,
              idCiudadF,
              dateOfBirth,
              directionU,
              idGenderF,
              tlf1,
              tlf2: ''
            });
          }
          // console.log('user ', user);
          // console.log('user.dataValues.idUser ', user.dataValues.idUser );
          const token = authService().issue({
            id: user.dataValues.idUser
          });

          return res.status(200).json({
            ok: true,
            token,
            user
          });
        } catch (err) {
          if(err.original){
            if(err.original.errno == 1452 || err.original.errno == 1062){
              // Accion Prohibida
              return res.status(403).json({
                  ok: false,
                  msg: err.original.sqlMessage
              }); 
            }
          }
          if(err.errors[0]){
            if(err.errors[0].type == 'Validation error'){
              // Accion Prohibida
              return res.status(403).json({
                ok: false,
                msg: err.errors[0].message
            });
            }
          }
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
          msg: 'Bad Request: Passwords don\'t match'
        });
      }

  }else{
    return res.status(400).json({
      ok: false,
      msg: 'Faltan datos por completar. (password string, password2 string, emailU string, namesU string, lastNamesU string, identificationU string, idCiudadF integer,  boolean, dateOfBirth date, directionU text, idGenderF tiny string, tlf1 string, tlf2 string (opcional)'
    });
  }
};
exports.login = async (req, res) => {
  const {
    emailU,
    password
  } = req.body;

  if (emailU && password) {
    try {
      const user = await User
        .findOne({
          where: {
            emailU,
          },
        });

      if (!user) {
        return res.status(400).json({
          msg: 'Bad Request: User not found'
        });
      }

      if (bcryptService().comparePassword(password, user.password)) {
        const token = authService().issue({
          id: user.id
        });

        return res.status(200).json({
          token,
          user
        });
      }

      return res.status(401).json({
        msg: 'Unauthorized'
      });
    } catch (err) {
      console.log(err);
      return res.status(500).json({
        msg: 'Internal server error'
      });
    }
  }

  return res.status(400).json({
    msg: 'Bad Request: Email or password is wrong'
  });
};

exports.validate = (req, res) => {
  const {
    token
  } = req.body;

  authService().verify(token, (err) => {
    if (err) {
      return res.status(401).json({
        isvalid: false,
        err: 'Invalid Token!'
      });
    }

    return res.status(200).json({
      isvalid: true
    });
  });
};

exports.getAll = async (req, res) => {
  try {
    const users = await User.findAll();

    return res.status(200).json({
      users
    });
  } catch (err) {
    console.log(err);
    return res.status(500).json({
      msg: 'Internal server error'
    });
  }
};