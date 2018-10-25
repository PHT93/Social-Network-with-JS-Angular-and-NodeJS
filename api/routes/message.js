'use strict'

var express = require('express');
var messageController = require('../controllers/message');
var md_auth = require('../middlewares/authenticated');

var messageRouter = express.Router();

messageRouter.get('/test-message', md_auth.ensureAuth, messageController.test);
messageRouter.post('/send-message', md_auth.ensureAuth, messageController.sendMessage);
messageRouter.get('/my-messages/:page?', md_auth.ensureAuth, messageController.getReceivedMessages);
messageRouter.get('/my-emitted-messages/:page?', md_auth.ensureAuth, messageController.getEmittedMessages);
messageRouter.get('/my-unviewed-messages', md_auth.ensureAuth, messageController.getUnviewedMessages);
messageRouter.get('/view-messages', md_auth.ensureAuth, messageController.setViewedMessages);

module.exports = messageRouter;