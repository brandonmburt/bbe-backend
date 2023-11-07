const dbModel = require('../models/dbModel');
const { cleanLastName, removeWhitespaceAndSpecialChars } = require('../utils/players.utils');

exports.getRegisteredUsers = async function (req, res) {
    try {
        const { rows } = await dbModel.getRegisteredUsers();
        const users = rows.map(user => {
            const { email, first_name, last_name, last_login_date, account_creation_date, role } = user;
            return {
                email,
                firstName: first_name,
                lastName: last_name,
                lastLogin: last_login_date,
                createdAt: account_creation_date,
                role,
            }
        })
        res.status(200).json({users});
    } catch (error) {
        res.status(500).send('Error: ', error);
    }
}

exports.addReplacementRule = async function (req, res) {
    const userId = req.user.id
    const { fName, lName, fNameReplacement, lNameReplacement } = req.body;

    if (!userId || !fName || !lName || !fNameReplacement || !lNameReplacement) {
        return res.status(400).send('Missing info');
    }

    try {
        await dbModel.addReplacementRule(fName, lName, fNameReplacement, lNameReplacement);
        res.status(200).send('Replacement Rule successfully added');
    } catch (error) {
        res.status(500).send('Error: ', error);
    }
}

exports.deleteReplacementRule = async function (req, res) {
    const userId = req.user.id
    const { id } = req.body;

    if (!userId || !id) {
        return res.status(400).send('Missing user id or id');
    }

    try {
        await dbModel.deleteReplacementRule(id);
        res.status(200).send('Replacement Rule successfully deleted');
    } catch (error) {
        res.status(500).send('Error: ', error);
    }

}

exports.getReplacementRules = async function (req, res) {
    try {
        const { rows } = await dbModel.getReplacementRules();
        const rules = rows.map(row => {
            const { id, first_name_match, last_name_match, first_name_replacement, last_name_replacement, created_at } = row;
            return {
                id,
                firstNameMatch: first_name_match,
                lastNameMatch: last_name_match,
                firstNameReplacement: first_name_replacement,
                lastNameReplacement: last_name_replacement,
                createdAt: created_at,
            }
        })
        res.status(200).json({rules});
    } catch (error) {
        res.status(500).send('Error: ', error);
    }
}

exports.addRookieDefinition = async function (req, res) {

    const userId = req.user.id
    let { firstName, lastName, team, position, season } = req.body;

    if (!userId || !firstName || !lastName || !team || !position || !season) {
        return res.status(400).send('Missing info');
    }

    lastName = cleanLastName(lastName);
    const playerId = [
        removeWhitespaceAndSpecialChars(firstName),
        removeWhitespaceAndSpecialChars(lastName),
        team,
        position
    ].join('~');

    try {
        await dbModel.addRookieDefinition(firstName, lastName, team, position, +season, playerId);
        res.status(200).send('Rookie definition successfully added');
    } catch (error) {
        res.status(500).send('Error: ', error);
    }
}

exports.deleteRookieDefinition = async function (req, res) {
    const userId = req.user.id
    const { id } = req.body;

    if (!userId || !id) {
        return res.status(400).send('Missing user id or id');
    }

    try {
        await dbModel.deleteRookieDefinition(id);
        res.status(200).send('Rookie Definition successfully deleted');
    } catch (error) {
        res.status(500).send('Error: ', error);
    }

}

exports.getRookieDefinitions = async function (req, res) {
    try {
        const { rows } = await dbModel.getRookieDefinitions();
        const rookieDefinitions = rows.map(row => {
            const { id, player_id, first_name, last_name, team, position, season, created_at } = row;
            return {
                id,
                playerId: player_id,
                firstName: first_name,
                lastName: last_name,
                team,
                position,
                season,
                createdAt: created_at,
            }
        })
        res.status(200).json({rookieDefinitions});
    } catch (error) {
        res.status(500).send('Error: ', error);
    }
}