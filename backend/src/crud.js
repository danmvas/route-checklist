import express from "express";
import connection from "./connection.js";
const routes = express.Router();
export default routes;

routes.get("/", (req, res) => {
  const sql = "SELECT * FROM routes";

  connection.query(sql, (err, results) => {
    if (err) throw err;
    res.json(results);
  });
});

routes.get("/:id", (req, res) => {
  const { id } = req.params;
  const sql = `SELECT * FROM routes WHERE id = ?`;

  connection.query(sql, [id], (err, results) => {
    if (err) throw err;
    res.json(results);
  });
});

routes.post("/", (req, res) => {
  const { name, checked, lat, lng } = req.body;
  const sql = `INSERT INTO routes (name, checked, lat, lng) VALUE (?, ?, ?, ?)`;

  connection.query(sql, [name, checked, lat, lng], (err, results) => {
    if (err) throw err;

    res.json(results.insertId);
  });
});

routes.patch("/:id", (req, res) => {
  const { id } = req.params;

  let sql = `UPDATE routes SET ? WHERE id=?;`;

  connection.query(sql, [req.body, id], (err) => {
    if (err) throw err;
    res.json("Patch feito com sucesso");
  });
});

routes.delete("/:id", (req, res) => {
  const { id } = req.params;
  const sql = `DELETE FROM routes WHERE id = ?`;

  connection.query(sql, [id], (err) => {
    if (err) throw err;
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
