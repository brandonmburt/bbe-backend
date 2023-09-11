const { adpCsvColumns } =  require('../constants/csv-columns');

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

    getFullName() {
        return this['First Name'] + ' ' + this['Last Name'];
    }

    getCondensedData() {
        return {
            player_id: this['id'],
            adp: this['adp'],
            posRank: this['positionRank'],
        }
    }

}

module.exports = AdpRow;