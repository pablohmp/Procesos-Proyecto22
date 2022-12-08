let modelo = require("./modelo.js");

describe("El juego...", function () {
	var miJuego;
	var user1, user2;
	beforeEach(function () {
		miJuego = new modelo.Juego(); 
		miJuego.agregarUsuario("pepe");
		miJuego.agregarUsuario("luis");
		res = miJuego.jugadorCreaPartida("pepe");
	});

	//Agregar un jugador a la partida
	it("Agregar un jugador a la partida", function () {
		user2 = miJuego.obtenerUsuario("luis");
		expect(miJuego.unirseAPartida(res.codigo, user2)).toEqual(res.codigo);
	});

	describe("El juego...", function () {

		beforeEach(function () {
			miJuego.jugadorSeUneAPartida("luis", res.codigo);
			user1 = miJuego.obtenerUsuario("pepe");
			user2 = miJuego.obtenerUsuario("luis");
			partida = miJuego.obtenerPartida(res.codigo);
		});

		it("inicialmente", function () {
			expect(user1.nick).toEqual("pepe");
			expect(user2.nick).toEqual("luis");
		});

		it("luis y pepe estan en la patida", function () {
			expect(partida.obtenerJugador("pepe").nick).toEqual("pepe");
			expect(partida.obtenerJugador("luis").nick).toEqual("luis");
		});


		it("Comprobar que los nick de usuarios están en la partida", function () {
			expect(partida.jugadores[0].nick).toEqual(user1.nick);
			expect(partida.jugadores[1].nick).toEqual(user2.nick);
		});

		//Comprobar que tienen tablero propio y tablero rival
		it("Comprobar que cada usuario tiene 2 tableros de 5x5", function () {
			expect(user1.tableroPropio).toBeDefined();
			expect(user2.tableroPropio).toBeDefined();
			expect(user1.tableroRival).toBeDefined();
			expect(user2.tableroRival).toBeDefined();


			expect(user1.tableroPropio.casillas.length).toEqual(5);
			expect(user2.tableroPropio.casillas.length).toEqual(5);

			//habría que recorrer las 5 columnas
			expect(user1.tableroPropio.casillas[0].length).toEqual(5);
			expect(user1.tableroRival.casillas[0].length).toEqual(5);
			expect(user2.tableroPropio.casillas[0].length).toEqual(5);
			expect(user2.tableroRival.casillas[0].length).toEqual(5);

			//habría que recorrer todo el tablero
			//que contienen agua (esAgua())
			expect(user1.tableroPropio.casillas[0][0].contiene.esAgua()).toEqual(true);
		});

		//comprobar que cada usuario tiene 1 flota de 2 barcos
		//de tamaño 4 y 2
		it("Los dos jugadores tienen flota (2 barcos, tam 2 y 4", function () {
			expect(user1.flota).toBeDefined();
			expect(user2.flota).toBeDefined();

			expect(Object.keys(user1.flota).length).toEqual(2);
			expect(Object.keys(user2.flota).length).toEqual(2);

			expect(user1.flota["b2"].tam).toEqual(2);
			expect(user2.flota["b4"].tam).toEqual(4);
		});


		//comprobar que la partida esta en fase desplegando
		it("La partida está en la fase desplegando", function () {
			expect(partida.esJugando()).toEqual(false);
			expect(partida.esDesplegando()).toEqual(true);
		});


		describe("A jugaaaaar!!", function () {
			beforeEach(function () {
				user1.colocarBarco("b2", 0, 0);	//0,0 1,0
				user1.colocarBarco("b4", 0, 1);	//0,1 1,1 2,1 3,1
				user1.barcosDesplegados();
				user2.colocarBarco("b2", 0, 0);
				user2.colocarBarco("b4", 0, 1);
				user2.barcosDesplegados();
			})

			//comprobar que la partida esta en fase jugando
			it("La partida está en la fase jugando", function () {
				expect(partida.esJugando()).toEqual(true);
				expect(partida.esDesplegando()).toEqual(false);
			});

			it("Comprobar que las flotas están desplegadas", function () {
				expect(user1.todosDesplegados()).toEqual(true);
				expect(user2.todosDesplegados()).toEqual(true);
				expect(partida.flotasDesplegadas()).toEqual(true);
				expect(partida.esJugando()).toEqual(true);
			});
			it("Comprobar jugada que Pepe gana", function () {
				expect(partida.turno.nick).toEqual(user1.nick);
				expect(user2.flota["b2"].estado).toEqual("intacto");
				user1.disparar(0, 0);
				expect(user2.flota["b2"].estado).toEqual("tocado");
				user1.disparar(1, 0);
				expect(user2.flota["b2"].estado).toEqual("hundido");
				expect(user2.flota["b4"].estado).toEqual("intacto");
				user1.disparar(0, 1);
				expect(user2.flota["b4"].estado).toEqual("tocado");
				user1.disparar(1, 1);
				expect(user2.flota["b4"].estado).toEqual("tocado");
				user1.disparar(2, 1);
				expect(user2.flota["b4"].estado).toEqual("tocado");
				user1.disparar(3, 1);
				expect(user2.flota["b4"].estado).toEqual("hundido");
				expect(user2.flotaHundida()).toEqual(true);
				expect(user1.flotaHundida()).toEqual(false);
				expect(partida.esFinal()).toEqual(true);
			});
			it("Comprobar el cambio de turno", function () {
				expect(partida.turno).toEqual(user1);
				user1.disparar(0,3);
				expect(partida.turno).toEqual(user2);
			});
			it("Comprobar que no se puede puede disparar sin turno", function () {
				expect(partida.turno).toEqual(user1);
				user2.disparar(1, 0);
				expect(user1.flota["b2"].estado).toEqual("intacto");
			});

		});
	});
});