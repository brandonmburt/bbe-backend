
// columns: an array of ordered column names
// returns a string of column names e.g. '(col1, col2, col3, ...)'
const generateColumnsString = (columns) => {
    return `(${columns.join(', ')})`;
}

// numColumns: the number of columns to insert
// numRows: the number of rows to insert
// returns a string of placeholder values e.g. '($1, $2, $3), ($4, $5, $6), ...'
const generatePlaceholderString = (numColumns, numRows) => {
    let arr = [];
    for (let i=0; i<numRows; i++) {
        let placeholders = [];
        for (let j=1; j<=numColumns; j++) {
            placeholders.push(`$${i * numColumns + j}`);
        }
        arr.push(`(${placeholders.join(', ')})`);
    }
    return arr.join(', ');
}

module.exports = {
    generatePlaceholderString,
    generateColumnsString,
};