const { TEAM_ABBREVIATIONS } = require('../constants/teams');

// playerRows: array of player rows from the database
// uploadedData: AdpRow[] - array of AdpRow objects representing the uploaded csv data
const getPlayersToInsert = (playerRows, uploadedData) => {
    
    let playersInDatabase = playerRows ? new Set([...playerRows.map(row => row.id)]) : new Set();
    const playersToInsert = [];
    uploadedData.forEach(row => {
        if (!playersInDatabase.has(row.getVal('id'))) {
            const id = row.getVal('id');
            const firstName = row.getVal('firstName');
            const lastName = row.getVal('lastName');
            const team = TEAM_ABBREVIATIONS[row.getVal('teamName')];
            const pos = row.getVal('slotName');
    
            playersToInsert.push([id, `${firstName} ${lastName}`, firstName, lastName, pos, team]);
            playersInDatabase.add(id);
        }
    })
    return playersToInsert;
}

module.exports = {
    getPlayersToInsert,
};