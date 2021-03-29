require("dotenv").config({
  path: "variables.env",
});
const fs = require("fs");
var cloudinary = require("cloudinary").v2;
// const User = require("../models/User");
// const Categoria = require("../models/Categoria");
const Medicamento = require("../models/Medicamento");
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
PUT - Cambia/Agrega /upload/:idMedicine
*/
exports.subirACloudinary = (req, res, next) => {
    // Obtener los datos
  const idMedicine = Number(req.params.idMedicine);
  const user = req.user; // Al tener el token puedo tener acceso a req.usuario
  console.log("req.files ", req.files);
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
        folder: "medicamentos/",
        unique_filename: true,
        resource_type: "image",
      },
      function (error, result) {
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
        const { asset_id, url} = result;
        const objImg = {
            asset_id,
            url
        }
        const imgString = JSON.stringify(objImg);
        guardarEnBaseDeDatos(idMedicine, imgString, res, user);
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
/* Subir a la carpeta del servidor */

/*
Cambia/Agrega una imagen a un determinado medico, usuario y hospital.
Params: token del creador del medicamento. (Obligatorio)
Body: (form-data) imagen ('png', 'jpg', 'gif', 'jpeg')
PUT - Cambia/Agrega /upload/:idMedicine
*/
exports.uploadImgToServer = async (req, res, next) => {
  // Obtener los datos
  const idMedicine = Number(req.params.idMedicine);
  const user = req.user; // Al tener el token puedo tener acceso a req.usuario
  // console.log("req.files ", req.files);
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
  // Nombre de archivo personalizado por idUsuario-numeroAlAzar.extension
  const nombreArchivo = `${idMedicine}-${new Date().getMilliseconds()}.${extensionArchivo}`;
  console.log("nombreArchivo ", nombreArchivo);
  // Mover el archivo del temporal a un path.
  const path = `./uploads/medicines/${nombreArchivo}`;
  archivo.mv(path, (err) => {
    if (err) {
      return res.status(500).json({
        ok: false,
        mensaje: "Error al mover el archivo.",
        errors: err,
      });
    }
  });
  guardarEnBaseDeDatos(idMedicine, nombreArchivo, res, user);
};

async function guardarEnBaseDeDatos(
  idMedicine = null,
  nombreArchivo = "",
  res,
  user = {}
) {
  if (idMedicine) {
    try {
      /* Preguntar si el idQR le pertenece al usuario del token */
      let lePertenecee = await lePerteneceElToken(
        user,
        idMedicine,
        Medicamento
      );
      if (!lePertenecee) {
        // Accion prohibida
        return res.status(403).json({
          ok: false,
          msg: "No le pertenece ese medicamento",
        });
      }
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
