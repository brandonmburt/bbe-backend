var adminController = require('../controllers/adminController');
var auth = require('../middlewares/authMiddleware');

module.exports = function(app) {

    app.route('/admin/users')
        .get(auth.authenticateToken, auth.authenticateAdmin, adminController.getRegisteredUsers);

    app.route('/admin/addReplacementRule')
        .post(auth.authenticateToken, auth.authenticateAdmin, adminController.addReplacementRule);

    app.route('/admin/deleteReplacementRule')
        .post(auth.authenticateToken, auth.authenticateAdmin, adminController.deleteReplacementRule);

    app.route('/admin/replacementRules')
        .get(auth.authenticateToken, auth.authenticateAdmin, adminController.getReplacementRules);

    app.route('/admin/addRookieDefinition')
        .post(auth.authenticateToken, auth.authenticateAdmin, adminController.addRookieDefinition);

    app.route('/admin/deleteRookieDefinition')
        .post(auth.authenticateToken, auth.authenticateAdmin, adminController.deleteRookieDefinition);

    app.route('/admin/rookieDefinitions')
        .get(auth.authenticateToken, auth.authenticateAdmin, adminController.getRookieDefinitions);

};
  