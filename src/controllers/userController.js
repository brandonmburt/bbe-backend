const dbModel = require('../models/dbModel');
const User = require('../models/userModel');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const auth = require('../middlewares/authMiddleware');
const { EXPOSURE_TYPES } = require('../constants/types');
require('dotenv').config();

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
        res.status(500).send('Error: Unable to register new user', error);
    }

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
        res.status(500).send('No user found with that email');
    }

    try {
        await bcrypt.compare(password, dbUser.password, async (err, result) => {
            if (err) {
                res.status(500).send('Error: Couldn\'t compare passwords', err);
            } else if (result) {
                const accessToken = auth.generateAccessToken(dbUser);
                let resObj = { ...dbUser, accessToken: accessToken };
                if (rememberMe === 'true') {
                    const refreshToken = jwt.sign(dbUser, process.env.REFRESH_TOKEN_SECRET);
                    // TODO: probably want better validations here
                    await dbModel.invalidatePreviousRefreshTokens(dbUser.id);
                    await dbModel.insertRefreshToken(refreshToken, dbUser.id);
                    resObj.refreshToken = refreshToken;
                }
                res.status(200).send(resObj);
            } else {
                res.status(500).send('Error: Incorrect password');
            }
        });
    } catch (error) {
        res.status(500).send('Error: ', error);
    }

}

exports.getExposureData = async function (req, res) {

    if (!req.query.userId) {
        return res.status(400).send('No user id provided');
    }

    try {
        const { rows } = await dbModel.getExposureData(req.query.userId);
        if (rows.length === 0) {
            throw new Error('No exposure data found for that user');
        } else {
            let exposureData = {};
            rows.forEach(row => {
                const { draft_spots, drafted_teams, drafted_players, pos_picks_by_round, entries_running_totals, type } = row;
                if (EXPOSURE_TYPES.includes(type)) {
                    exposureData[type] = {
                        draftSpots: draft_spots,
                        draftedTeams: drafted_teams,
                        draftedPlayers: drafted_players,
                        posPicksByRound: pos_picks_by_round,
                        draftEntriesRunningTotals: entries_running_totals,
                    }
                }
            })
            res.status(200).json(exposureData);
        }
    } catch (error) {
        res.status(500).send('Error: ', error);
    }

}