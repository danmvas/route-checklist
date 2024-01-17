import express from "express";
import crud from "./crud.js";

const app = express();

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(function (req, res, next) {
  console.log(req.method + " " + req.url + " " + JSON.stringify(req.body));
  next();
});

app.listen(process.env.port_api, () => {
  console.log(`Servidor iniciado na porta: ${process.env.port_api}`);
});

app.use("/routes", crud);
