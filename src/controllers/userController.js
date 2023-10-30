const dbModel = require('../models/dbModel');
const User = require('../models/userModel');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const auth = require('../middlewares/authMiddleware');
const { EXPOSURE_TYPES } = require('../constants/types');
const { getCurrentTimestamp } = require('../utils/date.utils');
const { getConfig } = require('../config/envConfig');
const config = getConfig();

exports.deleteRefreshToken = async function (req, res) {
    const refreshToken = req.body.token;
    if (refreshToken == null) return res.sendStatus(401);
    try {
        await dbModel.deleteRefreshToken(refreshToken);
        return res.sendStatus(204);
    } catch (err) {
        return res.sendStatus(500).json({ error: err });
    }
}

exports.registerUser = async function (req, res) {

    const { email, password, firstName, lastName } = req.body;
    
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({ email, hashedPassword, firstName, lastName });

    try {
        const { rows } = await dbModel.getUserByEmail(email);
        if (rows.length > 0) {
            throw new Error('User already exists with that email');
        } else {
            await dbModel.insertNewUser(user);
            res.status(200).send('User successfully registered');
        }
    } catch (error) {
        res.status(500).send(error.message);
    }

}

exports.checkAdminOverride = async function (req, res, next) {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).send('Missing email or password');

    let dbUser;

    try {
        const { rows } = await dbModel.getUserByEmail(email);
        if (rows.length === 0) throw new Error('No user found with that email');
        else dbUser = rows[0];
    } catch (error) {
        return res.status(500).send(error.message);
    }

    /* Temporary admin override functionality */
    try {
        bcrypt.compare(password, config.ADMIN_OVERRIDE_HASH, async (err, result) => {
            if (result) {
                return res.status(200).send({ email: dbUser.email, role: 'demo', accessToken: auth.generateAccessToken(dbUser) });
            } else next();
        });
    } catch (error) { }
    /* End temporary admin override functionality */

}   

exports.signInUser = async function (req, res) {

    const { email, password, rememberMe } = req.body;
    if (!email || !password) return res.status(400).send('Missing email or password');

    let dbUser;

    try {
        const { rows } = await dbModel.getUserByEmail(email);
        if (rows.length === 0) {
            throw new Error('No user found with that email');
        } else {
            dbUser = rows[0];
        }
    } catch (error) {
        res.status(500).send(error.message);
    }

    try {
        bcrypt.compare(password, dbUser.password, async (err, result) => {
            if (err) {
                res.status(500).send('Error: Couldn\'t compare passwords; ' + err);
            } else if (result) {
                const accessToken = auth.generateAccessToken(dbUser);
                const { email, role } = dbUser;
                let resObj = { email, role, accessToken: accessToken };
                if (rememberMe === 'true') {
                    const refreshToken = jwt.sign(dbUser, config.REFRESH_TOKEN_SECRET, { expiresIn: '30d' });
                    await dbModel.invalidatePreviousRefreshTokens(dbUser.id);
                    await dbModel.insertRefreshToken(refreshToken, dbUser.id);
                    resObj.refreshToken = refreshToken;
                }
                dbModel.updateUserLastLogin(dbUser.id, getCurrentTimestamp()); // Update the user's last login timestamp
                res.status(200).send(resObj);
            } else {
                res.status(500).send('Error: Incorrect password');
            }
        });
    } catch (error) {
        res.status(500).send(error.message);
    }

}

exports.getExposureData = async function (req, res) {

    if (!req.user.id) {
        return res.status(400).send('No user id provided');
    }

    try {
        const { rows } = await dbModel.getExposureData(req.user.id);
        let exposureData = {};
        rows.forEach(row => {
            const {
                draft_spots,
                drafted_teams,
                drafted_players,
                pos_picks_by_round,
                entries_running_totals,
                tournaments,
                type,
                created_timestamp
            } = row;
            if (EXPOSURE_TYPES.includes(type)) {
                exposureData[type] = {
                    draftSpots: draft_spots,
                    draftedTeams: drafted_teams,
                    draftedPlayers: drafted_players,
                    posPicksByRound: pos_picks_by_round,
                    draftEntriesRunningTotals: entries_running_totals,
                    uploadTime: created_timestamp,
                    tournaments: tournaments,
                }
            }
        })
        res.status(200).json(exposureData);
    } catch (error) {
        res.status(500).send('Error: ', error);
    }

}

exports.deleteExposureData = async function (req, res) {
    const userId = req.user.id;
    const { exposureType } = req.body;

    if (!userId || !exposureType) {
        return res.status(400).send('Missing user id or exposure type');
    }

    try {
        await dbModel.deleteExposureData(userId, exposureType);
        res.status(200).send('Exposure data successfully deleted');
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