import express from "express";
import crud from "./crud.js";

const app = express();

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.listen(process.env.port_api, () => {
  console.log(`Servidor iniciado na porta: ${process.env.port_api}`);
});

app.use("/routes", crud);
