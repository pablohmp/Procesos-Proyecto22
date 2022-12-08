function ClienteRest() {
    this.nick;

    this.agregarUsuario = function (nick) {
        var cli = this;
        $.getJSON("/agregarUsuario/" + nick, function (data) {
            console.log(data);
            if (data.nick != -1) {
                console.log("Usuario " + data.nick + " agregado");
                cli.nick = data.nick;
                $.cookie("nick", data.nick);
                cws.conectar();
                iu.mostrarHome();
            }
            else {
                console.log("No se ha podido agregar al usuario");
                iu.mostrarModal("El nick ya está en uso");
                iu.mostrarAgregarUsuario()
            }
        });
    }

    this.comprobarUsuario = function () {
        $.getJSON("/comprobarUsuario/" + this.nick, function (data) {
            if (data.nick != -1) {
                console.log("Usuario "+data.nick+" activo.");
                cws.conectar();
                iu.mostrarHome();
            }
            else {
                console.log("Usuario "+data.nick+" inactivo.");
                iu.mostrarAgregarUsuario()
            }
        });
    }

    this.crearPartida = function () {
        let cli = this;
        let nick = cli.nick;
        $.getJSON("/crearPartida/" + nick, function (data) {
            console.log(data);
            if (data.codigo != -1) {
                console.log("El usuario " + nick + " crea la partida de codigo: " + data.codigo);
                iu.mostrarCodigo(data.codigo);
                $.cookie("nick", data.nick);
            }
            else {
                console.log("La partida no se ha podido crear.");
            }
        })
    }

    this.unirseAPartida = function (codigo) {
        let cli = this;
        $.getJSON("/unirseAPartida/" + this.nick + "/" + codigo, function (data) {
            console.log(data);
            //Se ejecuta cuando conteste el servidor
            if (data.codigo != -1) {
                console.log("El usuario " + cli.nick + " se ha unido a la partida: " + data.codigo);
                iu.mostrarCodigo(data.codigo);
            }
            else {
                console.log("El usuario " + nick + " no se ha podido unir a la partida: " + codigo);
            }
        });
    }
    this.obtenerListaPartidas = function () {
        let cli = this;
        $.getJSON("/obtenerPartidas", function (lista) {
            console.log(lista);
            iu.mostrarListaDePartidas(lista);
        });
    }

    this.obtenerListaPartidasDisponibles = function () {
        let cli = this;
        $.getJSON("/obtenerPartidasDisponibles", function (lista) {
            console.log(lista);
            iu.mostrarListaDePartidasDisponibles(lista);
        });
    }

    this.salirUsuario = function () {
        let nick = this.nick;
        $.getJSON("/salir/" + nick, function (data) {
            $.removeCookie("nick");
            iu.mostrarComprobarCookie();
        });
    }

    this.abandonarPartida = function (codigo) {
        let nick = this.nick;
        $.getJSON("/abandonarPartida/" + nick + "/" + codigo, function (data) {       
            iu.mostrarHome();
        });
    }

}
