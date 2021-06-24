require("dotenv").config({
  path: "variables.env",
});
const fs = require("fs");
const path = require("path");
var cloudinary = require("cloudinary").v2;
// const User = require("../models/User");
// const Categoria = require("../models/Categoria");
const Medicamento = require("../models/Medicamento");
const User = require("../models/User");
const { lePerteneceElToken } = require("../functions/function");

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

exports.eliminarCloudinary = async (publicid) => {
  const resultado = {};
  try {
    await cloudinary.uploader.destroy(publicid);
    resultado.ok = true;
    resultado.message = "La imagen se borró correctamente";
  } catch (e) {
    resultado.ok = false;
    resultado.message = "Ha ocurrido un error al eliminar la imagen";
  }
  return resultado;
};
// Subir la foto de los medicamentos, pero en cloudinary.
/*
Cambia/Agrega una imagen a un determinado medico, usuario y hospital.
Params: token del creador del medicamento. (Obligatorio)
Body: (form-data) imagen ('png', 'jpg', 'gif', 'jpeg')
PUT - Cambia/Agrega /upload/:id
*/
exports.subirACloudinary = (req, res, next) => {
  // Obtener los datos
  const id = Number(req.params.id);
  const tipo = req.params.tipo; // medicines or users
  const user = req.user; // Al tener el token puedo tener acceso a req.usuario
  // console.log("req.files ", req.files);
   // Validar que el tipo sea medicines or users
   if (tipo == "medicines" || tipo == "users") {
    // Todo bien
  } else {
    // El usuario no envio un tipo valido.
    return res.status(400).json({
      ok: false,
      mensaje: "El tipo debe ser medicines o users",
    });
  }
  // Si no hay foto
  if (!req.files || Object.keys(req.files).length === 0) {
    return res.status(400).json({
      ok: false,
      mensaje: "No files were uploaded.",
      errors: {
        message: "No files were uploaded.",
      },
    });
  }
  const imagen = req.files.imagen.tempFilePath;
  // Si el archivo pesa mas de 2mb entonces.
  if (req.files.imagen.truncated) {
    // 400 Error
    return res.status(400).json({
      ok: false,
      mensaje: "Archivo muy pesado.",
      errors: {
        message: "El archivo debe ser menor a 2mb",
      },
    });
  }
  if (imagen) {
    cloudinary.uploader.upload(
      imagen,
      {
        folder: tipo == "medicines" ? "medicamentos/" : tipo == "users" ? "users/" : null,
        unique_filename: true,
        resource_type: "image",
      },
      async function (error, result) {
        // console.log(result, error);
        if (error) {
          console.log(error);
          // Hubo un error al subir
          return res.status(400).json({
            ok: false,
            error, 
          });
        }
        // El archivo se subio con exito.
        // Guardar en la base de datos.
        const { asset_id, url } = result;
        const objImg = {
          asset_id,
          url,
        };
        const imgString = JSON.stringify(objImg);
        switch (tipo) {
          case "medicines":
            /* Preguntar si el idQR le pertenece al usuario del token */
            let lePertenecee = await lePerteneceElToken(
              user,
              id,
              Medicamento 
            ); 
            if (!lePertenecee) {
              // Accion prohibida
              return res.status(403).json({
                ok: false,
                msg: "No le pertenece ese medicamento",
              });
            }
            console.log("imgString ", imgString);
            guardarEnBDMedicines(id, imgString, res, user);
            break;
          case "users":
            /* Preguntar si el id le pertenece al usuario del token */
            if (user.idUser == id) {
              // Todo bien
              guardarEnBDUsers(id, imgString, res, user);
            } else {
              // Accion prohibida
              return res.status(403).json({
                ok: false,
                msg: "No le pertenece ese usuario",
              });
            }
            break;
          default:
            break;
        }
        /*res.send({
          success: true,
          result,
        });*/
      }
    );
  } else {
    // El usuario no escribio bien el campo imagen en el body
    return res.status(400).json({
      ok: false,
      mensaje: "Debe enviar por body (form) imagen",
    });
  }
  /*
  // Ejemplo de subir a cloudinary:
  cloudinary.uploader.upload("my_image.jpg", function (error, result) {
    console.log(result, error);
    res.send({
      success: true,
      result,
    });
  });*/
};
/*
Cambia/Agrega una imagen a un determinado usuario y medicamento.
Params: token del creador del medicamento. (Obligatorio)
Body: (form-data) imagen ('png', 'jpg', 'gif', 'jpeg')
PATCH - Cambia/Agrega /upload-multiple/cloudinary/:tipo/:id
*/
exports.subirACloudinaryMultipleImages = async (req, res, next) => {
  // Obtener los datos
  const id = Number(req.params.id);
  const tipo = req.params.tipo; // medicines or users
  const user = req.user; // Al tener el token puedo tener acceso a req.usuario
  // console.log("req.files ", req.files);
   // Validar que el tipo sea medicines or users
   if (tipo == "medicines" || tipo == "users") {
    // Todo bien
  } else {
    // El usuario no envio un tipo valido.
    return res.status(400).json({
      ok: false,
      mensaje: "El tipo debe ser medicines o users",
    });
  }
  // Si no hay foto
  if (!req.files || Object.keys(req.files).length === 0) {
    return res.status(400).json({
      ok: false,
      mensaje: "No files were uploaded.",
      errors: {
        message: "No files were uploaded.",
      },
    });
  }
  // console.log('req.files ', req.files);

  const imagenes = convertirObjImgAArray(req.files);
  console.log('imagenes ', imagenes);
  console.log('imagenes.length ', imagenes.length);
  // Si el archivo pesa mas de 2mb entonces.
  for(let i = 0; i < imagenes.length; i++){
    if (imagenes[i].truncated) {
      // 400 Error
      return res.status(400).json({
        ok: false,
        mensaje: "Archivo muy pesado.",
        errors: {
          message: "El archivo debe ser menor a 2mb",
        },
      });
    }
  }
  switch (tipo) {
    case "medicines":
        // El token le pertenece al creador del medicamento?
        let lePertenecee = await lePerteneceElToken(
          user,
          id,
          Medicamento 
        ); 
        if (!lePertenecee) {
          // Accion prohibida
          return res.status(403).json({
            ok: false,
            msg: "No le pertenece ese medicamento",
          });
        }
      break;
    case "users":
      // El token le pertenece al creador del medicamento?
      let lePerteneceAlUsuario = await lePerteneceElToken(
        user,
        id,
        User 
      ); 
      if (!lePerteneceAlUsuario) {
        // Accion prohibida
        return res.status(403).json({
          ok: false,
          msg: "No le pertenece ese token",
        });
      }
      break;
    default:
      break;
  }
  // Subir las imagenes
  let arrayImgsString = [];
  for(let i = 0; i < imagenes.length; i++){
    if (imagenes[i].tempFilePath) {
      const main = (i == 0) ? true : false;
      const objImg = await uploadImageToCloudinary(imagenes[i], tipo,  main);
      console.log("objImg ", objImg);
      arrayImgsString.push(objImg);
    } else {
      // El usuario no escribio bien el campo imagen en el body
      return res.status(400).json({
        ok: false,
        mensaje: "Debe enviar por body (form) imagen1",
      });
    }
  }
  // Obtener las imagenes viejas para borrarlas.
  switch (tipo) {
    case "medicines":
      try {
        const medicina = await Medicamento.findByPk(id);
        console.log("pictureM ", medicina.pictureM);
        if(!medicina.pictureM || medicina.pictureM.length === 0){

        }else{
          let b = medicina.pictureM;
          // b.replaceAll('\"', ' ');
          let arrayObjPictuM = JSON.parse(b); // a [{ public_id: "", sset_id: "", main: true, url: ""}]
          // console.log("arrayObjPictuM ", arrayObjPictuM);
          arrayObjPictuM.forEach(picture => {
            this.eliminarCloudinary(picture.public_id);
          });
        }
      } catch (error) {
        console.log(error);
        return res.status(500).json({
          msg: "Internal server error",
        });
      }
      break;
    case "users":
      try {
        const usuarioo = await User.findByPk(id);
        console.log("img ", usuarioo.img);
        if(!usuarioo.img || usuarioo.img.length === 0){

        }else{
          let b = usuarioo.img;
          // b.replaceAll('\"', ' ');
          let arrayObjPictuM = JSON.parse(b); // a [{ public_id: "", sset_id: "", main: true, url: ""}]
          // console.log("arrayObjPictuM ", arrayObjPictuM);
          arrayObjPictuM.forEach(picture => {
            this.eliminarCloudinary(picture.public_id);
          });
        }
      } catch (error) {
        console.log(error);
        return res.status(500).json({
          msg: "Internal server error",
        });
      }
      break;
    default:
      break;
  }
  // Guardar en BD el url de las imagenes
  console.log("arrayImgsString ", arrayImgsString);
  let arr = JSON.stringify(arrayImgsString);
  console.log("arr ", arr);
  switch (tipo) {
    case "medicines":
      await guardarEnBDMedicines(id, arr, res, user);
      break;
    case "users":
      await guardarEnBDUsers(id, arr, res, user);
      break;
    default:
      break;
  }
};
/*
Convierte el obj de req.files a un arreglo de imagenes.
@return imagen[]
Example:
@param {
  // Maximo hasta imagen5
  imagen1: {
    name: 'circulo-1.png',
    data: <Buffer >,
    size: 9578,
    encoding: '7bit',
    tempFilePath: 'C:\\Users\\carlo\\OneDrive\\Escritorio\\Trabajo\\ProyectoTesis\\backend\\medifree\\tmp\\tmp-1-1624411462874',
    truncated: false,
    mimetype: 'image/png',
    md5: '03b34f4d5d6b155a33dca05ef08a6b77',
    mv: [Function: mv]
  },
  }
*/
function convertirObjImgAArray(obj = {}){
  let array = [];
  const tipoDeCampo = ['imagen1','imagen2', 'imagen3', 'imagen4', 'imagen5'];
  for(let i = 0; i < tipoDeCampo.length; i++){
    if(obj[tipoDeCampo[i]]){
      array.push(obj[tipoDeCampo[i]]);
    }
  }
  return array;
}
/*
@Params
imagen: {
  tempFilePath: string
}
tipo: string "medicines"
main: boolean
@Return 
*/
const uploadImageToCloudinary = (imagen, tipo, main ) => {
  return new Promise((resolve, reject) =>{
    cloudinary.uploader.upload(
      imagen.tempFilePath,
      {
        folder: tipo == "medicines" ? "medicamentos/" : tipo == "users" ? "users/" : null,
        unique_filename: true,
        resource_type: "image",
      },
      async function (error, result) {
        // console.log(result, error);
        if (error) {
          console.log(error);
          // Hubo un error al subir
          return res.status(400).json({
            ok: false,
            error, 
          });
        }
        // El archivo se subio con exito.
        // Guardar en la base de datos.
        const { asset_id, url, public_id } = result;
        const objImg = {
          asset_id,
          url,
          public_id,
          main
        };
        resolve(objImg);
      }
    );
  });
}
/* Subir a la carpeta del servidor */

