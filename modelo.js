function Juego(){
    this.partidas={};
    this.usuarios={}; //arrays asociativos

    this.agregarUsuario=function(nick){
        if (!this.usuarios[nick]){
            this.usuarios[nick]=new Usuario(nick, this);
        }
    }
    this.eliminarUsuario=function(nick){
        if (this.usuarios[nick]){
            delete this.usuarios[nick];
        }
    }
    this.crearPartida=function(nick){
        //Obtener código único
        //Crear la partida con propietario nick
        //Devolver el código o la partida
    }
}

function Usuario(nick, juego){
    this.nick=nick;
    this.juego=juego;
    this.crearPartida=function(){
        this.juego.crearPartida(this.nick)
    }
}

function Partida(codigo){
    this.codigo=codigo;
}