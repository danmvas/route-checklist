import express from "express";
import crud from "./crud.js";

var app = express();
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

const port = process.env.port;

app.listen(port, () => {
  console.log(`Servidor iniciado na porta: ${port}`);
});

app.use("/routes", crud);
