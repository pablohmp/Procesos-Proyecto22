function Juego(){
    this.partidas=[];
    this.agregarPartida=function(nombre){
        this.partidas.push(new Partida(nombre))
    }
    this.eliminarPartida=funcion(nombre){
        //TODO
    }
}

function Partida(nombre){
    this.nombre=nombre;
}