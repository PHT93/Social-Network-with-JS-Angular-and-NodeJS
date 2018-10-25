'use strict'

var moment = require('moment');
var mongoosePaginate = require('mongoose-pagination');

var User = require('../models/user');
var Follow = require('../models/follow');
var Message = require('../models/message');

var messageController = {

	test: function(req, res) {
		return res.status(200).send({
			message: "Test desde el controlador de mensaje"
		});
	},

	sendMessage: function(req, res) {
		var params = req.body;
		var message = new Message();

		if(!params.text || !params.receiver) return res.status(200).send({ message: "Envía los campos obligatorios" });

		message.emitter = req.user.sub;
		message.receiver = params.receiver;
		message.text = params.text;
		message.created_at = moment().unix();
		message.viewed = 'false';

		if(message.receiver == req.user.sub) return res.status(200).send({ message: "No te puedes escribir a ti mismo" });

		message.save((err, messageStored) => {

			if(err) return res.status(500).send({ message: "Error en la petición" });

			if(!messageStored) return res.status(404).send({ message: "Error al enviar el mensaje" });

			return res.status(200).send({ messageStored: messageStored });

		});
	},

	getReceivedMessages: function(req, res) {
		var userId = req.user.sub;
		var page = 1;
		var itemsPerPage = 4;

		if(req.params.page) {
			page = req.params.page;
		}

		Message.find({ receiver: userId }).populate('emitter', '_id name surname nick image').sort('-created_at').paginate(page, itemsPerPage, (err, messages, total) => {

			if(err) return res.status(500).send({ message: "Error en la petición" });

			if(!messages) return res.status(404).send({ message: "No hay mensajes" });

			return res.status(200).send({
				total: total,
				pages: Math.ceil(total/itemsPerPage),
				MyMessages: messages
			});

		});

	},

	getEmittedMessages: function(req, res) {
		var userId = req.user.sub;
		var page = 1;
		var itemsPerPage = 4;

		if(req.params.page) {
			page = req.params.page;
		}

		Message.find({ emitter: userId }).populate('receiver', '_id name surname nick image').sort('-created_at').paginate(page, itemsPerPage, (err, messages, total) => {

			if(err) return res.status(500).send({ message: "Error en la petición" });

			if(!messages) return res.status(404).send({ message: "No hay mensajes" });

			return res.status(200).send({
				total: total,
				pages: Math.ceil(total/itemsPerPage),
				MyMessages: messages
			});

		});

	},

	getUnviewedMessages: function(req, res) {
		var userId = req.user.sub;

		Message.countDocuments({ receiver: userId, viewed: 'false' }).exec((err, count) => {

			if(err) return res.status(500).send({ message: "Error en la petición" });

			return res.status(200).send({
				UnviewedMessages: count
			});

		});
	},

	setViewedMessages: function(req, res) {
		var userId = req.user.sub;

		//Multi: true hace que se pongan a true todos los documentos que cumplan la condición
		Message.update({ receiver: userId, viewed: 'false' }, { viewed: 'true' }, { 'multi': true }, (err, messagesUpdated) => {
			
			if(err) return res.status(500).send({ message: "Error en la petición" });

			if(!messagesUpdated) return res.status(404).send({ message: "No hay mensajes sin leer" });

			return res.status(200).send({
				MessagesUpdated: messagesUpdated
			});

		});
	}

}

module.exports = messageController;