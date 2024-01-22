import express from "express";
import connection from "./connection.js";
import { broadcastWs } from "./index.js";
const routes = express.Router();
export default routes;

// GET all
routes.get("/", (req, res) => {
  const sql = "SELECT * FROM routes";

  connection.query(sql, (err, results) => {
    if (err) throw err;

    res.json(results);
    broadcastWs([req.method, results]);
  });
});

// GET from id
routes.get("/:id", (req, res) => {
  const { id } = req.params;
  const sql = `SELECT * FROM routes WHERE id = ?`;

  connection.query(sql, [id], (err, results) => {
    if (err) throw err;

    res.json(results);
    broadcastWs([req.method, id, JSON.stringify(req.body)]);
  });
});

// POST object
routes.post("/", (req, res) => {
  const { name, checked, lat, lng } = req.body;
  const sql = `INSERT INTO routes (name, checked, lat, lng) VALUE (?, ?, ?, ?)`;

  connection.query(sql, [name, checked, lat, lng], (err, results) => {
    if (err) throw err;

    res.json(results.insertId);
    broadcastWs([req.method, results.insertId, JSON.stringify(req.body)]);
  });
});

// PATCH from id
routes.patch("/:id", (req, res) => {
  const { id } = req.params;

  let sql = `UPDATE routes SET ? WHERE id=?;`;

  connection.query(sql, [req.body, id], (err) => {
    if (err) throw err;

    res.json("Patch feito com sucesso");
    broadcastWs([req.method, id, JSON.stringify(req.body)]);
  });
});

// DELETE from id
routes.delete("/:id", (req, res) => {
  const { id } = req.params;
  const sql = `DELETE FROM routes WHERE id = ?`;

  connection.query(sql, [id], (err) => {
    if (err) throw err;

    res.json("Excluído com sucesso");
    broadcastWs([req.method, id]);
  });
});

// DELETE all
routes.delete("/", (req, res) => {
  const sql = `DELETE FROM routes`;

  connection.query(sql, (err) => {
    if (err) throw err;

    res.json("Excluído com sucesso");
    broadcastWs([req.method]);
  });
});
