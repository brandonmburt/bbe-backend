var adpController = require('../controllers/adpController');
var auth = require('../middlewares/authMiddleware');

module.exports = function(app) {
    app.route('/adp')
        .get(auth.authenticateToken, adpController.getADPs)
};
  