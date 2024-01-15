const express = require("express");
const bodyParser = require("body-parser");
const testing = express.Router();

let object = [
  {
    num: 0,
    words: "",
    booleano: true,
  },
];

const objectArray = [];

testing.get("/", function (req, res) {
  res.json(objectArray);
  res.end();
});

testing.post("/", function (req, res) {
  b = stringToBool(req.query["booleano"]);
  objectArray.push({
    num: parseFloat(req.query["num"]),
    words: req.query["words"],
    booleano: b,
  });
  res.end();
});

testing.patch("/:index", function (req, res, next) {
  let index = parseInt(req.params.index);
  let body = req.body;

  console.log(body);

  //   console.log(req.body);
  // let patchNum = req.body.num;
  // let patchWords = req.body.words;
  // let patchBool = req.body.booleano;

  // topatch = objectArray[index];
  // topatch.num = parseFloat(patchNum);
  // topatch.words = patchWords;
  // topatch.booleano = stringToBool(patchBool);

  res.end();
});

testing.delete("/:index", function (req, res) {
  const index = parseInt(req.params.index);
  objectArray.splice(index, 1);
  res.end();
});

function stringToBool(str) {
  str = str.toLowerCase();
  str == "true" ? (boolToSend = true) : (boolToSend = false);
  return boolToSend;
}

module.exports = testing;
