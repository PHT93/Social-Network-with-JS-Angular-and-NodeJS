'use strict'

var path = require('path');
var fs = require('fs');
var moment = require('moment');
var mongoosePaginate = require('mongoose-pagination');

var Publication = require('../models/publication');
var User = require('../models/user');
var Follow = require('../models/follow');

var publicationController = {

	test_publication: function(req, res) {
		return res.status(200).send({
			message: "Hola desde el controlador de publication"
		});
	},

	savePublication: function(req, res) {
		var params = req.body;
		var publication = new Publication();

		if(!params.text) return res.status(200).send({ message: "Debes enviar un texto"	});

		publication.text = params.text;
		publication.file = null;
		publication.user = req.user.sub;
		publication.created_at = moment().unix();

		publication.save((error, publicationStored) => {
			if(error) return res.status(500).send({ message: "Error al guardar la publicación"	});

			if(!publicationStored) return res.status(404).send({ message: "La publicación no ha sido guardada"	});

			return res.status(200).send({
				PublicationStored: publicationStored
			});
		});
	},

	getPublications: function(req, res) {
		var page = 1;
		var itemsPerPage = 4;

		if(req.params.page) {
			page = req.params.page;
		}

		Follow.find({ user: req.user.sub }).populate({ path: 'followed' }).exec((error, follows) => {
			if(error) return res.status(500).send({ message: "Error al devolver el seguimiento" });

			var follows_clean = [];

			follows.forEach((follow) => {
				follows_clean.push(follow.followed);
			});

			follows_clean.push(req.user.sub);

			//console.log(follows_clean);

			//Buscamos las publicaciones de los usuarios que sigo
			//Buscamos conincidencias entre documentos completos, no solo con el id
			Publication.find({ user: {"$in": follows_clean}}).sort('-created_at').populate({ path: 'user' }).paginate(page, itemsPerPage, (error, publications, total) => {
				if(error) return res.status(500).send({ message: "Error al devolver las publicaciones" });

				if(!publications) return res.status(404).send({ message: "No hay publicaciones" });

				return res.status(200).send({
					TotalItems: total,
					Pages: Math.ceil(total/itemsPerPage),
					CurrentPage: page,
					PublicationsIFollow: publications,
					ItemsPerPage: itemsPerPage
				});
			});
		});
		
	},

	getPublicationsUser: function(req, res) {
		var user = req.user.sub;
		var page = 1;
		var itemsPerPage = 4;

		if(req.params.page) {
			page = req.params.page;
		}

		if(req.params.user) {
			user = req.params.user;
		}

		Publication.find({ user: user }).sort('-created_at').populate({ path: 'user' }).paginate(page, itemsPerPage, (error, publications, total) => {
			if(error) return res.status(500).send({ message: "Error al devolver las publicaciones" });

			if(!publications) return res.status(404).send({ message: "No hay publicaciones" });

			return res.status(200).send({
				TotalItems: total,
				Pages: Math.ceil(total/itemsPerPage),
				CurrentPage: page,
				PublicationsIFollow: publications,
				ItemsPerPage: itemsPerPage
			});
		});
		
	},

	getPublication: function(req, res) {
		var publicationId = req.params.id;

		Publication.findById(publicationId, (error, publication) => {

			if(error) return res.status(500).send({ message: "Error al devolver la publicación" });

			if(!publication) return res.status(404).send({ message: "No hay publicación" });

			return res.status(200).send({
				Publication: publication
			});

		});
	},

	deletePublication: function(req, res) {
		var publicationId = req.params.id;

		Publication.find({ 'user': req.user.sub, '_id': publicationId }).remove(error => {
			if(error) return res.status(500).send({ message: "Error al eliminar la publicación" });

			return res.status(200).send({
				message: "Publicación eliminada"
			});
		});
	},

	uploadImage: function(req, res) {
		var publicationId = req.params.id;
		var fileName = "";

		if(req.files) {
			var filePath = req.files.image.path;
			var fileSplit = filePath.split("\\");
			var fileName = fileSplit[2];
			var fileExtensionSplit = fileName.split(".");
			var fileExtension = fileExtensionSplit[1];

			if(fileExtension == "jpg" || fileExtension == "jpeg" || fileExtension == "png" || fileExtension == "gif") {

				Publication.findOne({ 'user': req.user.sub, '_id': publicationId}).exec((error, publication) => {
					if(publication) {
						//Actualizamos imagen de la publicación
						Publication.findByIdAndUpdate(publicationId, { file: fileName }, { new: true }, (err, publicationUpdated) => {
							if(err) return res.status(500).send({
								message: 'Error en la petición'
							});

							if(!publicationUpdated) return res.status(404).send({
								message: 'La imagen no se ha subido a la publicación'
							});

							return res.status(200).send({
								PublicationUpdated: publicationUpdated
							});
						});
					}else {
						return removeFilesOfUploads(res, filePath, 'No tienes permisos');
					}
				});
			}else {
				return removeFilesOfUploads(res, filePath, 'Extensión no válida');
			}

		}else {
			return res.status(200).send({
				message: 'No se han subido imagenes'
			});
		}
	},

	getImageFile: function(req, res) {
		var imageFile = req.params.imageFile;
		var pathFile = './uploads/publications/' + imageFile;
		
		fs.exists(pathFile, (exists) => {

			if(exists) {
				res.sendFile(path.resolve(pathFile));
			}else {
				res.status(200).send({
					message: 'No existe la imagen'
				});
			}

		});
	}
}

function removeFilesOfUploads(res, filePath, message) {
	fs.unlink(filePath, (err) => {
		return res.status(200).send({
			message: message
		});
	});
}

module.exports = publicationController;