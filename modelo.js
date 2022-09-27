function Juego() {
    this.partidas = {};
    this.usuarios = {}; //arrays asociativos

    this.agregarUsuario = function (nick) {
        if (!this.usuarios[nick]) {
            this.usuarios[nick] = new Usuario(nick, this);
        }
    }
    this.eliminarUsuario = function (nick) {
        if (this.usuarios[nick]) {
            delete this.usuarios[nick];
        }
    }
    this.crearPartida = function (nick) {
        //Obtener código único
        //Crear la partida con propietario nick
        //Devolver el código o la partida
        let codigo = Date.now();
        this.partidas[codigo] = new Partida(codigo, nick);
        return codigo;
    }
}

this.unirseAPartida = function (codigo, nick) {
    if (this.partida[codigo]) {
        this.partidas[codigo].agregarJugador(nick);
    }
    else {
        console.log("La partida no existe");
    }
}
this.obtenerPartidas = function () {
    let lista;
    for (let key in this.partidas) {
        lista.push({ "codigo": key, "owner": this.partidas[key].owner });
    }
    return lista;
}

this.obtenerPartidasDisponibles = function () {
    //devolver sólo la spartidas sin completar
}

function Usuario(nick, juego) {
    this.nick = nick;
    this.juego = juego;
    this.crearPartida = function () {
        this.juego.crearPartida(this.nick)
    }
    this.unirseAPartida = function (codigo) {
        this.juego.unirseApartida(codigo, this.nick)
    }
}

function Partida(codigo) {
    this.codigo = codigo;
    this.owner = nick;
    this.jugadores = [];
    this.fase = "inicial"; // new Inicial()
    this.agregarJugador = function (nick) {
        if (this.jugadores.length < 2) {
            this.jugadores.push(nick);
        } else {
            console.log("La partida esta completa")
        }
    }
    this.agregarJugador(this.owner);
}