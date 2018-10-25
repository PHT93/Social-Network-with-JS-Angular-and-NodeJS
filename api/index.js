'use strict'

var mongoose = require('mongoose');
var app = require('./app');
var port = 3800;

mongoose.Promise = global.Promise;
//Conexión BBDD
mongoose.connect('mongodb://localhost:27017/curso_mean_social', { useNewUrlParser: true })
		.then(() => {
			console.log("Conexión a la BBDD curso_mean_social realizada con éxito");

			//Crear Servidor
			app.listen(port, () => {
				console.log("Servidor corriendo en el puerto: " + port);
			});

		})
		.catch(error => console.log(error));