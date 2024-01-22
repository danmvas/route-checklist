import express from "express";
import connection from "./connection.js";
const routes = express.Router();
export default routes;

routes.get("/", (req, res) => {
  const sql = "SELECT * FROM routes";

  connection.query(sql, (err, results) => {
    if (err) {
      res.json("Método GET executado com erro");
      throw err;
    }
    res.json(results);
  });
});

routes.get("/:id", (req, res) => {
  const { id } = req.params;
  const sql = `SELECT * FROM routes WHERE id = ?`;

  connection.query(sql, [id], (err, results) => {
    if (err) {
      res.json("Método GET executado com erro");
      throw err;
    }
    res.json(results);
  });
});

routes.post("/", (req, res) => {
  const { name, checked, lat, lng } = req.body;
  const sql = `INSERT INTO routes (name, checked, lat, lng) VALUE (?, ?, ?, ?)`;
  console.log(sql);

  connection.query(sql, [name, checked, lat, lng], (err) => {
    if (err) {
      res.json("Método POST executado com erro");
      throw err;
    }
    res.json("Rota criada com sucesso");
  });
});

routes.patch("/:id", (req, res) => {
  const { name, checked, lat, lng } = req.body;

  const { id } = req.params;

  const sql = `UPDATE routes SET name = ?, checked = ?, lat = ?, lng = ? WHERE id = ?`;

  connection.query(sql, [name, checked, lat, lng, id], (err) => {
    if (err) {
      res.json("Método PATCH executado com erro");
      throw err;
    }
    res.json("Patch feito com sucesso");
  });
});

routes.delete("/:id", (req, res) => {
  const { id } = req.params;
  const sql = `DELETE FROM routes WHERE id = ?`;

  connection.query(sql, [id], (err) => {
    if (err) {
      res.json("Método DELETE executado com erro");
      throw err;
    }
    res.json("Excluído com sucesso");
  });
});

routes.delete("/", (req, res) => {
  const sql = `DELETE FROM routes`;

  connection.query(sql, (err) => {
    if (err) {
      res.json("Método DELETE executado com erro");
      throw err;
    }
    res.json("Excluído com sucesso");
  });
});
