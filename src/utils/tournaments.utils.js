

// tournamentRows: array of tournament rows from the database
// rowData: RowData[] - array of RowData objects representing the uploaded data
const getTournamentsToInsert = (tournamentRows, rowData, type) => {
    let tournamentsInDatabase = tournamentRows ? new Set([...tournamentRows.map(row => row.id)]) : new Set();

    const tournamentsToInsert = [];
    rowData.forEach(row => {
        let tournamentId = row.getVal('Tournament');
        let weeklyWinnerId = row.getVal('Weekly Winner');

        if (tournamentId !== '' && !tournamentsInDatabase.has(tournamentId)) {
            tournamentsToInsert.push([
                tournamentId,
                row.getVal('Tournament Title'),
                row.getVal('Tournament Entry Fee'),
                row.getVal('Tournament Size'),
                row.getVal('Tournament Total Prizes'),
                type,
            ]);
            tournamentsInDatabase.add(tournamentId);
        } else if (weeklyWinnerId !== '' && !tournamentsInDatabase.has(weeklyWinnerId)) { // TODO: Should I add a flag for WW?
            tournamentsToInsert.push([
                weeklyWinnerId,
                row.getVal('Weekly Winner Title'),
                row.getVal('Weekly Winner Entry Fee'),
                row.getVal('Weekly Winner Size'),
                row.getVal('Weekly Winner Total Prizes'),
                type,
            ]);
            tournamentsInDatabase.add(weeklyWinnerId);
        }

    });
    return tournamentsToInsert;
}

module.exports = {
    getTournamentsToInsert,
};