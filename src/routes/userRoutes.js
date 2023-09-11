var userController = require('../controllers/userController');
var authMiddleware = require('../middlewares/authMiddleware');

module.exports = function(app) {
    app.route('/signUp')
        .post(userController.registerUser)

    app.route('/signIn')
        .post(userController.signInUser)

    app.route('/exposure')
        .get(userController.getExposureData)

    app.route('/token')
        .post(authMiddleware.generateRefreshToken) // TODO move to controller

    app.route('/deleteToken')
        .post(userController.deleteRefreshToken);
};
  