'use strict'

var path = require('path');
var fs = require('fs');
var mongoosePaginate = require('mongoose-pagination');

var User = require('../models/user');
var Follow = require('../models/follow');

var followController = {
	test: function(req, res) {
		res.status(200).send({
			message: 'Probando el Follow Controller'
		});
	},

	saveFollow: function(req, res) {
		var params = req.body;
		var follow = new Follow();

		follow.user = req.user.sub;
		follow.followed = params.followed;

		if(req.user.sub != follow.followed) {
			follow.save((err, followStored) => {
				if(err) return res.status(500).send({
					message: 'Error al guardar el seguimiento'
				});

				if(!followStored) return res.status(404).send({
					message: 'El seguimiento no se ha guardado'
				});

				return res.status(200).send({
					follow: followStored
				});
			});
		}else {
			return res.status(200).send({
				message: "No te puedes seguir a ti mismo"
			});
		}

	},

	deleteFollow: function(req, res) {
		var userId = req.user.sub;
		var userToUnfollow = req.params.id;

		Follow.find({ user: userId, followed: userToUnfollow }).remove((err, unfollow) => {
			if(err) return res.status(500).send({
				message: 'Error al eliminar el seguimiento'
			});

			if(!unfollow) return res.status(404).send({
				message: 'El unfollow no se ha eliminado'
			});

			return res.status(200).send({
				message: 'El follow se ha eliminado',
				unfollow: unfollow
			});
		});
	},

	getFollowingUsers: function(req, res) {
		var userId = req.user.sub;
		var page = 1;
		var itemsPerPage = 4;

		if(req.params.id && req.params.page) {
			userId = req.params.id;
		}

		if(req.params.page) {
			page = req.params.page;
		}else {
			page = req.params.id;
		}

		//Con populated indicamos el campo que quiero cambiar por el que hace referencia
		//Básicamente hacemos esto para sacar el documento con los datos originales de la
		//persona que sigo
		Follow.find({ user: userId }).populate({ path: 'followed' }).paginate(page, itemsPerPage, (err, follows, total) => {
			if(err) return res.status(500).send({
				message: 'Error en el servidor'
			});

			if(!follows) return res.status(404).send({
				message: 'No existen follows para el usuario: ' + userId
			});

			thisUsersFollowsMe(req.user.sub).then((value) => {
				return res.status(200).send({
					TotalFollows: total,
					TotalFollowsPages: Math.ceil(total/itemsPerPage),
					Follows: follows,
					value
				});
			});
		});

	},

	getFollowedUsers: function(req, res) {
		var userId = req.user.sub;
		var page = 1;
		var itemsPerPage = 4;

		if(req.params.id && req.params.page) {
			userId = req.params.id;
		}

		if(req.params.page) {
			page = req.params.page;
		}else {
			page = req.params.id;
		}

		//Con populated indicamos el campo que quiero cambiar por el que hace referencia
		//Básicamente hacemos esto para sacar el documento con los datos originales de la
		//persona que me sigue
		Follow.find({ followed: userId }).populate({ path: 'user' }).paginate(page, itemsPerPage, (err, myFollows, total) => {
			if(err) return res.status(500).send({
				message: 'Error en el servidor'
			});

			if(!myFollows) return res.status(404).send({
				message: 'Nadie sigue al usuario: ' + userId
			});

			thisUsersFollowsMe(req.user.sub).then((value) => {
				return res.status(200).send({
					TotalMyFollows: total,
					TotalMyFollowsPages: Math.ceil(total/itemsPerPage),
					MyFollows: myFollows,
					value
				});
			});
		});

	},

	//Devolver usuarios que sigo y que me siguen
	getMyFollows: function(req, res) {
		//Los que sigo
		var userId = req.user.sub;
		var find = Follow.find({ user: userId });

		if(req.params.followed) {
			//Los que me siguen
			find = Follow.find({ followed: userId });
		}

		find.populate('user followed').exec((err, follows) => {
			if(err) return res.status(500).send({
				message: 'Error en el servidor'
			});

			if(!follows) return res.status(404).send({
				message: 'No existen follows en el usuario: ' + userId
			});

			return res.status(200).send({
				follows
			});
		});
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
			following: following,
			followed: followed
		}

	} catch(error) {
		console.log(error);
	}
}

module.exports = followController;