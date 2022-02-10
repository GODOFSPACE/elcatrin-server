const mongoose = require('mongoose');

const SalaSchema = mongoose.Schema({
    nombre:{
        type: String,
        required: true,
        trim: true
    },
    personajes:{
        type: Array,
        required: true
    },
    jugadores:{
        type: Number,
        default: 0
    },
    ronda:{
        type: Number,
        default: 0
    },
    numVende:{
        type: Number,
        default: 0
    },
    revisando: {
        type: Boolean,
        default: false
    },
    inicio: {
        type: Boolean,
        default: false
    }
});

module.exports = mongoose.model('Sala', SalaSchema);