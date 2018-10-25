'use strict'

var express = require('express');
var UserController = require('../controllers/user');

var routerUser = express.Router();
var md_auth = require('../middlewares/authenticated');

var multipart = require('connect-multiparty');
var md_upload = multipart({ uploadDir: './uploads/users' });

routerUser.get('/home', UserController.home);
routerUser.post('/test', md_auth.ensureAuth, UserController.test);
routerUser.post('/register-user', UserController.storeUser);
routerUser.post('/login-user', UserController.login);
routerUser.get('/get-user/:id', md_auth.ensureAuth, UserController.getUser);
routerUser.get('/get-users/:page?', md_auth.ensureAuth, UserController.getUsers);
routerUser.put('/update-user/:id', md_auth.ensureAuth, UserController.updateUser);
routerUser.post('/upload-image-user/:id', [md_auth.ensureAuth, md_upload], UserController.uploadImage);
routerUser.get('/get-image-user/:imageFile', UserController.getImageFile);
routerUser.get('/get-counters/:id?', md_auth.ensureAuth, UserController.getCounters);

module.exports = routerUser;