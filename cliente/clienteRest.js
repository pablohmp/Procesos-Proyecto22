function ClienteRest() {
    this.agregarUsuario = function (nick) {
        var cli = this;
        $.getJSON("/agregarUsuario/" + nick, function (data) {
            //se ejecuta cuando conteste el servidor
            console.log(data);
            if (data.nick != -1) {
                console.log("Usuario " + data.nick + " registrado")
                //ws.nick=data.nick;
                //$.cookie("nick",ws.nick);
                //iu.mostrarHome(data);
            }
            else {
                console.log("No se ha podido registrar el usuario")
                //iu.mostrarModal("El nick ya está en uso");
                //iu.mostrarAgregarJugador();
            }
        });
        //todavia no estoy seguro que haya contestado el servidor
        //lo que pongas aqui se ejecuta a la vez que la llamada
    }
    this.crearPartida = function (nick) {
        var cli = this;
        $.getJSON("/crearPartida/" + nick, function (data) {
            //se ejecuta cuando conteste el servidor
            console.log(data);
            if (data.nick != -1) {
                console.log("Usuario " + cli.nick + " crea una partida de codigo "+data.codigo)
                //ws.nick=data.nick;
                //$.cookie("nick",ws.nick);
                //iu.mostrarHome(data);
            }
            else {
                console.log("No se ha podido registrar el usuario")
                //iu.mostrarModal("El nick ya está en uso");
                //iu.mostrarAgregarJugador();
            }
        });
    }
    this.unirseAPartida = function (nick, codigo) {
        var cli = this;
        $.getJSON("/unirseAPartida/" + nick + "/" + codigo, function (data) {
            //se ejecuta cuando conteste el servidor
            console.log(data);
            if (data.nick != -1) {
                console.log("Usuario " + data.nick + " se une a partida de codigo "+data.codigo)
                //ws.nick=data.nick;
                //$.cookie("nick",ws.nick);
                //iu.mostrarHome(data);
            }
            else {
                console.log("No se ha podido registrar el usuario")
                //iu.mostrarModal("El nick ya está en uso");
                //iu.mostrarAgregarJugador();
            }
        });
    }
}