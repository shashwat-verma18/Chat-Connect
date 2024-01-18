const express = require('express');

const userController = require('../controllers/user.js');
const auth = require('../middleware/auth.js');


const router = express.Router();

router.post('/addUser', userController.addUser);

router.post('/loginUser', userController.loginUser);

router.get('/getAll', auth.authenticate, userController.getAllUser);

module.exports = router;