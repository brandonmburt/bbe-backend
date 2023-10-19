const { csvColumns } =  require('../constants/csv-columns');
const { cleanLastName, removeWhitespaceAndSpecialChars } = require('../utils/players.utils');

class RowData {
    // row: string[] - array of strings representing the row data
    constructor(row) {
        this.error = null;
        if (row.length !== csvColumns.length) {
            this.error = `Row length (${row.length}) does not match expected number of columns (${csvColumns.length})`;
        } else {
            csvColumns.forEach((col, i) => {
                const [header, type] = col;
                const value = row[i];
                if (type === 'number') this[header] = Number(value);
                else this[header] = value;
            });
        }
        this['Last Name'] = cleanLastName(this['Last Name']);
    }

    hasError() {
        return this.error !== null;
    }

    getError() {
        return this.error;
    }

    getVal(column) {
        if (!csvColumns.map(col => col[0]).includes(column)) {
            throw new Error(`Column '${column}' does not exist`); // TODO: comment out in prod
        }
        return this[column];
    }

    getEntryFee() {
        // TODO: should be specifying the type of entry during initialization
        return this['Draft Entry Fee'] + this['Tournament Entry Fee'] + this['Draft Pool Entry Fee'] + this['Weekly Winner Entry Fee'];
    }

    getFullName() {
        return this['First Name'] + ' ' + this['Last Name'];
    }

    getKeyForReplacementRulesCheck() {
        return `${this['First Name']}~${this['Last Name']}`;
    }

    setFirstName(firstName) {
        this['First Name'] = firstName;
    }

    setLastName(lastName) {
        this['Last Name'] = lastName;
    }

    // returns [pick number, player key, timestamp]: [number, string, string]
    getSelectionInfo() {
        return [this['Pick Number'], this.getPlayerKey(), this['Picked At']];
    }

    // Return the (hopefully) unique key for this player
    getPlayerKey() {
        return [
            removeWhitespaceAndSpecialChars(this['First Name']),
            removeWhitespaceAndSpecialChars(this['Last Name']),
            this['Team'],
            this['Position']
        ].join('~');
    }

    /*
    * Return an array of additional keys to identify players that have changed teams or positions
    * [first~last~pos, first~last~team] // 0: indicates changed team; 1: indicates changed pos
    */
    getAdditionalKeys() {
        const [firstName, lastName, team, pos] = [
            removeWhitespaceAndSpecialChars(this['First Name']),
            removeWhitespaceAndSpecialChars(this['Last Name']),
            this['Team'],
            this['Position']
        ];
        return [
            [firstName, lastName, pos].join('~'),
            [firstName, lastName, team].join('~'),
        ];
    }

}

module.exports = RowData;