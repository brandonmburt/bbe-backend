const dbModel = require('../models/dbModel');

exports.getAllTournaments = async function (req, res) {

    try {
        const { rows: tournaments } = await dbModel.getAllTournaments();
        res.status(200).json(tournaments);
    } catch (error) {
        res.status(500).send('Error: Unable to fetch tournaments', error);
    }

}