var tournamentsController = require('../controllers/tournamentsController');

module.exports = function(app) {
    app.route('/tournaments')
        .get(tournamentsController.getAllTournaments)
};
  