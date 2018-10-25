'use strict'

var express = require('express');
var followController = require('../controllers/follow');
var md_auth = require('../middlewares/authenticated');

var routerFollow = express.Router();

routerFollow.get('/test-follow', md_auth.ensureAuth, followController.test);
routerFollow.post('/follow', md_auth.ensureAuth, followController.saveFollow);
routerFollow.delete('/unfollow/:id', md_auth.ensureAuth, followController.deleteFollow);
routerFollow.get('/my-follows/:id?/:page?', md_auth.ensureAuth, followController.getFollowingUsers);
routerFollow.get('/my-followers/:id?/:page?', md_auth.ensureAuth, followController.getFollowedUsers);
routerFollow.get('/get-my-follows/:followed?', md_auth.ensureAuth, followController.getMyFollows);

module.exports = routerFollow;