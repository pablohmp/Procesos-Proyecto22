function ClienteWS(){
	this.socket=io();
	//enviar peticiones
	this.conectar=function(){
		this.socket=io();
	}
	//gestionar peticiones
}