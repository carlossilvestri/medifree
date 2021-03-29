/**
 * third party libraries
 */
const bodyParser = require('body-parser');
const express = require('express');
const helmet = require('helmet');
const http = require('http');
// const mapRoutes = require('express-routes-mapper');
const cors = require('cors');
require('dotenv').config({ path: 'variables.env' });
const routes = require('../config/routes/publicRoutes');
const fileUpload = require("express-fileupload");
/**
 * server configuration
 */
const config = require('../config/');
const dbService = require('./services/db.service');
// const auth = require('./policies/auth.policy');

// environment: development, staging, testing, production
const environment = process.env.NODE_ENV;

/**
 * express application
 */
const app = express();
const server = http.Server(app);
// const mappedOpenRoutes = mapRoutes(config.publicRoutes, 'api/controllers/');
// const mappedAuthRoutes = mapRoutes(config.privateRoutes, 'api/controllers/');
const DB = dbService(environment, config.migrate).start();

// allow cross origin requests
// configure to only allow requests from certain origins
// app.use(cors());
// CORS
app.use(function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  res.header("Access-Control-Allow-Methods", "POST, GET, PUT, DELETE, OPTIONS");
  next();
});
// secure express app
// app.use(helmet({
//   dnsPrefetchControl: false,
//   frameguard: false,
//   ieNoOpen: false,
// }));

// parsing the request bodys
app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(bodyParser.json());
/* Limites del size de los archivos. */
// 2097152 bytes = 2mb
app.use(fileUpload({
  limits: {
      fileSize: 2097152
  },
  useTempFiles : true
}));
// secure your private routes with jwt authentication middleware
// app.all('/private/*', (req, res, next) => auth(req, res, next));

// fill routes for express application
// app.use('/public', mappedOpenRoutes);
// app.use('/private', mappedAuthRoutes);
app.use('/', routes());

// app.use(cors(corsOption));

//Rutas de la app.
app.use('/', routes());

const host = process.env.HOST || process.env.BD_HOST || '0.0.0.0';
const port = process.env.PORT || process.env.BD_PORT || 2017;


app.listen(port, host, () => {
  if (environment !== 'production' &&
    environment !== 'development' &&
    environment !== 'testing'
  ) {
    console.error(`NODE_ENV is set to ${environment}, but only production and development are valid.`);
    // process.exit(1);
  }
  return DB;
});
