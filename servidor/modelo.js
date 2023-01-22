let cad = require('./cad.js');

function Juego() {
	this.partidas = [];
	this.usuarios = {};  //array asociativo [clave][objeto]
	this.cad = new cad.Cad();
	this.test = false;
	//this.cad.conectar();

	this.agregarUsuario = function (nick) {
		let res = { "nick": -1 };
		if (!this.usuarios[nick]) {
			this.usuarios[nick] = new Usuario(nick, this)
			res = { "nick": nick };
			console.log("Nuevo usuario: " + nick);
			this.insertarLog({ "operacion": "inicioSesion", "usuario": nick, "fecha": Date() }, function () {
			console.log("Registro de log(iniciar sesion) insertado");
			});
		}
		return res;
	}
	this.eliminarUsuario = function (nick) {
		delete this.usuarios[nick];
		console.log("El usuario " + nick + " ha salido del juego.")
	}
	this.eliminarPartida = function (index) {
		console.log("Partida " + this.partidas[index].codigo + " eliminada.");
		delete this.partidas[index];
	}

	this.obtenerPartida = function (codigo) {
		return this.partidas[codigo];
	}
	this.obtenerUsuario = function (nick) {
		if (this.usuarios[nick]) {
			return this.usuarios[nick];
		}
	}

	this.jugadorCreaPartida = function (nick) {
		let usr = this.usuarios[nick];
		let res = { "codigo": -1 };
		let codigo;

		if (usr) {
			codigo = usr.crearPartida();
			res = { "codigo": codigo };
		}

		return res;
	}

	this.crearPartida = function (user) {
		let codigo = Date.now();

		this.insertarLog({ "operacion": "crearPartida", "propietario": user.nick, "codigo": codigo, "fecha": Date() }, function () {
		console.log("Registro de log(crear partida) insertado");
		});

		this.partidas[codigo] = new Partida(codigo, user);
		return codigo;
	}

	this.unirseAPartida = function (codigo, user) {
		let res = -1;
		if (this.partidas[codigo]) {
			res = this.partidas[codigo].agregarJugador(user);
			this.insertarLog({ "operacion": "unirsePartida", "usuario": user.nick, "codigoPartida": codigo, "fecha": Date() }, function () {
			console.log("Registro de log(unirse a partida) insertado");
			});
		} else {
			console.log("La partida no existe");
		}
		return res;
	}

	this.jugadorSeUneAPartida = function (nick, codigo) {
		let usr = this.usuarios[nick];
		let res = { "codigo": -1 };
		let valor;

		if (usr) {
			valor = this.unirseAPartida(codigo, usr);
			res = { "codigo": valor };
		}
		return res;
	}

	this.salir = function (nick) {
		let res = { "codigo": -1 };
		this.eliminarUsuario(nick);
		this.insertarLog({ "operacion": "finSesion", "usuario": nick, "fecha": Date() }, function () {
		console.log("Registro de log(salir) insertado");
		});
		for (let key in this.partidas) {
			if (this.partidas[key].owner.nick == nick) {
				res = { "codigo": this.partidas[key].codigo };
				this.eliminarPartida(key);
			}
		}
		return res;
	}
	this.abandonarPartida = function (nick, codigo) {
		this.insertarLog({ "operacion": "abandonarPartida", "usuario": nick, "codigo": codigo, "fecha": Date() }, function () {
		console.log("Registro de log(abandonar) insertado");
		});
		return this.eliminarPartida(codigo);
	}

	this.obtenerPartidas = function () {

		let lista = [];
		for (let key in this.partidas) {
			lista.push({ "codigo": key, "owner": this.partidas[key].owner.nick });
		}
		return lista;
	}

	this.obtenerPartidasDisponibles = function () {

		let lista = [];
		for (let key in this.partidas) {
			if (this.partidas[key].jugadores.length < 2) {
				lista.push({ "codigo": key, "owner": this.partidas[key].owner.nick });
			}
		}
		return lista;
	}

	this.insertarLog = function (log, callback) {
		if (!this.test) {
			this.cad.insertarLog(log, callback);
		}
	}
	this.obtenerLogs = function (callback) {
		this.cad.obtenerLogs(callback);
	}
}

