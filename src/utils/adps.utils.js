/**
 * Logic for determining whether or not to include a given exposure type in the response
 * @param {string} type  - exposure type
 * @param {object[]} exposureRows - array of exposure rows for the user
 * @returns {boolean} - true if the exposure type should be included in the response
 */
const shouldIncludeExposureType = (type, exposureRows) => {
    if (type === '2023resurrection') {
        return exposureRows.some(exposureRow => exposureRow.type === '2023season' || exposureRow.type === '2023resurrection');
    } else {
        return exposureRows.some(exposureRow => exposureRow.type === type);
    }
}

/**
 * Retrieve all drafted players relevant to the given exposure type
 * @param {string} type - exposure type
 * @param {obj[]} exposureRows - array of exposure rows for the user
 * @returns {obj[]} - array of drafted players for the given exposure type
 */
const getDraftedPlayersForExposureType = (type, exposureRows) => {
    const { drafted_players } = exposureRows.find(exposureRow => exposureRow.type === type) || { drafted_players: [] };
    /* When type is '2023resurrection', include '2023season' drafted_players in the returned value */
    if (type === '2023resurrection') {
        const {
            drafted_players: additional_drafted_players
        } = exposureRows.find(exposureRow => exposureRow.type === '2023season') || { drafted_players: [] };
        drafted_players.push(...additional_drafted_players);
    }
    return drafted_players;
}

module.exports = {
    shouldIncludeExposureType,
    getDraftedPlayersForExposureType,
};