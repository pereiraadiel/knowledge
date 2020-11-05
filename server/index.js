const express = require('express');
const app = express();
const consign = require('consign');
const db = require('./config/db');
app.db = db;

consign()
  .then('./config/middlewares.js')
  .then('./utils')
  .then('./controllers')
  .then('./config/routes.js')
  .into(app);

app.listen(process.env.PORT || 3333, () => {
  console.log("server running...");
});