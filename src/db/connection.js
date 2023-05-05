const knex = require('knex')({
  client: 'pg',
  connection: {
    host: process.env.KNEXHOST,
    port: process.env.KNEXPORT,
    user: process.env.KNEXUSER,
    password: process.env.KNEXPASSWORD,
    database: process.env.KNEXDB,
  },
});

module.exports = knex;
