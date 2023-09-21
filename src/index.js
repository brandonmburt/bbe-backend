const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
dotenv.config();

const app = express();

// Enable CORS for all routes
app.use(cors());

// Middleware to parse JSON and urlencoded bodies
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Get an instance of the express Router, prefix all routes with /api
var router = express.Router();
app.use('/api', router);

var uploadRoutes = require('./routes/uploadRoutes')
    playerRoutes = require('./routes/playerRoutes')
    adpRoutes = require('./routes/adpRoutes')
    userRoutes = require('./routes/userRoutes')

// Register the routes
uploadRoutes(router);
playerRoutes(router);
adpRoutes(router);
userRoutes(router);

app.listen(process.env.PORT, () => {
    console.log(`App listening at http://localhost:${process.env.PORT}`);
});
