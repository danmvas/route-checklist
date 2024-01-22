import express from "express";
import crud from "./crud.js";
import expressWs from "express-ws";

const app = express();
const wsInstance = expressWs(app);

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(function (req, res, next) {
  console.log(req.method + " " + req.url + " " + JSON.stringify(req.body));
  next();
});

export function broadcastWs(message) {
  wsInstance.getWss().clients.forEach((clientWs) => {
    clientWs.send(JSON.stringify(message));
  });
}

app.ws("/routes/ws", (ws, req) => {
  ws.on("message", (msg) => {
    console.log(msg);
  });
  ws.on("close", () => {
    console.log("Cliente desconectando ...");
    // clearInterval(interval);
  });
  // const interval = setInterval(() => {
  //   ws.send("Mensagem");
  // }, 1000);
});

app.listen(process.env.port_api, () => {
  console.log(`Servidor iniciado na porta: ${process.env.port_api}`);
});

app.use("/routes", crud);
