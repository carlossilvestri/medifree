/*
Params: user = {}, idQR = Number.
Devuelve un booleano.
Si no le pertenece idQR al usuario del token. Simplemente lo demas no se ejecutara.
*/
exports.lePerteneceElToken = async (user = "", id = "", model = "") => {
    if (user == "" || id == "" || model == "") {
      return false;
    }
    /*console.log("typeof id ", typeof id);
    console.log("id ", id);*/
    // if(typeof id == 'object'){}
    /* Buscar la pregunta de seguridad. */
    // Obtener la pregunta
    try {
      // Existe la pregunta?
      const resultado = await model.findByPk(id);
      /*console.log("resultado ", resultado);
      console.log("resultado.idUsuarioF ", resultado.idUsuarioF);*/
      if (!resultado) {
        return false;
      } else {
        /* Preguntar si el id no le pertenece al usuario del token */
        if(resultado.idUser){
          // console.log('Resultado ', resultado);
            if(resultado.idUser == user.idUser){
              return true;  
            }else{
                return false;
            }
        }
        if(resultado.idUsuarioF){
            if (resultado.idUsuarioF != user.idUser) {
                return false;
              } else {
                // Si le pertenece.
                return true;
              }
        }
      }
    } catch (error) {
      console.log("En lePerteneceElToken function ", error);
      return false;
    }
  }
exports.stringToBoolean =  (string) => {
  switch(string.toLowerCase().trim()){
      case "true": case "yes": case "1": return true;
      case "false": case "no": case "0": case null: return false;
      default: return Boolean(string);
  }
}