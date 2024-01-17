import express from "express";
const testing = express.Router();
export default testing;

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
  for (let i = 0; i < req.body.length; i++) {
    objectArray.push({
      num: req.body[i].num,
      words: req.body[i].words,
      booleano: req.body[i].booleano,
    });
  }
  res.end();
});

testing.patch("/:index", (req, res) => {
  let index = parseInt(req.params.index);

  console.log(req.body[index]);

  let patchNum = req.body.num;
  let patchWords = req.body.words;
  let patchBool = req.body.booleano;

  topatch = objectArray[index];
  topatch.num = parseFloat(patchNum);
  topatch.words = patchWords;
  topatch.booleano = patchBool;

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
