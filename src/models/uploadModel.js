const { csvColumns } =  require('../constants/csv-columns');

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

    // returns [draft entry, pick number, timestamp]: [string, number, string]
    getSelectionInfo() {
        return [this['Draft Entry'], this['Pick Number'], this['Picked At']];
    }

}

module.exports = RowData;