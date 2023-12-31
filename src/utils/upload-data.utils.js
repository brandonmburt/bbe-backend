// arr: RowData[] - array of RowData objects representing the uploaded data
// returns a JSON object containing the draft spot data
const generateDraftSpotJSON = (arr) => {
    const draftSpotJSON = {
        totalNumDrafts: 0,
        totalDollarSum: 0,
        positions: {
            1: { occurences: 0, dollarSum: 0 },
            2: { occurences: 0, dollarSum: 0 },
            3: { occurences: 0, dollarSum: 0 },
            4: { occurences: 0, dollarSum: 0 },
            5: { occurences: 0, dollarSum: 0 },
            6: { occurences: 0, dollarSum: 0 },
            7: { occurences: 0, dollarSum: 0 },
            8: { occurences: 0, dollarSum: 0 },
            9: { occurences: 0, dollarSum: 0 },
            10: { occurences: 0, dollarSum: 0 },
            11: { occurences: 0, dollarSum: 0 },
            12: { occurences: 0, dollarSum: 0 }
        }
    };
    arr.forEach(row => {
        const pickNumber = row.getVal('Pick Number');
        const draftSize = row.getVal('Draft Size');
        if (pickNumber > 12 || draftSize !== 12) return; // TODO: Need to handle when draftsize is not 12
        const entryFee = row.getEntryFee();
        draftSpotJSON.totalNumDrafts++;
        draftSpotJSON.totalDollarSum += entryFee;
        draftSpotJSON.positions[pickNumber].occurences++;
        draftSpotJSON.positions[pickNumber].dollarSum += entryFee;
    });
    return JSON.stringify(draftSpotJSON);
}


// arr: RowData[] - array of RowData objects representing the uploaded data
// returns an array: [number of teams processed, JSON object containing the drafted teams and corresponding data]
const generateDraftedTeamsJSON = (arr) => {
    let draftedTeamsMap = new Map();
    arr.forEach(row => {
        const draftEntry = row.getVal('Draft Entry');
        if (!draftedTeamsMap.has(draftEntry)) {
            draftedTeamsMap.set(draftEntry, {
                firstTimestamp: row.getVal('Picked At'),
                lastTimestamp: row.getVal('Picked At'),
                draftEntry: draftEntry,
                tournamentId: row.getVal('Tournament'),
                weeklyWinnerId: row.getVal('Weekly Winner'),
                draftEntryFee: row.getEntryFee(),
                draftSize: row.getVal('Draft Size'),
                qbs: [], // Array of [pick number, player key, timestamp]
                rbs: [],
                wrs: [],
                tes: [],
            });
        }
        const position = row.getVal('Position');
        if (['QB', 'RB', 'WR', 'TE'].indexOf(position) === -1) {
            // TODO: Throw error and terminate upload process
            console.log('ERROR: Invalid position');
        } else {
            draftedTeamsMap.get(draftEntry)[(position.toLowerCase() + 's')].push(row.getSelectionInfo());
            draftedTeamsMap.get(draftEntry).lastTimestamp = row.getVal('Picked At');
        }
    })

    const INSTANT_DRAFT_MINUTES = 5; // Arbitrary value (5 minutes) used to determine if a draft is instant
    const FAST_DRAFT_MINUTES = 240; // Arbitrary value (4 hours) used to determine if a draft is fast or slow

    let res = [...draftedTeamsMap.values()].map(obj => {
        const d1 = new Date(obj.firstTimestamp), d2 = new Date(obj.lastTimestamp);
        const timeDifferenceMs = d1.getTime() - d2.getTime(); // Calculate the time difference in milliseconds
        const minutesDifference = Math.abs(Math.floor(timeDifferenceMs / (1000 * 60))); // Convert milliseconds to minutes
        const draftType = minutesDifference <= INSTANT_DRAFT_MINUTES ? 'instant' :
            minutesDifference <= FAST_DRAFT_MINUTES ? 'fast' : 'slow';
        let returnObj = {
            draftType,
            ...obj
        }
        delete returnObj['firstTimestamp'];
        delete returnObj['lastTimestamp'];
        return returnObj;
    });

    return [res.length, JSON.stringify(res)];
}