function Usuario(nick, juego) {
	this.nick = nick;
	this.juego = juego;
	this.tableroPropio;
	this.tableroRival;
	this.partida;
	this.flota = {};

	this.crearPartida = function () {
		return this.juego.crearPartida(this);
	}
	this.unirseAPartida = function (codigo) {
		this.juego.unirseAPartida(codigo, this);
	}

	this.inicializarTablero = function (dim) {
		this.tableroPropio = new Tablero(dim);
		this.tableroRival = new Tablero(dim);
	}
	this.inicializarFlota = function () {
		this.flota["b2"] = new Barco("b2", 2);
		this.flota["b4"] = new Barco("b4", 4);
	}
	this.colocarBarco = function (nombre, x, y) {
		let barco = this.flota[nombre];
		if (this.partida && this.partida.esDesplegando() && !barco.desplegado) {
			this.tableroPropio.colocarBarco(barco, x, y);
		} else {
			console.log("En la fase " + this.partida.fase + " no se pueden colocar barcos.")
		}


	}

	this.todosDesplegados = function () {
		for (var key in this.flota) {
			if (!this.flota[key].desplegado) {
				return false
			}
		}
		return true
	}
	this.barcosDesplegados = function () {
		if (this.partida) {
			this.partida.barcosDesplegados();
		}
		else {
			console.log("No se pueden desplegar barcos si no estás dentro de una partida.");
		}
	}
	this.disparar = function (x, y) {
		this.partida.disparar(this.nick, x, y);
	}
	this.meDisparan = function (x, y) {
		return this.tableroPropio.meDisparan(x, y);
	}

	this.marcarEstado = function (estado, x, y) {
		this.tableroRival.marcarEstado(estado, x, y);
		if (estado == "agua") {
			this.partida.cambiarTurno(this.nick);
		}
	}
	this.flotaHundida = function () {
		for (var key in this.flota) {
			if (this.flota[key].estado != "hundido") {
				return false
			}
		}
		return true
	}
	this.obtenerEstado = function (x, y) {
		return this.tableroPropio.obtenerEstado(x, y);
	}

	this.obtenerEstadoMarcado = function (x, y) {
		return this.tableroRival.obtenerEstado(x, y);
	}
	this.obtenerFlota = function () {
		return this.flota;
	}

	this.logAbandonarPartida = function (jugador, codigo) {
		this.juego.insertarLog({ "operacion": "abandonarPartida", "usuario": jugador.nick, "codigo": codigo, "fecha": Date() }, function () {
			console.log("Registro de log(abandonar) insertado");
		});
	}
	this.logFinalizarPartida = function (perdedor, ganador, codigo) {
		this.juego.insertarLog({ "operacion": "finalizarPartida", "perdedor": perdedor, "ganador": ganador, "codigo": codigo, "fecha": Date() }, function () {
			console.log("Registro de log(finalizarPartida) insertado");
		});
	}

}

function Partida(codigo, user) {
	this.codigo = codigo;
	this.owner = user;
	this.jugadores = [];
	this.fase = 'inicial';
	this.maxJugadores = 2;
	//Timer
	this.timer;
	this.timeLeft = 60;

	this.startTimer = function () {
		this.timer = setInterval(() => this.updateTimer(), 1000);
		this.updateTimer();
	}

	this.restartTimer = function () {
		this.timeLeft = 60;
	}

	this.updateTimer = function () {
		this.timeLeft = this.timeLeft - 1;
		/* if (this.timeLeft >= 0) {
			//$('#timer').html(this.timeLeft);
			//console.log(this.timeLeft);
		} */
	}
	this.endTimer = function () {
		clearInterval(this.timer);
	}

	this.checkTimer = function () {
		if (this.timeLeft == 0 || this.timeLeft < 0) {
			return true;
		}
		return false;
	}

	this.forzarTimer = function (){
		this.timeLeft = 0;
	}



	this.agregarJugador = function (usr) {
		let res = this.codigo;
		if (this.hayHueco()) {
			this.jugadores.push(usr);
			console.log("El usuario " + usr.nick + " se une a la partida de codigo: " + this.codigo)
			usr.partida = this;
			usr.inicializarTablero(10);
			this.comprobarFase();
			usr.inicializarFlota();
		}
		else {
			res = -1;
			console.log("La partida está completa")
		}
		return res;
	}

	this.esJugando = function () {
		return this.fase == "jugando";
	}
	this.esDesplegando = function () {
		return this.fase == "desplegando";
	}
	this.esFinal = function () {
		return this.fase == "final";
	}
	this.comprobarFase = function () {
		if (!this.hayHueco()) {
			this.fase = 'desplegando';
		}
	}

	this.hayHueco = function () {
		return (this.jugadores.length < this.maxJugadores);
	}

	this.agregarJugador(this.owner);

	this.flotasDesplegadas = function () {
		for (i = 0; i < this.jugadores.length; i++) {
			if (!this.jugadores[i].todosDesplegados()) {
				return false;
			}
		}
		return true;
	}
	this.barcosDesplegados = function () {
		if (this.flotasDesplegadas()) {
			this.fase = "jugando";
			this.asignarTurnoInicial();
		}
	}
	this.asignarTurnoInicial = function () {
		this.turno = this.jugadores[0];
	}
	this.cambiarTurno = function (nick) {
		this.turno = this.obtenerRival(nick);
	}
	this.obtenerRival = function (nick) {
		let rival;
		for (i = 0; i < this.jugadores.length; i++) {
			if (this.jugadores[i].nick != nick) {
				rival = this.jugadores[i];
			}
		}
		return rival;
	}
	this.obtenerJugador = function (nick) {
		let jugador;
		for (i = 0; i < this.jugadores.length; i++) {
			if (this.jugadores[i].nick == nick) {
				jugador = this.jugadores[i];
			}
		}
		return jugador;
	}

	this.disparar = function (nick, x, y) {
		let atacante = this.obtenerJugador(nick);
		//Chequear el turno
		if (this.turno.nick == atacante.nick) {
			let atacado = this.obtenerRival(nick);
			let estado = atacado.meDisparan(x, y);
			atacante.marcarEstado(estado, x, y);
			this.comprobarFin(atacado);
		}
		else {
			console.log("No es tu turno");
		}

	}
	this.comprobarFin = function (jugador) {
		if (jugador.flotaHundida()) {
			this.fase = "final";
			console.log("Fin de la partida.");
			console.log("Ganador: " + this.turno.nick);
			jugador.logFinalizarPartida(jugador.nick, this.turno.nick, this.codigo);
		}
	}

}

