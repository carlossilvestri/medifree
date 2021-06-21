const { lePerteneceElToken } = require('../functions/function');
const Ciudad = require('../models/Ciudad');
const Estado = require('../models/Estado');
const Gender = require('../models/Gender');
const User = require('../models/User');
const authService = require('../services/auth.service');
const bcryptService = require('../services/bcrypt.service');
const {
  isBoolean
} = require('./CategoriasController');

/*
==========================================
Registrar un usuario nuevo: POST - /user Body: (x-www-form-urlencoded) password string, password2 string, emailU string, namesU string, lastNamesU string, identificationU string, idCiudadF integer,  boolean, dateOfBirth date, directionU text, idGenderF tiny string, tlf1 string, tlf2 string (opcional)
==========================================
*/
exports.register = async (req, res) => {

  // Debuggear
  // console.log('req.body ', req.body);

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
  // console.log('tlf1 ', tlf1);
  /*
  ===============================================
  TIPOS DE DATOS: Tabla User.
  ==============================================
  password string, password2 string, emailU string, namesU string, lastNamesU string, identificationU string, idCiudadF integer,  boolean, dateOfBirth date, directionU text, idGenderF tiny string, tlf1 string, tlf2 string (opcional)
  */
  // Validar los datos
      try {
        let user;
        // Si el usuario ingreso un tlf adicional.
        if (tlf2) {
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
        } else {
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
          user
        });

        return res.status(201).json({
          ok: true,
          token,
          user
        });
      } catch (err) {
        if (err.original) {
          if (err.original.errno == 1452 || err.original.errno == 1062) {
            // Accion Prohibida
            return res.status(403).json({
              ok: false,
              msg: err.original.sqlMessage
            });
          }
        }
        if (err.errors[0]) {
          if (err.errors[0].type == 'Validation error') {
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
};
/*
==========================================
POST - /user (Devuelve un usuario logueado con su token valido)
==========================================
*/
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
          //include: ['ciudades', 'sexos']
          include: [
            {
              model: Ciudad,
              as: "ciudades",
              required: true,
              include: [
                {
                  model: Estado,
                  as: "estado",
                  include: "paises",
                },
              ],
            },
            {
              model: Gender,
              as: 'sexos'
            }
          ]
        });

      if (!user) {
        return res.status(400).json({
          msg: 'Bad Request: User not found'
        });
      }

      if (bcryptService().comparePassword(password, user.password)) {
        const token = authService().issue({
          user
        });
        // No mostrar el hash del password
        user.password = ":)";
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
/*
==========================================
Middleware que valida si el token es valido, si no está expirado, está bien escrito.
==========================================
*/
exports.validarToken = (req, res, next) => {
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
    next();
    /*return res.status(200).json({
      isvalid: true
    });*/
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
/*
==========================================
Obtener Users: GET - /users Params: ?desde=0 (Devuelve un arreglo de Users limitandolo a 10 y decidiendo desde para la paginacion) sino se envia un desde por default sera 0.
 Los mas recientes primero. (Order by DESC) 
==========================================
*/
exports.getAll = async (req, res) => {
  let desde = req.query.desde || 0;
  desde = Number(desde);

  // For debugging purposes
  // console.log(' desde ', desde);
  // return;
  if (desde == 0 || desde > 0) {
    try {
      let users = await User.findAll({
        limit: 10,
        offset: desde,
        order: [
          ['createdAt', 'DESC']
        ],
        include: [
          {
            model: Ciudad,
            as: "ciudades",
            required: true,
            include: [
              {
                model: Estado,
                as: "estado",
                include: "paises",
              },
            ],
          },
          {
            model: Gender,
            as: 'sexos'
          }
        ]
      });
      const cantidadUsuarios = users.length;
      // No mostrar el password de los usuarios.
      for (let i = 0; i < cantidadUsuarios; i++) {
        users[i].password = ":)"
      }
      // console.log('users ', users.length);
      return res.status(200).json({
        ok: true,
        cantidadUsuarios,
        users
      });
    } catch (err) {
      console.log(err);
      return res.status(500).json({
        ok: false,
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
};
/*
Obtener Users: GET - /user/idUser
*/
exports.getUserById = async (req, res) => {
  let idUser = req.params.idUser;
  idUser = Number(idUser);
  if (!idUser || idUser <= 0) {
    return res.status(400).json({
      ok: false,
      mensaje: 'Debe proporcionar un idUser valido.'
    });
  }
  console.log('idUser ', idUser);
  // Encontra el user
  try {
    let user = await User.findByPk(idUser, {
      include: [
        {
          model: Ciudad,
          as: "ciudades",
          required: true,
          include: [
            {
              model: Estado,
              as: "estado",
              include: "paises",
            },
          ],
        },
        {
          model: Gender,
          as: 'sexos'
        }
      ]
    });
    // Si existe el usuario
    if (user) {
      user.password = ":)";
      return res.status(200).json({
        ok: true,
        user
      });
    }
    // No existe el usuario
    return res.status(400).json({
      ok: false,
      mensaje: 'No se encontró al usuario.'
    });
  } catch (error) {
    console.log(err);
    return res.status(500).json({
      ok: false,
      msg: 'Internal server error'
    });
  }
}
/*
==========================================
Editar usuario por id. PUT /user/:idUser
==========================================
*/

exports.editUserById = async (req, res) => {
  // Debuggear
  // console.log('req.body ', req.body);
  const idUser = Number(req.params.idUser);
  const user = req.user; // Al tener el token puedo tener acceso a req.usuario
  /* Preguntar si el idQR le pertenece al usuario del token */
  let lePertenecee = await lePerteneceElToken(user, idUser, User);
  if (!lePertenecee) {
    // Accion prohibida
    return res.status(403).json({
      ok: false,
      msg: "No le pertenece esa pregunta de seguridad",
    });
  }
  // Obtener los datos por destructuring.
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
  // console.log('tlf1 ', tlf1);
  /*
  ===============================================
  TIPOS DE DATOS: Tabla User.
  ==============================================
  password string, password2 string, emailU string, namesU string, lastNamesU string, identificationU string, idCiudadF integer,  boolean, dateOfBirth date, directionU text, idGenderF tiny string, tlf1 string, tlf2 string (opcional)
  */
  // Validar los datos
    /*
    El usuario debe enviar la clave y la clave repetida para confirmar su clave por seguridad.
    Clave = password
    Clave repetida = password2
    */
    try {
      let user = await User.findByPk(idUser);
      // console.log('USUARIO  ', user);
      //Cambiar el nombre del ciudad:
      user.namesU = namesU;
      user.lastNamesU = lastNamesU;
      user.identificationU = identificationU;
      if (password && password2) {
        if (password === password2) {
        user.password = password;
        user.password =  bcryptService().password(user); 
        } else {
          return res.status(400).json({
            ok: false,
            msg: 'Bad Request: Passwords don\'t match'
          });
        }
      }
      user.idCiudadF = idCiudadF;
      user.dateOfBirth = dateOfBirth;
      user.directionU = directionU;
      user.idGenderF = idGenderF;
      user.tlf1 = tlf1;
      if (tlf2 || tlf2 === '') {
        user.tlf2 = tlf2;
      }
      user.updatedAt = new Date();
      //Metodo save de sequelize para guardar en la BDD
      const resultado = await user.save();
      if (!resultado) return next();
      return res.status(200).json({
        ok: true,
        msg: 'Usuario Actualizado',
        user
      });
    } catch (err) {
      console.log(err);
      // console.log('err.errors[0] ', err.errors[0].type == 'Validation error');
      return res.status(500).json({
        ok: false,
        msg: 'Internal server error'
      });
    }
}
/*
==========================================
Editar el password de un usuario. Body: password, password2
==========================================
*/

exports.editPassword = async (req, res) => {
  // Debuggear
  console.log('req.body ', req.body);
  const user = req.user; // Al tener el token puedo tener acceso a req.usuario
  console.log('req.user ', user);
  // Obtener los datos por destructuring.
  const {
    password,
    password2,
  } = req.body;
  // console.log('tlf1 ', tlf1);
  /*
  ===============================================
  TIPOS DE DATOS: Tabla User.
  ==============================================
  password string, password2 string
  */
  // Validar los datos
  // Que existan los datos obligatorios.
  if (password && password2 && user) {
    /*
    El usuario debe enviar la clave y la clave repetida para confirmar su clave por seguridad.
    Clave = password
    Clave repetida = password2
    */
    // Si el usuario envia su clave, verificar.
    try {
      let userFound = await User.findByPk(user.idUser);
      // console.log('USUARIO  ', user);
      //Si las passwords coinciden:
      if (password && password2) {
        if (password === password2) {
        userFound.password = password;
        userFound.password =  bcryptService().password(userFound); 
        } else {
          return res.status(400).json({
            ok: false,
            msg: 'Bad Request: Passwords don\'t match'
          });
        }
      }
      userFound.updatedAt = new Date();
      //Metodo save de sequelize para guardar en la BDD
      const resultado = await userFound.save();
      if (!resultado) return next();
      return res.status(200).json({
        ok: true,
        msg: 'Usuario Actualizado'
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
      msg: 'Faltan datos por completar. (password string, password2 string'
    });
  }
}

//==========================================
// Edita una qr segun el email y las respuesta correctas. Params: ?idUser 
//==========================================
exports.getTokenRefreshed = async (req, res) => {
  // Obtener la info del param (idUser).
  const idUser = Number(req.query.idUser);
  /*
  console.log('idUser ', idUser );
  console.log('req.params.idUser ', req.query.idUser );
  */
  // Comprobar que no vengan valores vacios.
  if(!idUser){
      return res.status(400).json({
        ok: false,
        msg: "Ingrese un idUser.",
      });
    }
  // Buscar usuario.
  try {
    let user = await User.findByPk(idUser, {
      include: [{
          model: Ciudad,
          as: 'ciudades',
          include: 'paises'
        },
        {
          model: Gender,
          as: 'sexos'
        }
      ]
    });
    // Si existe el usuario
    if (user) {
      const token = authService().issue({
        user: user
      });
      // Todo bien
      return res.status(200).json({
        ok: true,
        token,
      });
    }
    // No existe el usuario
    return res.status(400).json({
      ok: false,
      mensaje: 'No se encontró al usuario.'
    });
  } catch (error) {
    console.log(err);
    return res.status(500).json({
      ok: false,
      msg: 'Internal server error'
    });
  }
}