// arr: RowData[] - array of RowData objects representing the uploaded data
// returns a JSON object containing the drafted players and corresponding data
const generateDraftedPlayersExposureJSON = (arr) => {
    let draftedPlayersMap = new Map();
    arr.forEach(row => {
        const playerKey = row.getPlayerKey();
        if (!draftedPlayersMap.has(playerKey)) {
            draftedPlayersMap.set(playerKey, {
                playerId: playerKey,
                name: row.getFullName(),
                team: row.getVal('Team'),
                position: row.getVal('Position'),
                sumEntryFees: 0,
                timesDrafted: 0,
                sumDraftPickNumber: 0, // used to calculate average pick number prior to returning data
                selectionInfo: [], // [pick number, draft entry, timestamp][]
                additionalKeys: row.getAdditionalKeys(),
            });
        }
        draftedPlayersMap.get(playerKey).sumEntryFees += row.getEntryFee();
        draftedPlayersMap.get(playerKey).timesDrafted++;
        draftedPlayersMap.get(playerKey).sumDraftPickNumber += row.getVal('Pick Number');
        draftedPlayersMap.get(playerKey).selectionInfo.push(
            [row.getVal('Pick Number'), row.getVal('Draft Entry'), row.getVal('Picked At')]
        );
    });
    return JSON.stringify([...draftedPlayersMap.values()].map(player => {
        let cleanedObj = {...player};
        cleanedObj.avgPickNumber = cleanedObj.sumDraftPickNumber / cleanedObj.timesDrafted;
        delete cleanedObj.sumDraftPickNumber;
        return cleanedObj;
    }));
}

// arr: RowData[] - array of RowData objects representing the uploaded data
// returns a JSON object containing the quantity of each position picked in each round
const generatePositionPicksByRoundJSON = (arr) => {
    let positionPicksByRoundMap = new Map();
    const maxRound = Math.max(...arr.map(row => Math.ceil(row.getVal('Pick Number') / 12)));
    for (let round=1; round<=maxRound; round++) {
        positionPicksByRoundMap.set(round, { round: round, QB: 0, RB: 0, WR: 0, TE: 0 });
    }
    arr.forEach(row => {
        const position = row.getVal('Position');
        const round = Math.ceil(row.getVal('Pick Number') / 12);
        positionPicksByRoundMap.get(round)[position]++;
    });
    return JSON.stringify([...positionPicksByRoundMap.values()]);
}

// arr: RowData[] - array of RowData objects representing the uploaded data
// returns a JSON object containing the total number of drafts by date
const generateTotalDraftsByDateJSON = (arr) => {

    const draftEntrySet = new Set(), filteredArr = [];
    arr.forEach(row => {
        const draftEntry = row.getVal('Draft Entry');
        if (!draftEntrySet.has(draftEntry)) {
            draftEntrySet.add(draftEntry);
            filteredArr.push(row);
        }
    });
    filteredArr.sort((a, b) => new Date(a.getVal('Picked At')) - new Date(b.getVal('Picked At')));
    
    let draftEntriesRunningTotal = 0, entryFeesRunningTotal = 0;
    let totalDraftsByDateMap = new Map();
    filteredArr.forEach(row => {
        let timestamp = row.getVal('Picked At');
        let entryFee = row.getEntryFee();
        const date = new Date(timestamp);
        const month = date.getUTCMonth() + 1; // Adding 1 because getUTCMonth() returns values from 0 to 11
        const day = date.getUTCDate();
        let dateString = `${month}/${day}`;
        if (!totalDraftsByDateMap.has(dateString)) {
            totalDraftsByDateMap.set(dateString, {
                date: dateString,
                draftsRunningTotal: draftEntriesRunningTotal,
                feesRunningTotal: entryFeesRunningTotal
            });
        }
        totalDraftsByDateMap.get(dateString).draftsRunningTotal++;
        draftEntriesRunningTotal++;
        totalDraftsByDateMap.get(dateString).feesRunningTotal += entryFee;
        entryFeesRunningTotal += entryFee;
    });
    return JSON.stringify([...totalDraftsByDateMap.values()]);
}