/*
Cambia/Agrega una imagen a un determinado medico, usuario y hospital.
Params: token del creador del medicamento. (Obligatorio)
Body: (form-data) imagen ('png', 'jpg', 'gif', 'jpeg')
PUT - Cambia/Agrega /upload/:tipo/:id
*/
exports.uploadImgToServer = async (req, res, next) => {
  // Obtener los datos
  const id = Number(req.params.id);
  const tipo = req.params.tipo; // medicines or users
  let user = req.user; // Al tener el token puedo tener acceso a req.usuario
  console.log("user ", user);
  // console.log("req.files ", req.files);
  // Validar que el tipo sea medicines or users
  if (tipo == "medicines" || tipo == "users") {
    // Todo bien
  } else {
    // El usuario no envio un tipo valido.
    return res.status(400).json({
      ok: false,
      mensaje: "El tipo debe ser medicines o users",
    });
  }
  // Si no hay foto
  if (!req.files || Object.keys(req.files).length === 0) {
    return res.status(400).json({
      ok: false,
      mensaje: "No files were uploaded.",
      errors: {
        message: "No files were uploaded.",
      },
    });
  }
  // Si el archivo pesa mas de 2mb entonces.
  if (req.files.imagen.truncated) {
    // 400 Error
    return res.status(400).json({
      ok: false,
      mensaje: "Archivo muy pesado.",
      errors: {
        message: "El archivo debe ser menor a 2mb",
      },
    });
  }
  // Obtener nombre del archivo.
  const archivo = req.files.imagen;
  const nombreCortado = archivo.name.split(".");
  const extensionArchivo = nombreCortado[nombreCortado.length - 1];
  // Solo estas extensiones son admitidas.
  const extensionesValidas = ["png", "jpg", "gif", "jpeg"];
  // Si regresa -1 es porque la extension no se encontro en el array
  if (extensionesValidas.indexOf(extensionArchivo) < 0) {
    return res.status(400).json({
      ok: false,
      mensaje: "Extension no valida.",
      errors: {
        message: "Las extensiones validas son " + extensionesValidas.join(", "),
      },
    });
  }
  // Nombre de archivo personalizado por id-numeroAlAzar.extension
  const nombreArchivo = `${id}-${new Date().getMilliseconds()}.${extensionArchivo}`;
  // console.log("nombreArchivo ", nombreArchivo);
  // Ruta del archivo
  const path = `./uploads/${tipo}/${nombreArchivo}`;

  switch (tipo) {
    case "medicines":
      /* Preguntar si el idQR le pertenece al usuario del token */
      let lePertenecee = await lePerteneceElToken(
        user,
        id,
        Medicamento
      );
      if (!lePertenecee) {
        // Accion prohibida
        return res.status(403).json({
          ok: false,
          msg: "No le pertenece ese medicamento",
        });
      }
      subirArchivoAlServer(path, archivo);
      guardarEnBDMedicines(id, nombreArchivo, res, user);
      break;
    case "users":
      /* Preguntar si el id le pertenece al usuario del token */
      if (user.idUser == id) {
        // Todo bien
        subirArchivoAlServer(path, archivo);
        guardarEnBDUsers(id, nombreArchivo, res, user);
      } else {
        // Accion prohibida
        return res.status(403).json({
          ok: false,
          msg: "No le pertenece ese usuario",
        });
      }
      break;
    default:
      break;
  }
};
async function guardarEnBDMedicines(
  idMedicine = null,
  nombreArchivo = "",
  res,
  user = {}
) {
  if (idMedicine) {
    try {
      /* Buscar la medicamento. */
      let medicine = await Medicamento.findByPk(idMedicine);
      // console.log('medicamentos  ', medicine);
      if (medicine) {
        // Si existe, elimina la imagen anterior
        var pathViejo = "./uploads/medicines/" + medicine.pictureM;

        // Si existe, elimina la imagen anterior
        if (fs.existsSync(pathViejo)) {
          fs.unlink(pathViejo, (error) => {
            if (error) {
              console.log(error);
            }
            return;
          });
        }
      }
      //Cambiar las medicamentos.
      medicine.pictureM = nombreArchivo;

      medicine.updatedAt = new Date();
      //Metodo save de sequelize para guardar en la BDD
      const resultado = await medicine.save();
      if (!resultado) return next();
      return res.status(200).json({
        ok: true,
        msg: "Medicamento Actualizado",
        medicine,
      });
    } catch (err) {
      console.log(err);
      return res.status(500).json({
        msg: "Internal server error",
      });
    }
  } else {
    // 400 (Bad Request)
    return res.status(400).json({
      ok: false,
      msg: "Verificar el idMedicine y el token",
    });
  }
}
async function guardarEnBDUsers(
  id = null,
  nombreArchivo = "",
  res,
  userToken = {}
) {
  if (id && userToken && res && nombreArchivo) {
    try {
      /* Buscar la User. */
      let userDB = await User.findByPk(id);
      // console.log('UserDBs  ', userDB);
      if (userDB) {
        // Si existe, elimina la imagen anterior
        var pathViejo = "./uploads/users/" + userDB.img;

        // Si existe, elimina la imagen anterior
        if (fs.existsSync(pathViejo)) {
          fs.unlink(pathViejo, (error) => {
            if (error) {
              console.log(error);
            }
            return;
          });
        }
      }
      //Cambiar el nombre de la img.
      userDB.img = nombreArchivo;

      userDB.updatedAt = new Date();
      //Metodo save de sequelize para guardar en la BDD
      const resultado = await userDB.save();
      if (!resultado) return next();
      return res.status(200).json({
        ok: true,
        msg: "Usuario Actualizado",
        userDB,
      });
    } catch (err) {
      console.log(err);
      return res.status(500).json({
        msg: "Internal server error",
      });
    }
  } else {
    // 400 (Bad Request)
    return res.status(400).json({
      ok: false,
      msg: "Verificar el id y el token",
    });
  }
}
// Mover el archivo del temporal a un path. 
const subirArchivoAlServer = (path, archivo) => {
  archivo.mv(path, (err) => {
    if (err) {
      return res.status(500).json({
        ok: false,
        mensaje: "Error al mover el archivo.",
        errors: err,
      });
    }
  });
};

// Mostrar imagen.
exports.getImageByType = async (req, res, next) => {
  const {tipo, img} = req.params;
  // Validar que el tipo sea medicines or users
  if (tipo == "medicines" || tipo == "users") {
    // Todo bien
  } else {
    // El usuario no envio un tipo valido.
    return res.status(400).json({
      ok: false,
      mensaje: "El tipo debe ser medicines o users",
    });
  }
  const pathImg = path.resolve(__dirname,`../../uploads/${tipo}/${img}`),
        noImage = path.resolve(__dirname,`../../uploads/no-image/no-image.png`);
  
  if(fs.existsSync(pathImg)){
    res.sendFile(pathImg);
  }else{
    res.sendFile(noImage);
  }
}
