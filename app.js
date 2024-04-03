const express = require("express");
const app = express();
const port = 8001;

app.use(express.json());
app.use(express.urlencoded()); //agar bisa membaca json html

app.set('view engine', 'ejs'); //view engine

const v1Router = require('./routes/v1/index.js');
app.use('/v1', v1Router);
const swaggerUI = require("swagger-ui-express");
const yaml = require("yaml");
const fs = require("fs");
const file = fs.readFileSync("./api-docs.yaml", "utf-8");
const swaggerDocument = yaml.parse(file);

app.use("/v1/api-docs", swaggerUI.serve, swaggerUI.setup(swaggerDocument));
//applisten
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
  });
  