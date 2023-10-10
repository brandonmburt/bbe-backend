const { TEAM_ABBREVIATIONS } = require('../constants/teams');
/*
* Accepts an ADP object and generates a manual player id
* Regular expression removes all whitespace and special characters
* Manual player id is used to compare player ADPs against different exposure types
*/
const generateManualPlayerId = (adpRowData) => {
    return [
        adpRowData.getVal('firstName'),
        adpRowData.getVal('lastName').split(' ')[0], // Hacky way to remove extensions like Jr. and III
        adpRowData.getVal('slotName'),
        TEAM_ABBREVIATIONS[adpRowData.getVal('teamName')]
    ].map(str => str.replace(/[\s!"#$%&'()*+,-./:;<=>?@[\\\]^_`{|}~]/g, '').toLowerCase()).join('-');
}

// playerRows: array of player rows from the database
// uploadedData: AdpRow[] - array of AdpRow objects representing the uploaded csv data
const getPlayersToInsert = (playerRows, uploadedData) => {
    
    let playersInDatabase = playerRows && playerRows.length > 0 ? new Set([...playerRows.map(row => row.id)]) : new Set();
    const playersToInsert = [];
    uploadedData.forEach(row => {
        if (!playersInDatabase.has(row.getVal('id'))) {
            const id = row.getVal('id');
            const firstName = row.getVal('firstName');
            const lastName = row.getVal('lastName');
            const team = TEAM_ABBREVIATIONS[row.getVal('teamName')];
            const pos = row.getVal('slotName');
            const manualPlayerId = generateManualPlayerId(row);
    
            playersToInsert.push([id, `${firstName} ${lastName}`, firstName, lastName, pos, team, manualPlayerId]);
            playersInDatabase.add(id);
        }
    })
    return playersToInsert;
}

module.exports = {
    getPlayersToInsert,
    generateManualPlayerId,
};