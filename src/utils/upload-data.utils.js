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
// returns a JSON object containing the drafted teams and corresponding data
const generateDraftedTeamsJSON = (arr) => {
    let draftedTeamsMap = new Map();
    arr.forEach(row => {
        const draftEntry = row.getVal('Draft Entry');
        if (!draftedTeamsMap.has(draftEntry)) {
            draftedTeamsMap.set(draftEntry, {
                draftEntry: draftEntry,
                tournamentId: row.getVal('Tournament'),
                weeklyWinnerId: row.getVal('Weekly Winner'),
                draftEntryFee: row.getEntryFee(),
                draftSize: row.getVal('Draft Size'),
                qbs: [], // Array of [pickNumber, id, timestamp]
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
            draftedTeamsMap.get(draftEntry)[(position.toLowerCase() + 's')].push(
                [row.getVal('Pick Number'), row.getVal('Appearance'), row.getVal('Picked At')]
            );
        }
    })
    return JSON.stringify([...draftedTeamsMap.values()]);
}


// arr: RowData[] - array of RowData objects representing the uploaded data
// returns a JSON object containing the drafted players and corresponding data
const generateDraftedPlayersExposureJSON = (arr) => {
    let draftedPlayersMap = new Map();
    arr.forEach(row => {
        const playerId = row.getVal('Appearance');
        if (!draftedPlayersMap.has(playerId)) {
            draftedPlayersMap.set(playerId, {
                playerId: playerId,
                name: row.getFullName(),
                sumEntryFees: 0,
                timesDrafted: 0,
                sumDraftPickNumber: 0, // used to calculate average pick number prior to returning data
                selectionInfo: [], // [draft entry, pick number, timestamp][]
            });
        }
        draftedPlayersMap.get(playerId).sumEntryFees += row.getEntryFee();
        draftedPlayersMap.get(playerId).timesDrafted++;
        draftedPlayersMap.get(playerId).sumDraftPickNumber += row.getVal('Pick Number');
        draftedPlayersMap.get(playerId).selectionInfo.push(row.getSelectionInfo());
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

module.exports = {
    generateDraftSpotJSON,
    generateDraftedTeamsJSON,
    generateDraftedPlayersExposureJSON,
    generatePositionPicksByRoundJSON,
    generateTotalDraftsByDateJSON,
};