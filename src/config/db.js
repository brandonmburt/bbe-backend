const { Pool } = require('pg');
const { getConfig } = require('./envConfig');
const config = getConfig();

const pool = new Pool({
    user: config.DB_USER,
    host: config.DB_HOST,
    database: config.DB_NAME,
    password: config.DB_PASS,
    port: config.DB_PORT,
});

module.exports = pool;