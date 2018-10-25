'use strict'
var bcrypt = require('bcrypt-nodejs');
var mongoosePaginate = require('mongoose-pagination');

var User = require('../models/user');
var Follow = require('../models/follow');
var Publication = require('../models/publication');
var jwt = require('../services/jwt');
var fs = require('fs');
var path = require('path');

var userController = {
	home: function(req, res) {
		res.status(200).send({
			message: 'Hola mundo desde Node JS'
		});
	},

	test: function(req, res) {
		console.log(req.body);
		res.status(200).send({
			message: 'Bienvenido al curso de Angular y Node JS'
		});
	},

	storeUser: function(req, res) {
		var params = req.body;
		var user = new User();

		if(params.name && params.surname && params.nick && params.email && params.password) {

			user.name = params.name;
			user.surname = params.surname;
			user.nick = params.nick;
			user.email = params.email;
			user.role = 'ROLE_USER';
			user.image = null;

			User.find({
				$or: [
						{email: user.email.toLowerCase()},
						{nick: user.nick.toLowerCase()}

					]
			}).exec((error, users) => {
				if(error) return res.status(500).send({
					message: 'Error en la petición de usuarios'
				})

				if(users && users.length >= 1) {
					return res.status(200).send({
						message: 'El usuario que intenta registrar ya existe en la BBDD'
					});
				}else {
					//Encriptamos la contraseña y guardamos los datos
					bcrypt.hash(params.password, null, null, (err, hash) => {
						user.password = hash;

						user.save((err, userStored) => {
							if(err) return res.status(500).send({
								message: 'Error al guardar el usuario'
							});

							if(userStored){
								return res.status(200).send({
									userStored: userStored
								});
							}else {
								return res.status(404).send({
									message: 'No se ha registrado el usuario'
								});
							}
						});
					});
				}
			});

		}else {
			res.status(200).send({
				message: 'Envía todos los campos obligatorios'
			});
		}
	},

	login: function(req, res) {
		var params = req.body;

		var email = params.email;
		var password = params.password;

		User.findOne({ email: email }).exec((error, user) => {

			if(error) return res.status(500).send({
				message: 'Error en la petición de login'
			});

			if(user) {
				//Tengo que comparar si la contraseña que paso es la misma que en la BBDD
				//Sino estuvieran encriptadas no haría falta hacer esta comparación, pero
				//como no es así, tenemos que hacer un compare entre la encriptada y la que
				//está picada a piñón

				bcrypt.compare(password, user.password, (error, check) => {
					if(check) {

						if(params.getToken == 'true') {
							return res.status(200).send({
								token: jwt.createToken(user)
							});
						}else {
							//Devolver datos de usuario
							user.password = undefined;
							return res.status(200).send({
								loginUser: user
							});
						}

					}else {
						return res.status(404).send({
							message: 'El usuario no se ha podido loguear'
						});
					}
				})
			}else {
				return res.status(404).send({
					message: 'El usuario no existe'
				});
			}

		});
	},

	getUser: function(req, res) {
		/*
			Recoger parámetros en una request
			Body -> Cuando llegan datos por post o put
			Params -> Cuando nos llegan datos por URL
			Query ->
		*/
		var userId = req.params.id;

		User.findById(userId, (err, user) => {

			if(err) res.status(500).send({
				message: 'Error en la petición'
			});

			if(!user) {
				return res.status(404).send({
					message: 'El usuario no existe'
				});
			}

			thisUserFollowsMe(req.user.sub, userId).then((value) => {
				user.password = undefined;

				return res.status(200).send({
					user,
					value
				});
			});

			/*
			Follow.findOne({ "user": req.user.sub, "followed": userId }).populate({ path: "user followed"} ).exec((err, userFollowed) => {
				
				if(err) res.status(500).send({
					message: 'Error en la petición de seguimiento'
				});

				return res.status(200).send({
					user: user,
					follow: userFollowed
				});
			});
			*/
		});
	},

	getUsers: function(req, res) {
		//var identity_user_id = req.user.sub;
		var page = 1;

		if(req.params.page) {
			page = req.params.page;
		}

		var itemsPerPage = 5;

		User.find().sort('_id').paginate(page, itemsPerPage, (err, users, total) => {
			if(err) return res.status(500).send({
				message: 'Error en la petición'
			});

			if(!users) return res.status(404).send({
				message: 'No hay usuarios en la BBDD'
			});

			thisUsersFollowsMe(req.user.sub).then((value) => {
				return res.status(200).send({
					Users: users,
					value,
					TotalUsers: total,
					TotalPages: Math.ceil(total/itemsPerPage)
				});
			});

			/*return res.status(200).send({
				Users: users,
				TotalUsers: total,
				TotalPages: Math.ceil(total/itemsPerPage)
			});*/
		});
	},

	updateUser: function(req, res) {
		var userId = req.params.id;
		var paramsToUpdate = req.body;
		var user_isset = false;

		//Borrar propiedad contraseña
		delete paramsToUpdate.password;

		if(userId != req.user.sub) {
			return res.status(500).send({
				message: 'No tiene permiso para actualizar a este usuario'
			});
		}
		User.find({ $or: [
						{ nick: paramsToUpdate.nick },
						{ email: paramsToUpdate.email }
					] }).exec((error, users) => {
							users.forEach((user) => {
								if(user._id != userId) {
									user_isset = true;
								}
							});

							if(user_isset) {
								return res.status(404).send({
									message: "Datos de usuario ya en uso"
								});
							}

							User.findByIdAndUpdate(userId, paramsToUpdate, { new: true }, (err, userUpdated) => {
								if(err) return res.status(500).send({
									message: 'Error en la petición'
								});

								if(!userUpdated) return res.status(404).send({
									message: 'El usuario no existe'
								});

								return res.status(200).send({
									userUpdated: userUpdated
								});
							});
		});
	},

	uploadImage: function(req, res) {
		var userId = req.params.id;
		var fileName = "";

		if(req.files) {
			var filePath = req.files.image.path;
			var fileSplit = filePath.split("\\");
			var fileName = fileSplit[2];
			var fileExtensionSplit = fileName.split(".");
			var fileExtension = fileExtensionSplit[1];

			if(userId != req.user.sub) {
				return removeFilesOfUploads(res, filePath, 'No tiene permiso para actualizar a este usuario');
			}
			
			if(fileExtension == "jpg" || fileExtension == "jpeg" || fileExtension == "png" || fileExtension == "gif") {
				//Actualizamos imagen
				User.findByIdAndUpdate(userId, { image: fileName }, { new: true }, (err, userUpdated) => {
					if(err) return res.status(500).send({
						message: 'Error en la petición'
					});

					if(!userUpdated) return res.status(404).send({
						message: 'La imagen no se ha subido'
					});

					return res.status(200).send({
						userUpdated: userUpdated
					});
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
		var pathFile = './uploads/users/' + imageFile;
		
		fs.exists(pathFile, (exists) => {
			if(exists) {
				res.sendFile(path.resolve(pathFile));
			}else {
				res.status(200).send({
					message: 'No existe la imagen'
				});
			}

		});
	},

	//Contador de seguidores, publicaciones...
	getCounters: function(req, res) {
		var userId = req.user.sub;
		if(req.params.id) {
			getCountFollows(req.params.id).then((value) => {
				return res.status(200).send(value);
			});
		}

		getCountFollows(userId).then((value) => {
			return res.status(200).send(value);
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

//Debido a que las peticiones se hacen de manera asíncrona, el código no se espera
//a ejecutar una función sino que continua la ejecución. Con async y await conseguimos dicha sincronicidad
async function thisUserFollowsMe(myId, followingId) {
	try{	
		var following = await Follow.findOne({ user: myId, followed: followingId }).populate({ path: "followed" }).exec()
		.then((following) => {
			//Retorno la variable y no un JSON porque queremos cargar el valor following en la variable following
			return following;
		})
		.catch((error) => {
			return handleError(error);
		});

		var followed = await Follow.findOne({ user: followingId, followed: myId }).populate({ path: "user" }).exec()
		.then((followed) => {
			return followed;
		})
		.catch((error) => {
			return handleError(error);
		});

		return {
			ImFollowing: following,
			FollowingMe: followed
		}

	} catch(error) {
		console.log(error);
	}
}

async function thisUsersFollowsMe(myId) {
	try {

		var following = await Follow.find({ user: myId }).select({'_id': 0, '_v': 0, 'user': 0}).exec()
		.then((iFollowThem) => {
			var follows_them = [];

			iFollowThem.forEach((follow) => {
				follows_them.push(follow.followed);
			});

			return follows_them;
		})
		.catch((error) => {
			return handleError(error);
		});

		var followed = await Follow.find({ followed: myId }).select({'_id': 0, '_v': 0, 'followed': 0}).exec()
		.then((theyFollowMe) => {
			var follows_me = [];

			theyFollowMe.forEach((follow) => {
				follows_me.push(follow.user);
			});

			return follows_me;
		})
		.catch((error) => {
			return handleError(error);
		});

		return {
			IFollowThem: following,
			TheyFollowMe: followed
		}

	} catch(error) {
		console.log(error);
	}
}

async function getCountFollows(myId) {
	try {
		var following = await Follow.countDocuments({ user: myId }).exec()
		.then((count) => {
			return count;
		})
		.catch((error) => {
			return handleError(error);
		});

		var followed = await Follow.countDocuments({ followed: myId }).exec()
		.then((count) => {
			return count;
		})
		.catch((error) => {
			return handleError(error);
		});

		var publications = await Publication.countDocuments({ user: myId }).exec()
		.then((count) => {
			return count;
		})
		.catch((error) => {
			return handleError(error);
		});

		return {
			following: following,
			followed: followed,
			numberOfPublications: publications
		}

	} catch(error) {
		console.log(error);
	}
	
}

module.exports = userController;