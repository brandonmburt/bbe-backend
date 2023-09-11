// Ordered columns expected in the CSV file; format is [header, data type]
const csvColumns = [
    ['Picked At', 'string'],
    ['Pick Number', 'number'],
    ['Appearance', 'string'],
    ['First Name', 'string'],
    ['Last Name', 'string'],
    ['Team', 'string'],
    ['Position', 'string'],
    ['Draft', 'string'],
    ['Draft Entry', 'string'],
    ['Draft Entry Fee', 'number'],
    ['Draft Size', 'number'],
    ['Draft Total Prizes', 'number'],
    ['Tournament Title', 'string'],
    ['Tournament', 'string'],
    ['Tournament Entry Fee', 'number'],
    ['Tournament Total Prizes', 'number'],
    ['Tournament Size', 'number'],
    ['Draft Pool Title', 'string'],
    ['Draft Pool', 'string'],
    ['Draft Pool Entry Fee', 'number'],
    ['Draft Pool Total Prizes', 'number'],
    ['Draft Pool Size', 'number'],
    ['Weekly Winner Title', 'string'],
    ['Weekly Winner', 'string'],
    ['Weekly Winner Entry Fee', 'number'],
    ['Weekly Winner Total Prizes', 'number'],
    ['Weekly Winner Size', 'number'],
];

const adpCsvColumns = [
    ['id', 'string'],
    ['firstName', 'string'],
    ['lastName', 'string'],
    ['adp', 'number'],
    ['projectedPoints', 'number'],
    ['positionRank', 'string'],
    ['slotName', 'string'],
    ['teamName', 'string'],
    ['lineupStatus', 'string'],
    ['byeWeek', 'string'],
];

module.exports = {
    csvColumns,
    adpCsvColumns,
}