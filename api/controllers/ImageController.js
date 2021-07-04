require("dotenv").config({
  path: "variables.env",
});
const fs = require("fs");
const path = require("path");
const Medicamento = require("../models/Medicamento");
const User = require("../models/User");
const Image = require("../models/Image");
const { lePerteneceElToken, stringToBoolean } = require("../functions/function");
const { isBoolean } = require("./CategoriasController");

/* END POINTS */
/*
Registrar una imagen a un determinada medicina o usuario.
Params: token del creador del medicamento. (Obligatorio)
Body: (form-data) imagen ('png', 'jpg', 'gif', 'jpeg')
POST - Cambia/Agrega /image/:tipo/:id  (tipo: medicines o users).
     -  mainImage : boolean 
     -  idMedicamentoF : number (opcional)
     -  idUserF : number (opcional)
*/
const crearImagen = async (req, res, next) => {
  // Obtener los datos
  const { mainImage } = req.body;
  const id = Number(req.params.id); // id de medicamento o de user
  const tipo = req.params.tipo; // medicines or users
  let user = req.user; // Al tener el token puedo tener acceso a req.usuario
  // Validar que el tipo sea medicines or users
  mostrarErrorTipoInvalido(tipo, res); // Muestra error de tipo invalido si no se ingreso medicines o users
  // Si no hay foto
  mostrarErrorImagenInvalida(req, res);
  // Mas validaciones.
  // Obtener nombre del archivo.
  const archivo = req.files.imagen;
  const nombreCortado = archivo.name.split(".");
  const extensionArchivo = nombreCortado[nombreCortado.length - 1];
  // Si regresa -1 es porque la extension no se encontro en el array
  mostrarErrorExtensionesValidas(extensionArchivo);
  // Nombre de archivo personalizado por id-numeroAlAzar.extension
  const nombreArchivo = `${id}-${new Date().getMilliseconds()}.${extensionArchivo}`;
  // console.log("nombreArchivo ", nombreArchivo);
  // Ruta del archivo
  const path = `./uploads/${tipo}/${nombreArchivo}`;

  switch (tipo) {
    case "medicines":
      /* Preguntar si el idQR le pertenece al usuario del token */
      let lePertenecee = await lePerteneceElToken(user, id, Medicamento);
      if (!lePertenecee) {
        // Accion prohibida
        return res.status(403).json({
          ok: false,
          msg: "No le pertenece ese medicamento",
        });
      } else {
        subirArchivoAlServer(path, archivo, res);
        const obj = { nameImage: nombreArchivo, mainImage, id, res, tipo };
        await guardarImgNuevaEnBD(obj);
      }
      break;
    case "users":
      /* Preguntar si el id le pertenece al usuario del token */
      if (user.idUser == id) {
        // Todo bien
        subirArchivoAlServer(path, archivo, res);
        const obj = { nameImage: nombreArchivo, mainImage, id, res, tipo };
        await guardarImgNuevaEnBD(obj);
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
/*
Registrar una imagen a un determinada medicina o usuario.
Params: token del creador del medicamento. (Obligatorio)
Body: (form-data) imagen ('png', 'jpg', 'gif', 'jpeg')
POST - Cambia/Agrega /image-edit/:id 
     -  mainImage : boolean pero lo toma como string node 
     -  id        : number
*/
const editarImagen = async (req, res, next) => {
  // Obtener los datos a necesitar.
  const { mainImage } = req.body;
  const id = Number(req.params.id);
  // const tipo = req.params.tipo; // medicines or users
  // Error en la imagen ?
  // mostrarErrorTipoInvalido(tipo, res); // Muestra error de tipo invalido si no se ingreso medicines o users
  mostrarErrorImagenInvalida(req, res);
  // Mas validaciones.
  // Obtener nombre del archivo.
  const archivo = req.files.imagen;
  const nombreCortado = archivo.name.split(".");
  const extensionArchivo = nombreCortado[nombreCortado.length - 1];
  // Si regresa -1 es porque la extension no se encontro en el array
  mostrarErrorExtensionesValidas(extensionArchivo);
  // Nombre de archivo personalizado por id-numeroAlAzar.extension
  const nombreArchivo = `${id}-${new Date().getMilliseconds()}.${extensionArchivo}`;
  // console.log("nombreArchivo ", nombreArchivo);
  /* GUARDAR IMAGEN EN EL SERVIDOR */
  try {
    /* Buscar. */
    let imagen = await Image.findByPk(id);
    // console.log('imagen  ', imagen);
    if (imagen) {
      let tipo = saberTipoDesdeObjImagen(imagen);
      // Ruta del archivo
      const path = `./uploads/${tipo}/${nombreArchivo}`;
      // Si existe, elimina la imagen anterior
      const pathViejo = `./uploads/${tipo}/${imagen.nameImage}`;
      console.log("pathViejo ", pathViejo);
      let idAUsar = "";
      if (saberTipo(tipo) == User) {
        idAUsar = imagen.idUserF;
      }
      if (saberTipo(tipo) == Medicamento) {
        idAUsar = imagen.idMedicamentoF;
      }
      // FOR DEBUGGING.
      console.log("mainImage IMPORTA ", mainImage);
      console.log("stringToBoolean(mainImage) ", stringToBoolean(mainImage));
      // Es la img principal? Entonces actualizar el modelo.
      if(mainImage === "true" || mainImage === "1" || mainImage === true){
        const obj = {
          nameImage: nombreArchivo,
          mainImage,
          id: idAUsar,
          res,
          tipo,
        };
        await guardarImgPrincipalEnElModelo(obj);
      }
      eliminarImgLocalServer(pathViejo);
      //Cambiar el nombre de la img.
      imagen.nameImage = nombreArchivo;
      imagen.mainImage = stringToBoolean(mainImage);

      imagen.updatedAt = new Date();
      //Metodo save de sequelize para guardar en la BDD
      const resultado = await imagen.save();
      // Subir imagen al servidor local.
      subirArchivoAlServer(path, archivo, res);
      if (!resultado) return next();
      return res.status(200).json({
        ok: true,
        msg: "Imagen Actualizada",
        imagen,
      });
    }else{
      return res.status(400).json({
        msg: "La img no existe.",
      });
    }
  } catch (err) {
    console.log(err);
    return res.status(500).json({
      msg: "Internal server error",
    });
  }
};
const editarImgPrincipal = async (req, res, next) => {
  const id = Number(req.params.id); // id de la imagen
  const { mainImage } = req.body; // string
  if(!id || !isBoolean(mainImage)){
    mostrarError(res, "Debe ingresar un id : number y un mainImage : boolean", 400);
  }
  try {
    let imagen = await Image.findByPk(id);
    if (!imagen) {
      return res.status(400).json({
        ok: false,
        msg: "Imagen no registrada",
      });
    }
    if(mainImage === "true" || mainImage === "1" || mainImage === true){
      const tipo = saberTipoDesdeObjImagen(imagen);
      let obj = {};
      if(tipo === "medicines"){
        obj = { nameImage: imagen.nameImage, id: imagen.idMedicamentoF, res, tipo };
      }
      if(tipo === "users"){
        obj = { nameImage: imagen.nameImage, id: imagen.idUserF, res, tipo };
      }
      await guardarImgPrincipalEnElModelo(obj); 
    } 
    imagen.mainImage = mainImage;
    console.log(JSON.stringify(imagen));
    const img = await imagen.save();
    return res.status(200).json({
      ok: true,
      img,
      msg: "Imagen Editada",
    });
  } catch (error) {
    console.log(error);
    mostrarError(res, "Hubo un error", 500);
  }
}
// ==========================================
// Borrar un image: DELETE /image/:idImage Ejm. /image/1
// ==========================================
const eliminarImagen = async (req, res, next) => {
  /*
    // Para debugger
    console.log('Por aqui');
    console.log(req.params);
    console.log(req.body);*/
  // Obtener los datos
  const { idImage } = req.params;
  if (idImage) {
    try {
      const buscarImagen = await Image.findByPk(idImage);
      if (!buscarImagen) {
        return res.status(400).json({
          ok: false,
          msg: "idImage no registrada",
        });
      }
      const tipo = saberTipoDesdeObjImagen(buscarImagen);
      const pathViejo = `./uploads/${tipo}/${buscarImagen.nameImage}`;
      //Eliminar el estado
      const resultado = await Image.destroy({
        where: {
          idImage,
        },
      });
      if (!resultado) {
        return res.status(400).json({
          ok: false,
          msg: "idImage no registrada",
        });
      } else {
        // Eliminar la img del server local.
        eliminarImgLocalServer(pathViejo);
        // Era la img principal? y Hay otras imagenes?
      let objFilter = {}, obj = {};
      if(tipo === "users"){
        objFilter = {
          idUserF: buscarImagen.idUserF
        }
      }
      if(tipo === "medicines"){
        objFilter = {
          idMedicamentoF: buscarImagen.idMedicamentoF
        }
      }
        const imagenes = await Image.findAll({
          where: objFilter
        });
        if(imagenes){
          if(imagenes.length > 0){
            if(tipo === "users"){
              obj = { nameImage: imagenes[0].nameImage, id: imagenes[0].idUserF, res, tipo };
            }
            if(tipo === "medicines"){
              obj = { nameImage: imagenes[0].nameImage, id: imagenes[0].idMedicamentoF, res, tipo };
            }
            await guardarImgPrincipalEnElModelo(obj);
            // Guardar el mainImage en la imagen true nueva.
            imagenes[0].mainImage = true;
            await imagenes[0].save();
          }else if(imagenes.length === 0){
            if(tipo === "users"){
              obj = { nameImage: null, id: buscarImagen.idUserF, res, tipo };
            }
            if(tipo === "medicines"){
              obj = { nameImage: null, id: buscarImagen.idMedicamentoF, res, tipo };
            }
            await guardarImgPrincipalEnElModelo(obj);
          }
        }
      }

      return res.status(200).json({
        ok: true,
        msg: "Imagen Eliminada",
      });
    } catch (err) {
      console.log(err);
      return res.status(500).json({
        msg: "Internal server error",
      });
    }
  } else {
    // Accion prohibida. (Error)
    return res.status(403).json({
      ok: false,
      msg: "El id de la imagen es obligatorio",
    });
  }
};

// ==========================================
// Obtiene los por idMedicamentoF o por idUserF: GET /image/:tipo/:id
// - tipo : string (medicines o users)
// - id : number
// ==========================================
const getImagesBy = async (req, res) => {
  const { tipo } = req.params;
  const id = Number(req.params.id);
  // console.log(req);
  if (tipo && id) {
    const condicion = {
      isVisible: true,
      idMedicamentoF: tipo === "medicines" ? id : null,
      idUserF: tipo === "users" ? id : null,
    };
    try {
      const imagenes = await Image.findAll({
        order: [["createdAt", "ASC"]], // Ordenar por fecha.
        where: condicion,
      });
      const cantidad = imagenes.length;
      return res.status(200).json({
        ok: true,
        cantidad,
        imagenes,
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
      msg: "Debe enviar un tipo && id",
    });
  }
};
/* ERRORES */
const mostrarErrorTipoInvalido = (tipo, res) => {
  if (tipo == "medicines" || tipo == "users") {
    // Todo bien
  } else {
    // El usuario no envio un tipo valido.
    return res.status(400).json({
      ok: false,
      mensaje: "El tipo debe ser medicines o users",
    });
  }
};
const mostrarErrorImagenInvalida = (req, res) => {
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
  errorImgTamano(req, res);
};
const errorImgTamano = (req, res) => {
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
};
const mostrarErrorExtensionesValidas = (extensionArchivo) => {
  // Solo estas extensiones son admitidas.
  const extensionesValidas = ["png", "jpg", "jpeg"];
  if (extensionesValidas.indexOf(extensionArchivo) < 0) {
    return res.status(400).json({
      ok: false,
      mensaje: "Extension no valida.",
      errors: {
        message: "Las extensiones validas son " + extensionesValidas.join(", "),
      },
    });
  }
};
const mostrarError = (res, mensaje, codigo) => {
    // El usuario no envio un tipo valido.
    return res.status(codigo).json({
      ok: false,
      mensaje: mensaje,
    });
}
/* FUNCIONES */
const saberNombreImg = (obj = {}) => {
  let img = "";
  if (obj.img) {
    img = imagen.img;
  }
  if (obj.pictureM) {
    img = imagen.pictureM;
  }
  return img;
};
// Mover el archivo del temporal a un path.
const subirArchivoAlServer = (path, archivo, res) => {
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
const eliminarImgLocalServer = (pathViejo) => {
  // Si existe, elimina la imagen anterior
  if (fs.existsSync(pathViejo)) {
    fs.unlink(pathViejo, (error) => {
      if (error) {
        console.log(error);
      }
    });
  }
};
/**
 * 
 * @param {
 *  idImage:        number;
    nameImage:      string;
    mainImage:      boolean;
    isVisible:      boolean;
    createdAt:      Date;
    updatedAt:      Date;
    idMedicamentoF: number;
    idUserF:        number;
  } objImagen 
 * @returns string
 */
const saberTipoDesdeObjImagen = (objImagen = {}) => {
  let tipo = "";
  if (objImagen.idMedicamentoF) {
    tipo = "medicines";
  }
  if (objImagen.idUserF) {
    tipo = "users";
  }
  return tipo;
};
/**
 *
 * @param {
 * nameImage : string
 * mainImage : boolean
 * id : number,
 * res : Response obj.
 * tipo : string
 * } guardarImgNuevaEnBD
 * @returns
 */
const guardarImgNuevaEnBD = async (obj) => {
  const { nameImage, mainImage, id, res, tipo } = obj;
  if (nameImage && isBoolean(mainImage)) {
    const imageToCreate = {
      nameImage,
      mainImage,
      idMedicamentoF: tipo === "medicines" ? id : null,
      idUserF: tipo === "users" ? id : null,
    };
    try {
      // Es la imagen principal ?
      if (mainImage === "true") {
        await guardarImgPrincipalEnElModelo(obj);
      }
      const image = await Image.create(imageToCreate);
      return res.status(200).json({
        ok: true,
        image,
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
      msg: "Verificar el nameImage y el mainImage",
    });
  }
};

const guardarImgPrincipalEnElModelo = async (obj) => {
  const { nameImage, id, res, tipo } = obj;
  // console.log("tipo ", tipo);
  // console.log("nameImage ", nameImage);
  const model = saberTipo(tipo);
  try {
    let objFilter = {};
    if(model === User){
      objFilter = {
        idUserF: id
      }
    }
    if(model === Medicamento){
      objFilter = {
        idMedicamentoF: id
      }
    }
    // Editar las demas fotos que tengan main como true, cambiarlas por false.
    const array = await Image.findAll({
      where: objFilter
    });
    array.forEach(element => {
      element.mainImage = false;
      element.save();
    });
    console.log("array ", JSON.stringify(array));
    // Buscar el modelo.
    const busqueda = await model.findByPk(id);
    console.log("busqueda ", JSON.stringify(busqueda));
    if(tipo === "medicines"){
      busqueda.pictureM = nameImage;
    }
    if(tipo === "users"){
      busqueda.img = nameImage;
    }
    const resultado = await busqueda.save();
    if (!resultado) {
      console.log("resultado ", resultado);
      mostrarError(res, "No se pudo guardar", 400);
    }
  } catch (error) {
    console.log(error);
    mostrarError(res, "Internal server error", 500);
  }
};
/**
 * Regresa un objeto model o null si no es user o medicines
 * @param tipo : string
 * @returns Model | null
 */
const saberTipo = (tipo) => {
  if (tipo === "medicines") {
    return Medicamento;
  }
  if (tipo === "users") {
    return User;
  }
  return null;
};

const imageController = {
  crearImagen,
  getImagesBy,
  subirArchivoAlServer,
  editarImagen,
  eliminarImagen,
  editarImgPrincipal
};
module.exports = { imageController };
