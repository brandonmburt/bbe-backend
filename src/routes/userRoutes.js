var userController = require('../controllers/userController');
var auth = require('../middlewares/authMiddleware');

module.exports = function(app) {
    app.route('/signUp')
        .post(userController.registerUser)

    app.route('/signIn')
        .post(userController.signInUser)

    app.route('/exposure')
        .get(auth.authenticateToken, userController.getExposureData)

    app.route('/deleteExposure')
        .post(auth.authenticateToken, userController.deleteExposureData)

    app.route('/token')
        .post(auth.generateRefreshToken) // TODO move to controller

    app.route('/deleteToken')
        .post(userController.deleteRefreshToken);
};
  