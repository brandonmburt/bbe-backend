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
    applyReplacementRules,
    sortUploadFileRows,
} = require('../utils/upload-data.utils');
const { EXPOSURE_TYPES } = require('../constants/types');
const { TEAM_ABBREVIATIONS } = require('../constants/teams');

exports.uploadFile = async function (req, res) {

    if (!req.file) return res.status(400).send('No file received');
    if (req.file.mimetype !== 'text/csv') return res.status(400).send(`Invalid file type: ${req.file.mimetype}`);

    const fileContent = req.file.buffer.toString('utf-8');
    const rows = fileContent.split('\n').map(row => row.trim().split(','));
    const { exposureType } = req.body;
    const userId = req.user.id;

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
    sortUploadFileRows(rowData);

    const replacementRules = [];
    try {
        const { rows } = await dbModel.getReplacementRules();
        if (rows.length > 0) replacementRules.push(...rows);
    } catch (error) {
        return res.status(500).send('Unable to fetch relacement rules. Please try again later.');
    }
    if (replacementRules.length > 0) applyReplacementRules(rowData, replacementRules);

    if (rowData.some(row => row.hasError())) {
        return res.status(400).send(`Error . ${rowData.filter(row => row.hasError()).map(row => row.getError()).join(', ')}`); // TODO: Simplify for prod
    }

    // Exposure Data
    try {
        await dbModel.invalidatePreviousExposureData(userId, exposureType);

        const draftSpotJSON = generateDraftSpotJSON(rowData);
        const [numTeamsProcessed, draftedTeamsJSON] = generateDraftedTeamsJSON(rowData);
        const draftedPlayersJSON = generateDraftedPlayersExposureJSON(rowData);
        const posPicksByRoundJSON = generatePositionPicksByRoundJSON(rowData);
        const totalDraftsByDateJSON = generateTotalDraftsByDateJSON(rowData);
        const tournamentsJSON = generateTournamentsJSON(rowData);

        await dbModel.insertExposureData(userId, exposureType, draftSpotJSON, draftedTeamsJSON, draftedPlayersJSON, posPicksByRoundJSON, totalDraftsByDateJSON, tournamentsJSON);

        res.status(200).send('Successfully processed ' + numTeamsProcessed.toString() + ' drafts');
    } catch (error) {
        console.log(error);
        res.status(500).send('Unable to parse exposure data', error);
    }

}

exports.uploadAdpFile = async function (req, res) {

    if (!req.file) return res.status(400).send('No file received');
    if (req.file.mimetype !== 'text/csv') return res.status(400).send(`Invalid file type: ${req.file.mimetype}`);

    const { exposureType } = req.body;
    const userId = req.user.id;

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

    const replacementRules = [];
    try {
        const { rows } = await dbModel.getReplacementRules();
        if (rows.length > 0) replacementRules.push(...rows);
    } catch (error) {
        return res.status(500).send('Unable to fetch relacement rules. Please try again later.');
    }
    if (replacementRules.length > 0) applyReplacementRules(adpRowData, replacementRules);

    if (adpRowData.some(row => row.hasError())) {
        return res.status(400).send(`Error . ${adpRowData.filter(row => row.hasError()).map(row => row.getError()).join(', ')}`); // TODO: Simplify for prod
    }

    let adpArr = adpRowData.map(row => {
        return {
            playerId: row.getPlayerKey(),
            adp: row.getVal('adp'),
            firstName: row.getVal('firstName'),
            lastName: row.getVal('lastName'),
            team: TEAM_ABBREVIATIONS[row.getVal('teamName')],
            pos: row.getVal('slotName'),
            posRank: row.getVal('positionRank'),
            additionalKeys: row.getAdditionalKeys(),
        }
    });

    try {
        await dbModel.invalidatePreviousAdpData(exposureType);
        await dbModel.insertAdpData(adpArr, exposureType);
        return res.status(200).send('Successfully processed new ADP data');
    } catch (error) {
        return res.status(500).send('Inserting ADP data failed: ' +  error);
    }

}
