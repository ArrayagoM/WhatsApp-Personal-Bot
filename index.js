require("dotenv").config();
const app = require("./src/server");
const port = process.env.PORT || 5300;

app.listen(port, () => {
  console.log(`Servidor corriendo en http://localhost:${port}`);
});
