

class Sockets {

    constructor(io){

        this.io = io;
        this.socketEvents();

    }

    socketEvents() {

        // On connection
        this.io.on('connection', async( socket ) => {

            console.log('Cliente Conectado')

            const sala = socket.handshake.query['sala'];
            
            //Unir al usuario a una sala de socket.io
            socket.join( sala );
            
            //Muestra los jugadores conectados
            socket.on('jugador', (jugador) => {
                socket.to(sala).emit('lista-usuarios', jugador);
            });

            //Iniciar la partida
            socket.on('iniciar-partida', (party) => {
                socket.to(sala).emit('obtener-info', party);
            });

            //Cambiar info usuario
            socket.on('cambiar-jugador-info', (jugador) => {
                socket.to(sala).emit('guardar-info-jugador', jugador);
            });

            //actualizar info
            socket.on('refrescar-info-usuario', async(usuario) => {
                await socket.to(sala).emit('guardar-info-usuario', usuario);
            });

            //Mandar marcancia
            socket.on('finalizar-nalgona', async(usuario) => {
                await socket.to(sala).emit('mandar-merca', usuario);
            })

            //Revisar jugador
            socket.on('evaluar-jugador', async (usuario) => {
                await socket.to(sala).emit('enjuiciar-jugador', usuario);
            });

            //Recibir soborno
            socket.on('mandar-soborno', async (soborno) => {
                await socket.to(sala).emit('recibir-sobrno', soborno);
            });

            //Tu JUEGO A JUICIO
            socket.on('mandar-juicio', async({examinar, revisando, pago }) => {
                await socket.to(sala).emit('vender-mercancias', {examinar, revisando, pago});
            });

            socket.on('siguiente-ronda', async (party) => {
                await socket.to(sala).emit('pasar-ronda', party);
            })
 
            //Disconnect
            socket.on('disconnect', async() => {
                console.log('Cliente Desconectado');
            });
        });
    }

}
 module.exports = Sockets;