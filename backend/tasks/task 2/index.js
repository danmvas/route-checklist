var crud = require("./crud");
var express = require("express");
const bodyParser = require("body-parser");

var app = express();
app.use(express.urlencoded({ extended: true }));
app.use(bodyParser.json());

const port = 3000;

app.listen(port, () => {
  console.log(`Example router listening on port ${port}`);
});

app.use("/task2", crud);
