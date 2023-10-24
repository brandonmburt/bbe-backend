const { EXPOSURE_TYPES } = require('../constants/types');
const dbModel = require('../models/dbModel');
const { shouldIncludeExposureType, getDraftedPlayersForExposureType } = require('../utils/adps.utils');

exports.getADPs = async function (req, res) {

    const userId = req.user.id;
    if (!userId) return res.status(400).send('No user id provided');

    try {
        const { rows } = await dbModel.getADPs();
        const { rows: exposureRows } = await dbModel.getExposureData(userId);
        
        if (rows.length === 0) {
            throw new Error('No ADP data found');
        } else {
            let adpData = {};
            rows.forEach(row => {
                const { adps, type } = row;
                if (EXPOSURE_TYPES.includes(type) && shouldIncludeExposureType(type, exposureRows)) {
                    const adpMap = new Map();
                    adps.forEach(adpObj => {
                        const { playerId, additionalKeys } = adpObj;
                        [playerId, ...additionalKeys].forEach(key => adpMap.set(key, adpObj));
                    });
                    const filteredAdpMap = new Map(); // key: playerKey, value: adpObj
                    const additionalKeysArr = [];
                    const draftedPlayers = getDraftedPlayersForExposureType(type, exposureRows);
                    draftedPlayers.forEach(player => {
                        const { playerId, additionalKeys } = player;
                        if (adpMap.has(playerId)) {
                            filteredAdpMap.set(playerId, adpMap.get(playerId));
                        } else {
                            for (let i=0; i<additionalKeys.length; i++) {
                                let key = additionalKeys[i];
                                if (adpMap.has(key)) {
                                    filteredAdpMap.set(playerId, adpMap.get(key) );
                                    additionalKeysArr.push([key, adpMap.get(key).playerId]);
                                    break;
                                }
                            }
                        }
                    })
                    adpData[type] = { adps: [...filteredAdpMap.values()], additionalKeysArr };
                }
            })
            res.status(200).json(JSON.stringify(adpData));
        }
    } catch (error) {
        res.status(500).send('Error: Unable to fetch ADPs. ' + error.message);
    }

}