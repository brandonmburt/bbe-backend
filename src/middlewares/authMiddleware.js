const jwt = require('jsonwebtoken');
const dbModel = require('../models/dbModel');

// TODO: Define the User
exports.generateAccessToken = function (user) {
    return jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '1d' }); // TODO: 30s is only for testing
}

exports.generateRefreshToken = async function (req, res) {
    const { token, refresh } = req.body;
    if (token == null || refresh == null) return res.sendStatus(401);

    if (refresh === 'true') { // refresh token received; send back a new access token
        const { rows } = await dbModel.getRefreshToken(token);
        if (rows.length > 0) {
            jwt.verify(token, process.env.REFRESH_TOKEN_SECRET, (err, user) => {
                if (err) res.status(403).send(err);
                const accessToken = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '1d' }); // TODO: repetivitve code
                res.json({ accessToken: accessToken, email: user.email, id: user.id, role: user.role });
            });
        } else {
            res.sendStatus(403); // Indicates invalid refresh token
        }
    } else { // access token received; send back the same token
        jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
            if (err) return res.status(403).send(err);
            res.json({ accessToken: token, email: user.email, id: user.id, role: user.role });
        });
    }
}

exports.authenticateToken = function (req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Format: Bearer <token>
    if (token == null) return res.sendStatus(401);

    // user is the object that we serialized into the token
    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
        if (err) return res.status(403).send(err);
        if (err) console.log(err);
        req.user = user;
        next();
    });
}

exports.authenticateAdmin = function (req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Format: Bearer <token>
    if (token == null) return res.sendStatus(401);

    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
        if (err) return res.sendStatus(403);
        else if (user.role !== 'admin') return res.sendStatus(403);
        req.user = user;
        next();
    });
}
