import express from "express";
import testing from "./crud.js";

var app = express();
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

const port = process.env.port;

app.listen(port, () => {
  console.log(`Example router listening on port ${port}`);
});

app.use("/task2", testing);
