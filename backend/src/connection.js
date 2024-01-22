import mysql from "mysql";

console.log(
  process.env.host +
    " " +
    process.env.username +
    " " +
    process.env.password +
    " " +
    process.env.database +
    " "
);

const connection = mysql.createConnection({
  host: process.env.host,
  user: process.env.username,
  port: process.env.port_mysql,
  password: process.env.password,
  database: process.env.database,
});

connection.connect((err) => {
  if (err) throw err;
  console.log("Conectado com sucesso na MySQL database");
});

connection.query(`CREATE TABLE IF NOT EXISTS route_checklist_dan.routes (
    id INT NOT NULL AUTO_INCREMENT,
    name VARCHAR(100) NULL,
    checked TINYINT(1) NOT NULL,
    lat FLOAT NOT NULL,
    lng FLOAT NOT NULL,
    PRIMARY KEY (id));`);

export default connection;
