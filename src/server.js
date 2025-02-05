const express = require("express");

const app = express();

// Ruta de prueba
app.get("/", (req, res) => {
  res.send("¡WhatsApp Personal Bot está en funcionamiento!");
});

module.exports = app;
// Iniciar el servidor
