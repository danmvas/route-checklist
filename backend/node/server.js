const http = require("node:http");
const fs = require("node:fs");
const { parse } = require("node:querystring");

const hostname = "127.0.0.1";
const port = 3000;

// var dataint = 5;

fs.readFile("f.txt", "utf8", (err, data) => {
  if (err) {
    console.log(err);
    return;
  }
  dataint = parseInt(data);
  dataint += 1;
  fs.writeFile("f.txt", dataint.toString(), (err) => {
    if (err) {
      console.error(err);
    }
  });
});

const server = http.createServer((req, res) => {
  res.statusCode = 200;
  res.setHeader("Content-Type", "text/plain");
  res.end("Hello World!\n");
  fs.readFile("f.txt", "utf8", (err, data) => {
    if (err) {
      console.log(err);
      return;
    }
    console.log(data);
  });
});

server.listen(port, hostname, () => {
  console.log(`Server running at http://${hostname}:${port}/`);
});
