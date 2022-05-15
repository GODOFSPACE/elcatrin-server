const WeightedList = require('js-weighted-list');
const CartaAleatoria=(cantidad)=>{
    let mazo = [
        { key: 'Pan', weight: 40, 'data':{nombre: 'pan', precio: 2, legal: true, selector: false} },
        { key: 'Tamal', weight: 28, 'data':{nombre: 'tamal', precio: 3, legal: true, selector: false} },
        { key: 'Aguacate', weight: 28, 'data':{nombre: 'aguacate', precio: 3, legal: true, selector: false} },
        { key: 'Pinata', weight: 26, 'data':{nombre: 'pinata', precio: 4, legal: true, selector: false} },

        { key: 'Tequila', weight: 30, 'data':{nombre: 'tequila', precio: 12, legal: false, selector: false} },
        { key: 'Axolote', weight: 26, 'data':{nombre: 'axolote', precio: 14, legal: false, selector: false} },
        { key: 'Petardos', weight: 18, 'data':{nombre: 'petardos', precio: 16, legal: false, selector: false} },
        { key: 'Machete', weight: 12, 'data':{nombre: 'machete', precio: 18, legal: false, selector: false} },
    ]
    let cartas = [];
    const selector = new WeightedList(mazo);
    for(let i=0; i<cantidad; i++){
        cartas = [...cartas, selector.peek()[0].data];
    }
    return cartas;
}
const PersonajeAleatorio=()=>{
    let arreglo = [['A',1],['B',1],['C',1],['D',1],['E',1],['F',1]]; 
    const personaje = new WeightedList(arreglo);
    return personaje.shuffle();
}

const RevisarMerc=(mercader)=>{
    const cartas = mercader.cartas.filter(carta => carta.selector);    
    let Revision = {jugador:0, catrin: 0, ventas: mercader.ventas};
    let Ilegal = false;
    for(let i = 0; i<cartas.length; i++){
        if(!cartas[i].legal)
            Ilegal=true;
    }
    if(Ilegal){ 
        for(let i=0; i<cartas.length; i++){            
            if(!cartas[i].legal){
                Revision.jugador-=6;
                Revision.catrin+=6;
            }
        }
    }
    else{ 
        for(let i=0; i<cartas.length; i++){            
            aumVentas(Revision.ventas, cartas[i].nombre);
            Revision.jugador+=cartas[i].precio+2;
            Revision.catrin-=2;            
        }
    }    
    return Revision;
}

const SaltarMerc = (mercader) => {
    const cartas = mercader.cartas.filter(carta => carta.selector);
    let Revision = {jugador:0, catrin:0, ventas: mercader.ventas};
    for(let i=0; i<cartas.length; i++){
        aumVentas(Revision.ventas, cartas[i].nombre);
        Revision.jugador+= cartas[i].precio;
    }   
    return Revision;
}

const aumVentas = (ventas, nombre) => {
    switch(nombre){
        case 'pan':
            ventas.pan++;
        break;
        case 'tamal':
            ventas.tamal++;
        break;
        case 'aguacate':
            ventas.aguacate++;
        break;
        case 'pinata':
            ventas.pinata++;
        break;
        default:
            ventas.ilegal++;
        break;
    }
}

module.exports={
    CartaAleatoria,    
    PersonajeAleatorio,
    RevisarMerc,
    SaltarMerc
};