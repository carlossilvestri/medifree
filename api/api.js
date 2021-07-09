/**
 * third party libraries
 */
 const express = require("express");
 const helmet = require("helmet");
 const fs = require("fs");
 const path = require("path");
 const https = require("https");
 // const mapRoutes = require('express-routes-mapper');
 const cors = require("cors");
 require("dotenv").config({ path: "variables.env" });
 const routes = require("../config/routes/publicRoutes");
 const fileUpload = require("express-fileupload");
 /**
  * server configuration
  */
 const config = require("../config/");
 const dbService = require("./services/db.service");
 
 
 // environment: development, staging, testing, production
 const environment = process.env.NODE_ENV;
 
 /**
  * express application
  */
 const app = express();
 //Habilitar Pug como Template Engine.
 app.set('view engine', 'pug');
 //Donde cargar los archivos estaticos:
 app.use(express.static('views'));
 const DB = dbService(environment, config.migrate).start();
 
 // CORS
 app.use(function (req, res, next) {
   res.header("Access-Control-Allow-Origin", "*");
   res.header(
     "Access-Control-Allow-Headers",
     "Origin, X-Requested-With, Content-Type, Accept"
   );
   res.header("Access-Control-Allow-Methods", "POST, GET, PUT, DELETE, OPTIONS, PATCH");
   next();
 });
 
 // parsing the request bodys
 /*app.use(bodyParser.urlencoded({
   extended: true
 }));
 app.use(bodyParser.json());*/
 /* Limites del size de los archivos. */
 // 2097152 bytes = 2mb
 app.use(
   fileUpload({
     limits: {
       fileSize: 2097152,
     },
     useTempFiles: true,
   })
 );
 app.use(express.json());
 app.use(express.urlencoded({
   extended: true
 }));
 
 //Rutas de la app.
 app.use("/", routes());
 
 const host = process.env.HOST || "0.0.0.0";
 const port = process.env.PORT || 2017;


 const sslServer = https.createServer({
   key: fs.readFileSync(path.join(__dirname,'certficates/ca182_e0deb_4ad51dabd8b0ba3c783265c1f1b26487.key')),
   cert: fs.readFileSync(path.join(__dirname,'certficates/medifree_site_ca182_e0deb_1632873599_91b434893f1a547fe27049c7c481f839.crt')),
 }, app);

if(environment == "development"){
  app.listen(port, host, () => {
    if (
      environment !== "production" &&
      environment !== "development" &&
      environment !== "testing"
    ) {
      console.error(
        `NODE_ENV is set to ${environment}, but only production and development are valid.`
      );
      // process.exit(1);
    }
    console.log(
      `El servidor funciona en el puerto ${port} y en el host ${host} `
    );
    return DB;
  });
}else{
  sslServer.listen(port, host, () => {
    if (
      environment !== "production" &&
      environment !== "development" &&
      environment !== "testing"
    ) {
      console.error(
        `NODE_ENV is set to ${environment}, but only production and development are valid.`
      );
      // process.exit(1);
    }
    console.log(
      `El servidor funciona en el puerto ${port} y en el host ${host} `
    );
    return DB;
  });
}
 