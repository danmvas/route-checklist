var testing = require("./testing");
var express = require("express");
// const dotenv = require("dotenv");

// dotenv.config();

var app = express();
const port = 3000;
// const port = process.env.PORT;

app.listen(port, () => {
  console.log(`Example router listening on port ${port}`);
});

app.use("/testing", testing);
