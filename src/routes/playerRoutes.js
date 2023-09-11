var playersController = require('../controllers/playersController');

module.exports = function(app) {
    app.route('/players')
        .get(playersController.getAllPlayers)
};
  