const { crearJugador, jugadoresSala, regresarJugador, modCartas, iniciarPartida, guardarCartas, Declarar, cambiarCatrin, Vender, Sobornar, Bonificaciones} = require('../controllers/JugadorController');
const {crearSala, aumentarVend, decVend, aumRonda} = require('../controllers/SalaController');

class Sockets {

    constructor(io){
        this.io = io;
        this.socketEvents();
    }
    socketEvents() {

        // On connection
        this.io.on('connection', async( socket ) => {            
            const sala = socket.handshake.query['sala'];
            const jugador = socket.handshake.query['jugador'];            
            //Unir al usuario a una sala de socket.io
            socket.join( sala );
            //Guarda la sala y el jugador en la DB      
            const salaID = await crearSala(sala);
            const jugadorID = await crearJugador(salaID, jugador);
            //Mandar los id al usuario
            socket.emit('Regresar-id', {salaId: salaID, jugadorId:jugadorID});
            //Enviar la lista de usuarios
            socket.on('solicitar-jugadores', async () => {         
                const lista = await jugadoresSala(salaID);             
                socket.to(sala).emit('lista-jugadores', lista);
                socket.emit('lista-jugadores', lista);
            });
            //Iniciar partida
            socket.on('iniciar-partida', async() =>{
                await iniciarPartida(salaID);
                socket.emit('direcciona-juego');
                socket.to(sala).emit('direcciona-juego');
            });
            //Enviar catrín
            socket.on('obtener-catrin', async() => {
                let aux = await jugadoresSala(salaID);
                aux = aux.find(jugador => jugador.catrin);        
                socket.emit('regresar-catrin', {nombre: aux.nombre, personaje: aux.personaje});
            });
            //Enviar info usuario
            socket.on('obtener-jugador', async (Id) =>{
                const Jugadoraux= await regresarJugador(Id);
                socket.emit('regresar-jugador', Jugadoraux);
            });
            //Cambiar cartas
            socket.on('cambiar-cartas', async ({cartas, Id}) => {     
                const Jugadoraux= await modCartas(cartas, Id);
                socket.emit('regresar-jugador', Jugadoraux);
            });
            //Vender cartas
            socket.on('vender-cartas', async ({cartas, Id}) => {     
                await guardarCartas(cartas, Id);             
            });
            //Declaracion
            socket.on('declarar-cartas', async ({articulo, Id}) => {              
                await Declarar(articulo, Id);
                if(await aumentarVend(salaID)){
                    //Enviar jugadores a todos los usuarios
                    const num = await decVend(salaID);
                    let arrAux = await jugadoresSala(salaID);
                    arrAux = arrAux.filter(arr=>!arr.catrin);                    
                    socket.emit('iniciar-juicio', {jugadores: arrAux, num: num});
                    socket.to(sala).emit('iniciar-juicio', {jugadores: arrAux, num: num});
                }
            })
            //Mandar soborno
            socket.on('mandar-soborno', (soborno) => {
                socket.to(sala).emit('recibir-soborno', soborno);
            });

            //Revisar jugadores
            socket.on('revisar-jugador', async({catrinID, dineroCatrin, mercader}) => {
                await Vender(catrinID, dineroCatrin, mercader, true);
                socket.to(sala).emit('revisar-fase');
                socket.emit('revisar-fase');
            });

            //Saltar jugadores
            socket.on('saltar-jugador', async({catrinID, dineroCatrin, mercader}) => {
                await Vender(catrinID, dineroCatrin, mercader, false);
                socket.to(sala).emit('saltar-fase');
                socket.emit('saltar-fase');
            });

            //Revisar soborno
            socket.on('revisar-soborno', async({catrinID, dineroCatrin, mercader, soborno}) => {  
                await Vender(catrinID, dineroCatrin, mercader, true);
                await Sobornar(catrinID, soborno);
                socket.to(sala).emit('revisar-fase');
                socket.emit('revisar-fase');
            });

            //Saltar soborno
            socket.on('saltar-soborno', async({catrinID, dineroCatrin, mercader, soborno}) => {               
                await Vender(catrinID, dineroCatrin, mercader, false);
                await Sobornar(catrinID, soborno);
                socket.to(sala).emit('saltar-fase');
                socket.emit('saltar-fase');
            });

            //Continuar Revision
            socket.on('continuar-revision', async(revision) => {
                //Verifica si ya se completo la revision
                if(revision <= 0){                    
                    const num = await aumRonda(salaID);    
                    if(num === -1){
                        const jugadores = await jugadoresSala(salaID);
                        const bonificaciones = await Bonificaciones(jugadores)
                        socket.emit('fin-juego', bonificaciones);
                        socket.to(sala).emit('fin-juego', bonificaciones);
                    } 
                    else{                                             
                        const info = await cambiarCatrin(num, salaID);
                        socket.emit('regresar-catrin', {nombre: info.nombre, personaje: info.personaje});
                        socket.to(sala).emit('regresar-catrin', {nombre: info.nombre, personaje: info.personaje});
                    }
                    
                }
                else{
                    const num = await decVend(salaID);    
                    socket.emit('siguiente-revision', num);
                    socket.to(sala).emit('siguiente-revision', num);
                }
            });

            //Disconnect
            socket.on('disconnect', async() => {                
                console.log('Cliente Desconectado');
            });
        });
    }

}
 module.exports = Sockets;