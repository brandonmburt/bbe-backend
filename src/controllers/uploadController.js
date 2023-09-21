const RowData = require('../models/uploadModel');
const AdpRow = require('../models/adpModel');
const { csvColumns, adpCsvColumns } =  require('../constants/csv-columns');
const dbModel = require('../models/dbModel');
const {
    generateDraftSpotJSON,
    generateDraftedTeamsJSON,
    generateDraftedPlayersExposureJSON,
    generatePositionPicksByRoundJSON,
    generateTotalDraftsByDateJSON,
    generateTournamentsJSON,
} = require('../utils/upload-data.utils');
const { getPlayersToInsert } = require('../utils/players.utils');
const { EXPOSURE_TYPES } = require('../constants/types');

exports.uploadFile = async function (req, res) {

    if (!req.file) return res.status(400).send('No file received');
    if (req.file.mimetype !== 'text/csv') return res.status(400).send(`Invalid file type: ${req.file.mimetype}`);

    const fileContent = req.file.buffer.toString('utf-8');
    const rows = fileContent.split('\n').map(row => row.trim().split(','));
    const { userId, exposureType } = req.body;

    if (!userId || !exposureType || rows.length === 0) return res.status(400).send('Missing request info');
    else if (!EXPOSURE_TYPES.includes(exposureType)) return res.status(400).send('Invalid exposure type');
    else {
        let firstRow = rows.shift();
        if (firstRow.length !== csvColumns.length) {
            return res.status(400).send(`Invalid number of columns. Expected ${csvColumns.length}, got ${firstRow.length}`);
        } else if (firstRow.join(',').trim() != csvColumns.map(c => c[0]).join(',').trim()) {
            return res.status(400).send('Invalid headers');
        }
    }

    const rowData = rows.map(row => new RowData(row)); // each row represents a player selection

    if (rowData.some(row => row.hasError())) {
        return res.status(400).send(`Error . ${rowData.filter(row => row.hasError()).map(row => row.getError()).join(', ')}`); // TODO: Simplify for prod
    }

    // Exposure Data
    try {
        await dbModel.invalidatePreviousExposureData(userId, exposureType);

        const draftSpotJSON = generateDraftSpotJSON(rowData);
        const draftedTeamsJSON = generateDraftedTeamsJSON(rowData);
        const draftedPlayersJSON = generateDraftedPlayersExposureJSON(rowData);
        const posPicksByRoundJSON = generatePositionPicksByRoundJSON(rowData);
        const totalDraftsByDateJSON = generateTotalDraftsByDateJSON(rowData);
        const tournamentsJSON = generateTournamentsJSON(rowData);

        await dbModel.insertExposureData(userId, exposureType, draftSpotJSON, draftedTeamsJSON, draftedPlayersJSON, posPicksByRoundJSON, totalDraftsByDateJSON, tournamentsJSON);

        res.status(200).send('Successfully processed file');
    } catch (error) {
        console.log(error);
        res.status(500).send('Unable to parse exposure data', error);
    }

}

exports.uploadAdpFile = async function (req, res) {

    if (!req.file) return res.status(400).send('No file received');
    if (req.file.mimetype !== 'text/csv') return res.status(400).send(`Invalid file type: ${req.file.mimetype}`);

    const { userId, exposureType } = req.body;

    const fileContent = req.file.buffer.toString('utf-8');
    const rows = fileContent.split('\n').map(row => row.trim().split(`\"`).join('').split(','));
    
    let firstRow = rows.shift();
    if (firstRow.length !== adpCsvColumns.length) {
        return res.status(400).send(`Invalid number of columns. Expected ${adpCsvColumns.length}, got ${firstRow.length}`);
    } else if (firstRow.join(',').trim() != adpCsvColumns.map(c => c[0]).join(',').trim()) {
        return res.status(400).send('Invalid headers');
    }

    if (!userId || !exposureType || rows.length === 0) return res.status(400).send('Missing request info');
    else if (!EXPOSURE_TYPES.includes(exposureType)) return res.status(400).send('Invalid exposure type');
    
    const adpRowData = rows.map(row => new AdpRow(row));

    if (adpRowData.some(row => row.hasError())) {
        return res.status(400).send(`Error . ${adpRowData.filter(row => row.hasError()).map(row => row.getError()).join(', ')}`); // TODO: Simplify for prod
    }

    /* Insert new players that don't already exist in the database */
    // TODO: Handle instances when a player changes teams or position
    try {
        const { rows: playerRows }  = await dbModel.getAllPlayers();
        let playersToInsert = getPlayersToInsert(playerRows, adpRowData);
        if (playersToInsert.length > 0) {
            await dbModel.insertPlayers(playersToInsert);
        }
    } catch(error) {
        res.status(500).send('Unable to process players', error);
    }

    let arr = adpRowData.map(row => {
        return {
            player_id: row.getVal('id'),
            adp: row.getVal('adp'),
            posRank: row.getVal('positionRank'),
        }
    });

    try {
        await dbModel.invalidatePreviousAdpData(exposureType);
        await dbModel.insertAdpData(arr, exposureType);
        res.status(200).send('Successfully processed new ADP data');
    } catch (error) {
        res.status(500).send('Inserting ADP data failed', error);
    }

}
