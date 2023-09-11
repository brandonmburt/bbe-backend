const { EXPOSURE_TYPES } = require('../constants/types');
const dbModel = require('../models/dbModel');

exports.getADPs = async function (req, res) {

    try {
        const { rows } = await dbModel.getADPs();
        
        if (rows.length === 0) {
            throw new Error('No ADP data found');
        } else {
            let adpData = {};
            rows.forEach(row => {
                const { adps, type } = row;
                if (EXPOSURE_TYPES.includes(type)) {
                    adpData[type] = adps;
                }
            })
            res.status(200).json(adpData);
        }
    } catch (error) {
        res.status(500).send('Error: Unable to fetch ADPs', error);
    }

}