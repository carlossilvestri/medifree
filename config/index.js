const privateRoutes = require('./routes/privateRoutes');
const publicRoutes = require('./routes/publicRoutes');
require('dotenv').config({ path: 'variables.env' });
const config = {
  migrate: false,
  privateRoutes,
  publicRoutes,
  port: process.env.BD_PORT || '2017',
};

module.exports = config;
