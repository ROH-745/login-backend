const { Sequelize } = require("sequelize");


const sequelize = new Sequelize("mysql", "root", "sandra", {
  host: "localhost",
  dialect: "mysql",
  dialectModule: require("mysql2")
});

module.exports = sequelize;