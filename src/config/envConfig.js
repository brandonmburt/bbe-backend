/* Change depending on environment */
const env = 'prod'; // dev or prod

exports.getConfig = function () {
    if (env === 'dev') {
        return {
            DB_USER: process.env.DB_USER,
            DB_HOST: process.env.DB_HOST,
            DB_NAME: process.env.DB_NAME,
            DB_PASS: process.env.DB_PASS,
            DB_PORT: process.env.DB_PORT,
            ACCESS_TOKEN_SECRET: process.env.ACCESS_TOKEN_SECRET,
            REFRESH_TOKEN_SECRET: process.env.REFRESH_TOKEN_SECRET,
            ADMIN_OVERRIDE_HASH: process.env.ADMIN_OVERRIDE_HASH,
        };
    } else if (env === 'prod') {
        const secrets = JSON.parse(process.env.BBE_VARS ?? '{}');
        return {
            DB_USER: secrets.DB_USER,
            DB_HOST: secrets.DB_HOST,
            DB_NAME: secrets.DB_NAME,
            DB_PASS: secrets.DB_PASS,
            DB_PORT: secrets.DB_PORT,
            ACCESS_TOKEN_SECRET: secrets.ACCESS_TOKEN_SECRET,
            REFRESH_TOKEN_SECRET: secrets.REFRESH_TOKEN_SECRET,
            ADMIN_OVERRIDE_HASH: secrets.ADMIN_OVERRIDE_HASH,
        };
    } else return {};
}