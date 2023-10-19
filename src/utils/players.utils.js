const { TEAM_ABBREVIATIONS } = require('../constants/teams');

/* Regular expression removes all whitespace and special characters */
const removeWhitespaceAndSpecialChars = (str) => {
    return str.replace(/[\s!"#$%&'()*+,-./:;<=>?@[\\\]^_`{|}~]/g, '');
}

/*
* Remove generational suffixes from last name
*/
const cleanLastName = (lastName) => {
    const suffixes = ['jr.', 'sr.', 'ii', 'iii', 'iv', 'v', 'vi', 'vii', 'viii', 'ix', 'x'];
    const lastNameSplit = lastName.split(' ');
    if (lastNameSplit.length === 1) return lastName;
    const lastNameSuffix = lastNameSplit[lastNameSplit.length - 1].toLowerCase();
    if (suffixes.includes(lastNameSuffix)) {
        lastNameSplit.pop();
    }
    return lastNameSplit.join(' ');
}

module.exports = {
    removeWhitespaceAndSpecialChars,
    cleanLastName,
};