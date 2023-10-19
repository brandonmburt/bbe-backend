const { adpCsvColumns } =  require('../constants/csv-columns');
const { TEAM_ABBREVIATIONS } = require('../constants/teams');
const { cleanLastName, removeWhitespaceAndSpecialChars } = require('../utils/players.utils');

class AdpRow {
    // row: string[] - array of strings representing the row data
    constructor(row) {
        this.error = null;
        if (row.length !== adpCsvColumns.length) {
            this.error = `Row length (${row.length}) does not match expected number of columns (${adpCsvColumns.length})`;
        } else {
            adpCsvColumns.forEach((col, i) => {
                const [header, type] = col;
                const value = row[i]
                value.replace('"', '');
                if (type === 'number') this[header] = (value !== '-') ? Number(value) : null; // TODO: How do I want to handle '-' values?
                else this[header] = value;
            });
        }
        this['lastName'] = cleanLastName(this['lastName']);
    }

    getKeyForReplacementRulesCheck() {
        return `${this['firstName']}~${this['lastName']}`;
    }

    setFirstName(firstName) {
        this['firstName'] = firstName;
    }

    setLastName(lastName) {
        this['lastName'] = lastName;
    }

    hasError() {
        return this.error !== null;
    }

    getError() {
        return this.error;
    }

    getVal(column) {
        if (!adpCsvColumns.map(col => col[0]).includes(column)) {
            throw new Error(`Column '${column}' does not exist`); // TODO: comment out in prod
        }
        return this[column];
    }

    getPlayerKey() {
        return [
            removeWhitespaceAndSpecialChars(this['firstName']),
            removeWhitespaceAndSpecialChars(this['lastName']),
            TEAM_ABBREVIATIONS[this['teamName']],
            this['slotName']
        ].join('~');
    }

    /*
    * Return an array of additional keys to identify players that have changed teams or positions
    * [first~last~pos, first~last~team] // 0: indicates changed team; 1: indicates changed pos
    */
    getAdditionalKeys() {
        const [firstName, lastName, team, pos] = [
            removeWhitespaceAndSpecialChars(this['firstName']),
            removeWhitespaceAndSpecialChars(this['lastName']),
            TEAM_ABBREVIATIONS[this['teamName']],
            this['slotName']
        ];
        return [
            [firstName, lastName, pos].join('~'),
            [firstName, lastName, team].join('~'),
        ];
    }

}

module.exports = AdpRow;