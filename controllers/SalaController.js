const Sala = require('../models/Sala');
const {PersonajeAleatorio} = require('../helpers/GameHelpers');
// const {validationResult} = require('express-validator');

const crearSala = async(salaJugador) => {  
    const existeSala = await Sala.findOne({nombre: salaJugador});
    if(!existeSala){            
    //Crear una sala
    const sala = new Sala();
    //Guardar el nombre de la sala
    sala.nombre = salaJugador;
    //Guardamos los personajes
    sala.personajes = await PersonajeAleatorio();
    //Guardamos la sala
    await sala.save();
    return sala._id;
    }
    else{
        return existeSala._id;
    }
}

const aumentarVend = async(Id) => {
    let consulta = await Sala.findById(Id);
    await Sala.findByIdAndUpdate(Id, {numVende: ++consulta.numVende});
    if(consulta.numVende === consulta.jugadores-1)
        return true;
    else
        return false;
}

const decVend = async(Id) => {
    let consulta = await Sala.findById(Id);
    await Sala.findByIdAndUpdate(Id, {numVende: --consulta.numVende});
    return consulta.numVende;
}

const aumRonda = async(Id) => {
    let consulta = await Sala.findById(Id);
    await Sala.findByIdAndUpdate(Id, {ronda: ++consulta.ronda});
    if(consulta.ronda > consulta.jugadores)
        return -1;
    return consulta.ronda;
}

module.exports={
    crearSala,
    aumentarVend,
    decVend,
    aumRonda,
};