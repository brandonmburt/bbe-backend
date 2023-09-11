var uploadController = require('../controllers/uploadController');
var auth = require('../middlewares/authMiddleware');

const multer = require('multer');
const storage = multer.memoryStorage()
const upload = multer({ storage: storage })

module.exports = function(app) {
    app.route('/upload')
        .post(auth.authenticateToken, upload.single('file'), uploadController.uploadFile)

    app.route('/admin/upload/adp')
        .post(auth.authenticateToken, auth.authenticateAdmin, upload.single('file'), uploadController.uploadAdpFile)
};