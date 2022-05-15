const Jugador = require('../models/Jugador');
const Sala = require('../models/Sala');
const {CartaAleatoria, RevisarMerc, SaltarMerc} = require('../helpers/GameHelpers');


const verificarSala=(sala)=>{
    return Sala.findOne({nombre:sala});
}

const crearJugador = async(sala, nombre) => {
    const Reconectar = await Jugador.findOne({sala: sala, nombre: nombre});
    if (!Reconectar){
        let aux  = await Sala.findById(sala);
        if(aux.inicio)
            return nombre;       
        const jugador = new Jugador();
        jugador.nombre = nombre;
        jugador.cartas = CartaAleatoria(6);
        jugador.personaje = aux.personajes.pop();
        jugador.catrin = aux.jugadores>0?false:true;
        jugador.num= ++aux.jugadores;
        jugador.sala= sala;
        //Guardamos el jugador
        await jugador.save();
        await Sala.findByIdAndUpdate(sala, {personajes: aux.personajes, jugadores: aux.jugadores});
        return jugador._id;
    }
    else
        return Reconectar._id;
}

const jugadoresSala = async(sala) => {   
    //Envia todos los jugadores conectados
    const jugadores = await Jugador.find({sala: sala}).sort({creado: -1});
    return jugadores;   
}

const iniciarPartida = async(sala) => {
    await Sala.findByIdAndUpdate(sala, {inicio: true, ronda: 1});
}

const regresarJugador = async(Id) => {   
    //Envia todos los jugadores conectados
    const jugador = await Jugador.findById(Id);
    return jugador;
}

const modDinero = async() =>{
    const sala = await verificarSala('MUSE');
    let jugador = await Jugador.findOne({sala: sala._id, nombre: 'Reny'});
    const actualizar = {};
    actualizar.dinero = 60;
    jugador = await Jugador.findByIdAndUpdate(jugador._id, actualizar, {new : true});
}

const modCartas = async(cartas, Id) =>{
    let actualizar = { cartas: cartas };
    for(let i=0; i<6; i++)
        if(actualizar.cartas[i].selector === true)
            actualizar.cartas[i] = await CartaAleatoria(1)[0];
    const jugador = await Jugador.findByIdAndUpdate(Id, actualizar, {new: true});
    return jugador;
}

const guardarCartas = async(cartas, Id) =>{
    let actualizar = { cartas: cartas };
    await Jugador.findByIdAndUpdate(Id, actualizar);
}

const Declarar = async(articulo, Id)=>{
    const actualizar = {declarar: articulo};
    await Jugador.findByIdAndUpdate(Id, actualizar, {new:true});
}
const guardarSoborno = async (dinero, revisar, Id) => {
    await Jugador.findByIdAndUpdate(Id, {soborno: {soborno: dinero, revisar: revisar}});
}
const consultarSobornos = async (Id) => {
    return await Jugador.find({sala: Id}).select('nombre personaje soborno').sort({creado: -1});
}
const cambiarCatrin = async(num, Id) => {
    await Jugador.findOneAndUpdate({sala: Id, num: num-1}, {catrin: false});
    return await Jugador.findOneAndUpdate({sala: Id, num: num}, {catrin: true}, {new: true});
}
const Vender = async(IdCatrin, dineroCatrin, mercader, revisar) => {
    const aux = revisar?RevisarMerc(mercader): SaltarMerc(mercader);
    for(let i=0; i<6; i++){
        if(mercader.cartas[i].selector === true)
            mercader.cartas[i] = await CartaAleatoria(1)[0];
    }
    if(aux.catrin!==0)
        await Jugador.findByIdAndUpdate(IdCatrin, {dinero: dineroCatrin+aux.catrin});
    await Jugador.findByIdAndUpdate(mercader._id, {dinero: mercader.dinero+aux.jugador,cartas: mercader.cartas, ventas: aux.ventas});
}
const Sobornar = async(IdCatrin, soborno, salaId ) => {
    const {_id} = soborno;
    let auxA = await Jugador.findById(IdCatrin);
    let auxB = await Jugador.findById(_id);
    await Jugador.findByIdAndUpdate(IdCatrin, {dinero: auxA.dinero+soborno.soborno.soborno});
    await Jugador.findByIdAndUpdate(_id, {dinero: auxB.dinero-soborno.soborno.soborno});    
}
const ReiniciarSobornos = async(salaId) => {
    await Jugador.updateMany({sala: salaId}, {soborno: {soborno: 0, revisar: false}});
}
const Bonificaciones = async(jugadores) => {
    let maxPan = jugadores[0].ventas.pan;
    let maxTamal = jugadores[0].ventas.tamal;
    let maxAguacate = jugadores[0].ventas.aguacate;
    let maxPinata = jugadores[0].ventas.pinata;
    let maxIlegal = jugadores[0].ventas.ilegal;
    for(let i = 0; i<jugadores.length; i++){
        if(jugadores[i].ventas.pan>maxPan){
            maxPan=jugadores[i].ventas.pan
        }
        if(jugadores[i].ventas.tamal>maxTamal){
            maxTamal=jugadores[i].ventas.tamal
        }
        if(jugadores[i].ventas.aguacate>maxAguacate){
            maxAguacate=jugadores[i].ventas.aguacate
        }
        if(jugadores[i].ventas.pinata>maxPinata){
            maxPinata=jugadores[i].ventas.pinata
        }
        if(jugadores[i].ventas.ilegal>maxIlegal){
            maxIlegal=jugadores[i].ventas.ilegal
        }
    }
    const Panadero = jugadores.filter(jugador=>jugador.ventas.pan === maxPan);
    Panadero.map(jugador => jugador.dinero += 20);
    const Tamalero = jugadores.filter(jugador=>jugador.ventas.tamal === maxTamal);
    Tamalero.map(jugador => jugador.dinero += 15);
    const Aguacatero = jugadores.filter(jugador=>jugador.ventas.aguacate === maxAguacate);
    Aguacatero.map(jugador => jugador.dinero += 15);
    const Chapo = jugadores.filter(jugador=>jugador.ventas.ilegal === maxIlegal);
    Chapo.map(jugador => jugador.dinero += 15);
    const Pinatero = jugadores.filter(jugador=>jugador.ventas.pinata === maxPinata);
    Pinatero.map(jugador => jugador.dinero += 10);
    const Posiciones = jugadores.sort((a,b)=>a.dinero-b.dinero).reverse();
    return Ganadores = {panadero: Panadero, tamalero: Tamalero, aguacatero: Aguacatero, chapo: Chapo, pinatero: Pinatero, posiciones: Posiciones}
}

const eliminarJugadores = async(Id) => {
    await Jugador.deleteMany({sala: Id});
}

module.exports={
    crearJugador,
    jugadoresSala,
    iniciarPartida,
    regresarJugador,
    modDinero,
    modCartas,
    guardarCartas,
    Declarar,
    guardarSoborno,
    consultarSobornos,
    cambiarCatrin,
    Vender,
    Sobornar,
    ReiniciarSobornos,
    Bonificaciones,
    eliminarJugadores
};