describe("El juego. . .", function() {
  var miJuego;
  var usr1, usr2;

  beforeEach(function() {
    miJuego = new Juego();
    miJuego.agregarUsuario("pepe");
    miJuego.agregarUsuario("luis");
    usr1 = mijuego.usuarios['pepe'];
    usr2 = miJuego.usuarios['luis'];
  });

  it("crear partida", function(){
    let codigo = usr1.crearPartida();
    expect(miJuego.partidas[codigo]).toBeDefined();
    let partida = miJuego.partidas[codigo];
    expect(partida.owner).toEqual(usr1.nick);
    expect(partida.jugadores[0]).toEqual(usr1.nick);
    expect(partida.codigo).toEqual(codigo);
  })

});