// arr: RowData[] - array of RowData objects representing the uploaded data
// returns a JSON object containing the tournaments found in the file
const generateTournamentsJSON = (arr) => {
    const tournamentSet = new Set();
    const tournaments = [];

    arr.forEach(row => {
        let tournamentId = row.getVal('Tournament');
        let weeklyWinnerId = row.getVal('Weekly Winner');

        if (tournamentId !== '' && !tournamentSet.has(tournamentId)) {
            tournaments.push({
                id: tournamentId,
                title: row.getVal('Tournament Title'),
                entryFee: +row.getVal('Tournament Entry Fee'),
                tournamentSize: +row.getVal('Tournament Size'),
                totalPrizes: +row.getVal('Tournament Total Prizes')
            });
            tournamentSet.add(tournamentId);
        } else if (weeklyWinnerId !== '' && !tournamentSet.has(weeklyWinnerId)) {
            // TODO: This assumes all WW are tournaments. Might not scale
            tournaments.push({
                id: weeklyWinnerId,
                title: row.getVal('Weekly Winner Title'),
                entryFee: +row.getVal('Weekly Winner Entry Fee'),
                tournamentSize: +row.getVal('Weekly Winner Size'),
                totalPrizes: +row.getVal('Weekly Winner Total Prizes')
            });
            tournamentSet.add(weeklyWinnerId);
        }
    });

    return JSON.stringify(tournaments);
}

/**
 * Convert any row properties to adhere to the replacement rules
 * @param {AdpRow[] | RowData[]} rowData - array of RowData or AdpRow objects representing the uploaded data
 * @param {obj[]} rules - array of objects containing the replacement rules
 * Important: rowData must have getKeyForReplacementRulesCheck(), setFirstName(), and setLastName() methods
 */
const applyReplacementRules = (rowData, rules) => {
    // key: first_name_match~last_name_match; value: first_name_replacement~last_name_replacement
    let rulesMap = new Map();
    rules.forEach(rule => {
        const { first_name_match, last_name_match, first_name_replacement, last_name_replacement } = rule;
        rulesMap.set(`${first_name_match}~${last_name_match}`, `${first_name_replacement}~${last_name_replacement}`);
    });
    rowData.forEach(row => {
        let key = row.getKeyForReplacementRulesCheck();
        if (rulesMap.has(key)) {
            let [first_name_replacement, last_name_replacement] = rulesMap.get(key).split('~');
            row.setFirstName(first_name_replacement);
            row.setLastName(last_name_replacement);
            console.log('Replacement:', key.split('~').join(' '), '->', first_name_replacement, last_name_replacement);
        }
    });
}

/**
 * Sort the uploaded file rows by 'Draft Entry' then by 'Picked At' timestamp
 * @param {RowData[]} arr - array of RowData objects representing the uploaded data
 */
const sortUploadFileRows = (arr) => {
    arr.sort((a, b) => {
        const aTime = new Date(a.getVal('Picked At')).getTime();
        const bTime = new Date(b.getVal('Picked At')).getTime();
        const aEntry = a.getVal('Draft Entry');
        const bEntry = b.getVal('Draft Entry');
        if (aEntry < bEntry) return -1;
        if (aEntry > bEntry) return 1;
        return aTime - bTime; // If 'Draft Entry' values are the same, sort by 'Picked At' timestamps
    });
}

module.exports = {
    generateDraftSpotJSON,
    generateDraftedTeamsJSON,
    generateDraftedPlayersExposureJSON,
    generatePositionPicksByRoundJSON,
    generateTotalDraftsByDateJSON,
    generateTournamentsJSON,
    applyReplacementRules,
    sortUploadFileRows,
};