const mysql = require("serverless-mysql")({
  config: {
    host: process.env.mysql_host,
    database: process.env.mysql_database,
    user: process.env.mysql_username,
    password: process.env.mysql_password,
    multipleStatements: true,
  },
});
export default mysql;
