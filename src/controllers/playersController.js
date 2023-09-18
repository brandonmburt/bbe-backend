const dbModel = require('../models/dbModel');

exports.getAllPlayers = async function (req, res) {

    let userId = req.user.id;

    try {
        const { rows: playersRows } = await dbModel.getAllPlayers();
        const { rows: exposureRows } = await dbModel.getExposureData(userId);
        let filteredPlayers = [];

        if (playersRows.length === 0) {
            throw Error('No players found in database');
        } else if (exposureRows.length > 0) {
            const draftedPlayerIDsSet = new Set();
            exposureRows.forEach(row => {
                const { drafted_players: draftedPlayersArr } = row;
                draftedPlayersArr.forEach(player => draftedPlayerIDsSet.add(player.playerId));
            });
            filteredPlayers = playersRows.filter(player => {
                return draftedPlayerIDsSet.has(player.id);
            })
        } 
        res.status(200).json(filteredPlayers);
    } catch (error) {
        res.status(500).send('Error: ', error);
    }

}
