var mysql = require("mysql");

var connection = mysql.createConnection({
  host: "localhost",
  database: "replies",
  user: "root",
  password: "root",
});

module.exports = connection;