function Tablero(size) {
	this.size = size;
	this.casillas;

	this.crearTablero = function (tam) {
		this.casillas = new Array(tam);
		for (x = 0; x < tam; x++) {
			this.casillas[x] = new Array(tam);
			for (y = 0; y < tam; y++) {
				this.casillas[x][y] = new Casilla(x, y);
			}
		}
	}
	this.colocarBarco = function (barco, x, y) {
		if (this.casillasLibres(x, y, barco.tam)) {
			for (i = 0; i < barco.tam; i++) {
				this.casillas[i + x][y].contiene = barco;
			}

			barco.desplegado = true;
		}
	}

	this.casillasLibres = function (x, y, tam) {
		if (x + tam > this.size) {
			return false;
		}
		for (i = 0; i < tam; i++) {
			let contiene = this.casillas[i + x][y].contiene;
			if (!contiene.esAgua()) {
				return false;
			}
		}
		return true;

	}
	this.meDisparan = function (x, y) {
		return this.casillas[x][y].contiene.meDisparan(this, x, y);
	}
	this.obtenerEstado = function (x, y) {
		return this.casillas[x][y].contiene.estado;
	}
	this.ponerAgua = function (x, y) {
		this.casillas[x][y].contiene = new Agua();
	}
	this.ponerEscombros = function (x, y) {
		this.casillas[x][y].contiene = new Escombros();
	}
	this.marcarEstado = function (estado, x, y) {
		this.casillas[x][y].contiene.estado = estado;
	}
	this.crearTablero(size);

}

function Casilla(x, y) {
	this.x = x;
	this.y = y;
	this.contiene = new Agua();
}

function Barco(nombre, tam) {
	this.nombre = nombre;
	this.tam = tam;
	this.orientacion;
	this.desplegado = false;
	this.estado = "intacto";
	this.disparos = 0;

	this.esAgua = function () {
		return false
	}
	this.esEscombros = function () {
		return false
	}
	this.meDisparan = function (tablero, x, y) {
		this.disparos++;

		if (this.disparos < this.tam) {
			this.estado = "tocado";
			console.log("Tocado");
		}
		else {
			this.estado = "hundido";
			console.log("Hundido");
		}
		tablero.ponerEscombros(x, y);

		return this.obtenerEstado();
	}
	this.obtenerEstado = function () {
		return this.estado;

	}
}

function Agua() {
	this.nombre = "Agua";
	this.esAgua = function () {
		return true
	}
	this.esEscombros = function () {
		return false
	}
	this.meDisparan = function () {
		console.log("Agua");
		return this.obtenerEstado();
	}
	this.obtenerEstado = function () {
		return "agua";
	}

}

function Escombros() {
	this.nombre = "Escombros";
	this.esAgua = function () {
		return false
	}
	this.esEscombros = function () {
		return true
	}
	this.meDisparan = function () {
		console.log("Escombros");
		return this.obtenerEstado();
	}
	this.obtenerEstado = function () {
		return "escombros";
	}

}


function Inicial() {
	this.nombre = "inicial";
}
function Jugando() {
	this.nombre = "jugando";
}
function Final() {
	this.nombre = "final";
}



module.exports.Juego = Juego;