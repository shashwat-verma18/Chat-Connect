const express = require('express');

const grpController = require('../controllers/group.js');
const auth = require('../middleware/auth.js');

const router = express.Router();

router.post('/create', auth.authenticate, grpController.createGrp);

router.get('/getGroups', auth.authenticate, grpController.getGrp);

router.get('/getMembers', auth.authenticate, grpController.getMembers);

router.post('/makeAdmin', auth.authenticate, grpController.makeAdmin);

router.post('/removeUser', auth.authenticate, grpController.removeUser);


module.exports = router;