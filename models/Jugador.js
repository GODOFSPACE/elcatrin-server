const mongoose = require('mongoose');
const Sala = require('./Sala')

const JugadorSchema = mongoose.Schema({
    nombre:{
        type: String,
        required: true,
        trim: true
    },
    sala:{
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: Sala
    },
    cartas:{
        type: Array,
        required: true,
    },   
    ventas:{
        type: Object,
        default: {pan: 0, tamal: 0, aguacate: 0, pinata: 0, ilegal: 0}
    },
    dinero: {
        type: Number,    
        default: 50
    },
    personaje:{
        type: String,
        required: true
    },
    num:{
        type: String,
        required: true
    },
    catrin: {
        type: Boolean,
        default: false
    },
    soborno: {
        type: Object,
        default: {soborno: 0, revisar: false}
    },
    vida: {
        type: Date,
        default: Date.now,
        expires: 5400
    } 
});

module.exports = mongoose.model('Jugador', JugadorSchema);