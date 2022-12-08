//SERVIDOR EXPRESS
const fs = require("fs");
const express = require('express');
const app = express();

const http = require('http');
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server);

const modelo = require("./servidor/modelo.js");
const sWS = require("./servidor/servidorWS.js");


const PORT = process.env.PORT || 3000

//Añade juego (variable) 
let juego = new modelo.Juego();

//Creamos objeto sWS
let servidorWS = new sWS.ServidorWS();

app.use(express.static(__dirname + "/"));

app.get("/", function(request,response){
	var contenido=fs.readFileSync(__dirname+"/cliente/index.html");
	response.setHeader("Content-type","text/html");
	response.send(contenido);
});


app.get("/comprobarUsuario/:nick", function(request, response){
	let nick = request.params.nick;
	let us = juego.obtenerUsuario(nick);
	let res = {"nick":-1};
	if(us){
		res.nick=us.nick;
	}
	response.send(res);	// Lo que aquí se llama res en clienteRest se llama data
});

app.get("/agregarUsuario/:nick", function(request, response){
	let nick = request.params.nick;
	let res;
	res = juego.agregarUsuario(nick);
	response.send(res);	// Lo que aquí se llama res en clienteRest se llama data
});


app.get("/crearPartida/:nick", function(request, response){
	let  nick = request.params.nick;
	let res = juego.jugadorCrearPartida(nick);

	response.send(res);
});


app.get("/unirseAPartida/:nick/:codigo", function (request, response) {
	let codigo = request.params.codigo;
	let nick = request.params.nick;

	let res = juego.jugadorSeUneAPartida(nick, codigo);

	response.send(res);
});


app.get("/obtenerPartidas", function(request, response){
	let res = juego.obtenerPartidas();

	response.send(res);
});


app.get("/obtenerPartidasDisponibles", function(request, response){
	let res = juego.obtenerPartidasDisponibles();

	response.send(res);
});


app.get("/salir/:nick", function(request, response){
	let nick = request.params.nick;
	juego.salir(nick);

	response.send({res:"El usuario ha cerrado sesión"});
});

app.get("/abandonarPartida/:nick/:codigo", function(request, response){
	let nick = request.params.nick;
	let codigo = request.params.codigo;
	juego.abandonarPartida(nick,codigo);

	response.send({res:"El usuario "+nick+" ha abandonado la partida "+codigo});
});


app.get("/colocarBarco/:nick/:nombre/:x/:y", function(request, response){
	let nombre = request.params.nombre;
	let x = request.params.x;
	let y = request.params.y;
	res = juego.obtenerUsuario(nick).colocarBarco(nombre,x,y);
	response.send(res); //{res:"El usuario ha colocado el barco",nombre}
});


app.get("/barcosDesplegados/:nick", function(request, response){
	let nombre = request.params.nick;	
	res = juego.obtenerUsuario(nick).barcosDesplegados();
	response.send(res);
});


app.get("/disparar/:nick/:x/:y", function(request, response){
	let nombre = request.params.nick;	
	res = juego.obtenerUsuario(nick).disparar(x,y);
	response.send(res);
});


server.listen(PORT, () => {
	console.log(`App está escuchando en el puerto ${PORT}`);
	console.log('Ctrl+C para salir');
  });
  
//Lanzar servidor de Web Sockets
servidorWS.lanzarServidorWS(io, juego);

