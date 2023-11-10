require('dotenv').config();

module.exports = {

  development: {
    username: 'root',
    password: process.env.SEQUELIZE_PASSWORD,
    database: 'nodebirdss',
    host: '127.0.0.1',
    dialect: 'mysql',
  },
  test: {
    username: 'root',
    password: process.env.SEQUELIZE_PASSWORD,
    database: 'nodebirdss_test',
    host: '127.0.0.1',
    dialect: 'mysql',
  },
  production: {
    username: 'root',
    password: process.env.SEQUELIZE_PASSWORD,
    database: 'nodebirdss',
    host: '127.0.0.1',
    dialect: 'mysql',
    logging:false,
  }
}


