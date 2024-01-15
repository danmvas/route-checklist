const express = require("express");
const testing = express.Router();

let object = [
  {
    number: int,
    words: string,
  },
];

testing.get("/", function (req, res) {
  res.send(`${(number = number + 1)}`);
});

testing.post("/", function (req, res) {
  number = parseInt(req.query["number"]);
  //   number = parseInt(req.params[0]);
  res.end();
});

testing.put("/user", function (req, res) {
  res.send("Got a PUT request at /user");
});

testing.delete("/user", function (req, res) {
  res.send("Got a DELETE request at /user");
});

module.exports = testing;
