const express = require('express');

const msgController = require('../controllers/message.js');
const auth = require('../middleware/auth.js');
const upload = require('../middleware/fileUpload.js');

const router = express.Router();

router.post('/sendMsg', auth.authenticate, msgController.sendMsg);

router.post('/sendFile', auth.authenticate, upload.single('file'), msgController.sendFile);

router.get('/getMsg', auth.authenticate, msgController.getMsg);

router.get('/oldMsg', auth.authenticate, msgController.getAllMsg);

module.exports = router;