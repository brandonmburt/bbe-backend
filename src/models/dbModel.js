const db = require('../config/db');
const { generatePlaceholderString, generateColumnsString } = require('../utils/query.utils');
const { playerColumns, exposureDataColumns, adpDataColumns, userCreationColumns } = require('../constants/columns');

function getAllPlayers() {
    return db.query('SELECT * FROM uf.players');
}

/* INSERT INTO uf.users(email, password, first_name, last_name) VALUES (?, ?, ?, ?); */
function insertNewUser(user) {
    const query = `INSERT INTO uf.users ${generateColumnsString(userCreationColumns)} VALUES ${generatePlaceholderString(userCreationColumns.length, 1)}`;
    return db.query(query, [user.email, user.hashedPassword, user.firstName, user.lastName]);
}

function getUserByEmail(email) {
    const query = 'SELECT id, email, password, role FROM uf.users WHERE active = $1 AND email = $2 LIMIT 1;'
    return db.query(query, [true, email]);
}

function insertPlayers(playersArr) {
    let columnsString = generateColumnsString(playerColumns);
    let placeholderString = generatePlaceholderString(playerColumns.length, playersArr.length);
    const playerQuery = `INSERT INTO uf.players ${columnsString} VALUES ${placeholderString}`;
    return db.query(playerQuery, playersArr.flat());
}

function invalidatePreviousExposureData(userId, exposureType) {
    const updateQuery = `UPDATE uf.exposure_data SET active = $1 WHERE user_id = $2 AND active = $3 AND type = $4;`;
    return db.query(updateQuery, [false, userId, true, exposureType]);
}

function invalidatePreviousAdpData(type) {
    const updateQuery = ` UPDATE uf.adp_data SET active = $1 WHERE active = $2 AND type = $3;`;
    return db.query(updateQuery, [false, true, type]);
}

function insertExposureData(userId, type, draftSpotJSON, draftedTeamsJSON, draftedPlayersJSON, posPicksByRoundJSON, totalDraftsByDateJSON, tournamentsJSON) {
    const query = `INSERT INTO uf.exposure_data ${generateColumnsString(exposureDataColumns)} VALUES ${generatePlaceholderString(exposureDataColumns.length, 1)}`;
    return db.query(query, [userId, type, draftSpotJSON, draftedTeamsJSON, draftedPlayersJSON, posPicksByRoundJSON, totalDraftsByDateJSON, tournamentsJSON]);
}

function insertAdpData(arr, type) {
    const query = `INSERT INTO uf.adp_data ${generateColumnsString(adpDataColumns)} VALUES ${generatePlaceholderString(adpDataColumns.length, 1)}`;
    return db.query(query, [JSON.stringify(arr), type]);
}

function getADPs() {
    return db.query('SELECT * FROM uf.adp_data WHERE active = $1', [true]);
}

function getExposureData(userId) {
    return db.query('SELECT * FROM uf.exposure_data WHERE user_id = $1 AND active = $2', [userId, true]);
}

function invalidatePreviousRefreshTokens(userId) {
    return db.query('UPDATE uf.refresh_tokens SET active = $1 WHERE user_id = $2 AND active = $3', [false, userId, true]);
}

function insertRefreshToken(token, userId) {
    return db.query('INSERT INTO uf.refresh_tokens (token, user_id) VALUES ($1, $2)', [token, userId]);
}

function getRefreshToken(token) {
    return db.query('SELECT * FROM uf.refresh_tokens WHERE token = $1 AND active = $2', [token, true]);
}

function deleteRefreshToken(token) {
    return db.query('UPDATE uf.refresh_tokens SET active = $1 WHERE token = $2', [false, token]);
}

function deleteExposureData(userId, exposureType) {
    return db.query('UPDATE uf.exposure_data SET active = $1 WHERE user_id = $2 AND type = $3 AND active = $4', [false, userId, exposureType, true]);
}

module.exports = {
    getAllPlayers,
    insertNewUser,
    getUserByEmail,
    insertPlayers,
    invalidatePreviousExposureData,
    invalidatePreviousAdpData,
    insertExposureData,
    getADPs,
    getExposureData,
    insertAdpData,
    invalidatePreviousRefreshTokens,
    insertRefreshToken,
    getRefreshToken,
    deleteRefreshToken,
    deleteExposureData,
};