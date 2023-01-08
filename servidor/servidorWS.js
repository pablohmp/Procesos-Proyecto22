
function ServidorWS() {
    //peticiones
    this.enviarAlRemitente = function (socket, mensaje, datos) {
        socket.emit(mensaje, datos);
    }
    this.enviarATodosEnPartida = function (io, codigo, mensaje, datos) {
        io.sockets.in(codigo).emit(mensaje, datos)
    }
    this.enviarATodos = function (socket, mensaje, datos) {
        socket.broadcast.emit(mensaje, datos);
    }

    //gestionar peticiones
    this.lanzarServidorWS = function (io, juego) {
        let cli = this;
        io.on('connection', (socket) => {
            console.log('Usuario conectado');

            socket.on("crearPartida", function (nick) {
                let res = juego.jugadorCreaPartida(nick);
                let codigoStr = res.codigo.toString();
                socket.join(codigoStr);
                cli.enviarATodosEnPartida(io, codigoStr, "partidaCreada", res);
                cli.enviarAlRemitente(socket, "esperandoRival", res);
                let lista = juego.obtenerPartidasDisponibles();
                cli.enviarATodos(socket, "actualizarListaPartidasDisp", lista);
            });
            socket.on("unirseAPartida", function (nick, codigo) {
                let res = juego.jugadorSeUneAPartida(nick, codigo);
                let codigoStr = res.codigo.toString();
                socket.join(codigoStr);
                cli.enviarAlRemitente(socket, "unidoAPartida", res);

                let partida = juego.obtenerPartida(res.codigo);

                if (partida.esDesplegando()) {
                    let usr = juego.obtenerUsuario(nick);
                    let flota = usr.obtenerFlota();
                    res = { flota: flota };
                    console.log(res.flota);
                    cli.enviarATodosEnPartida(io, codigoStr, "aDesplegar", res);
                }
            });
            socket.on("abandonarPartida", function (nick, codigo) {
                let res = juego.obtenerPartida(codigo);
                let codigoStr = res.codigo.toString();
                let partida = juego.obtenerPartida(res.codigo);

                res = { nick: nick, codigo: partida.codigo };
                cli.enviarATodosEnPartida(io, codigoStr, "userAbandona", res);
                juego.abandonarPartida(nick, codigo);


            });

            socket.on("colocarBarco", function (nick, nombre, x, y) {

                let user = juego.obtenerUsuario(nick);
                let tablero = user.tableroPropio;
                let ship = user.flota[nombre];
                if (user) {
                    if (user.partida) {
                        if (tablero.casillasLibres(x, y, ship.tam)) {
                            user.colocarBarco(nombre, x, y);

                            let partida = juego.obtenerPartida(user.partida.codigo);

                            let res = { nick: nick, barco: nombre, x: x, y: y, colocado: true };
                            cli.enviarAlRemitente(socket, "barcoColocado", res);
                            console.log("El Barco " + res.barco + " es colocado en la posición (" + res.x + "," + res.y + ")");
                            //console.log("jamon")
                        }
                        else {
                            console.log("No hay casillas libres para colocar este barco en esta posicion.");
                            let res = { estado: true };
                            cli.enviarAlRemitente(socket, "noHayCasillas", res);
                        }
                    }
                    else {
                        console.log("No se pueden desplegar barcos si no estás dentro de una partida.");
                        res = { estado: true };
                        cli.enviarAlRemitente(socket, "noColocar", res);
                    }


                }

            });
            socket.on("barcosDesplegados", function (nick) {

                let user = juego.obtenerUsuario(nick);
                if (user) {
                    user.barcosDesplegados();
                    console.log("Fase " + user.partida.fase);
                    if (user.partida.esJugando()) {
                        let res = { turno: user.partida.turno.nick };
                        let codigoStr = user.partida.codigo.toString();
                        cli.enviarATodosEnPartida(io, codigoStr, "aJugar", res);

                        console.log("Barcos deplegados. Comienza a atacar: " + res.turno);

                    }

                }

            });
            socket.on("disparar", function (nick, x, y) {

                let user = juego.obtenerUsuario(nick);
                if (user && user.partida.esJugando()) {

                    let turno = user.partida.turno;
                    console.log("Turno de: " + turno.nick);
                    if (user.nick == turno.nick) {

                        user.disparar(x, y);
                        let partida = juego.obtenerPartida(user.partida.codigo);
                        let codigoStr = partida.codigo.toString();
                        let estado = user.obtenerEstadoMarcado(x, y);
                        if (estado == 'agua') {
                            rival = user.partida.obtenerRival(nick);
                            let res = { atacante: nick, atacado: rival.nick, turno: turno.nick, estado: 'agua', x: x, y: y }
                            //cli.enviarAlRemitente(socket, "disparo", res);
                            cli.enviarATodosEnPartida(io, codigoStr, "disparo", res);
                        }
                        else {
                            if (estado == 'tocado') {
                                let res = { atacante: nick, turno: turno.nick, estado: 'tocado', x: x, y: y };
                                cli.enviarATodosEnPartida(io, codigoStr, "disparo", res);
                                //cli.enviarAlRemitente(socket, "disparo", res);
                            }
                            else {
                                let res = { atacante: nick, turno: turno.nick, estado: 'hundido', x: x, y: y };
                                //cli.enviarAlRemitente(socket, "disparo", res);
                                cli.enviarATodosEnPartida(io, codigoStr, "disparo", res);
                            }
                        }

                        if (partida.esFinal()) {
                            let res = { turno: turno.nick };
                            cli.enviarATodosEnPartida(io, codigoStr, "finPartida", res);
                        }

                    }
                    else {
                        rival = user.partida.obtenerRival(nick);
                        let res = { turno: rival.nick };
                        cli.enviarAlRemitente(socket, "noEsTuTurno", res);
                    }


                }
                else {
                    console.log("No se puede disparar hasta que se desplieguen todos los barcos.");
                    let res = { nick: nick };
                    cli.enviarAlRemitente(socket, "noDispare", res);
                }

            });
            socket.on("salir", function (nick) {
                let user = juego.obtenerUsuario(nick);
                //let partida = juego.obtenerPartida(user.partida.codigo);
                if (!user.partida & !user.partida.fase == "final") {
                    juego.salir(nick);
                    let res = { nick: nick };
                    cli.enviarAlRemitente(socket, "salir", res);
                }
                else {
                    let rival = user.partida.obtenerRival(nick);
                    let codigoStr = user.partida.codigo.toString();
                    juego.salir(nick);
                    let res = { nick: nick };
                    cli.enviarATodosEnPartida(io, codigoStr, "salir", res);

                };

            });
        });

    }
}
module.exports.ServidorWS = ServidorWS;