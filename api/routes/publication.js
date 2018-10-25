'use strict'
var express = require('express');
var publicationController = require('../controllers/publication');
var routerPublication = express.Router();
var md_auth = require('../middlewares/authenticated');

var multipart = require('connect-multiparty');
var md_upload = multipart({ uploadDir: './uploads/publications' });

routerPublication.get('/test-publication', md_auth.ensureAuth, publicationController.test_publication);
routerPublication.post('/publication', md_auth.ensureAuth, publicationController.savePublication);
routerPublication.get('/publications/:page?', md_auth.ensureAuth, publicationController.getPublications);
routerPublication.get('/publications-user/:user/:page?', md_auth.ensureAuth, publicationController.getPublicationsUser);
routerPublication.get('/get-publication/:id', md_auth.ensureAuth, publicationController.getPublication);
routerPublication.delete('/remove-publication/:id', md_auth.ensureAuth, publicationController.deletePublication);
routerPublication.post('/upload-publication-file/:id', [md_auth.ensureAuth, md_upload], publicationController.uploadImage);
routerPublication.get('/get-publication-file/:imageFile', publicationController.getImageFile);

module.exports = routerPublication;