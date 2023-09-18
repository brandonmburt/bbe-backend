var playersController = require('../controllers/playersController');
var auth = require('../middlewares/authMiddleware');

module.exports = function(app) {
    app.route('/players')
        .get(auth.authenticateToken, playersController.getAllPlayers)
};
  