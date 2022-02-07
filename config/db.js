const mongoose = require('mongoose');
const conectarBD = async() => {
    try {
        await mongoose.connect(process.env.DB_MONGO, {/* Configuraciones mongo */});    
    }catch (error) {
        console.log(error);
        process.exit(1); //Detener la app
    }
}
module.exports = conectarBD;