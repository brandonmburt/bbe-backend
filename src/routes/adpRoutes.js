var adpController = require('../controllers/adpController');

module.exports = function(app) {
    app.route('/adp')
        .get(adpController.getADPs)
};
  