const dbModel = require('../models/dbModel');

exports.getAllPlayers = async function (req, res) {

    try {
        const { rows: players } = await dbModel.getAllPlayers();
        res.status(200).json(players);
    } catch (error) {
        res.status(500).send('Error: Unable to fetch players', error);
    }

}
