var express = require('express');

var app = express();

var Hospital = require('../models/hospital');
var Medico = require('../models/medico');
var Usuario = require('../models/usuario');


//======================================================
//Busqueda por tabla especifica
//======================================================


app.get('/coleccion/:tabla/:busqueda', (req, res) => {
    var busqueda = req.params.busqueda;
    var tabla = req.params.tabla;
    var regex = new RegExp(busqueda, 'i');

    var promesa;

    switch(tabla) {

        case 'usuarios':
            promesa = buscarUsuarios(busqueda,regex);
        break;

        case 'medicos':
            promesa = buscarMedicos(busqueda,regex);
        break;

        case 'hospitales':
            promesa = buscarHospitales(busqueda,regex);
        break;

        default:
            return res.status(400).json({
                ok: false,
                mensaje: 'Los tipos de busqueda solo son: usuarios, medicos y hospitales',
                error: { message: 'Tipo de tabla/coleccion no valido'}
            });
    }

    promesa.then( data => {
        return res.status(200).json({
            ok: false,
            [tabla]: data
        });
    });

});

//======================================================
// Busqueda por todo, General
//======================================================
app.get('/todo/:busqueda', (req, resp) => {

    var busqueda = req.params.busqueda;
    var regex = new RegExp(busqueda, 'i');  //expresion regular para insensibilidad mayuscula y minuscula

    Promise.all([ 
        buscarHospitales(busqueda, regex),
        buscarMedicos(busqueda, regex),
        buscarUsuarios(busqueda,regex)
    ])
    .then(respuestas => {
        resp.status(200).json({
            ok: true,
            hospitales: respuestas[0],
            medicos: respuestas[1],
            usuarios: respuestas[2],
        });
    });

});



function buscarHospitales(busqueda, regex) {

    return new Promise((resolve,reject) => {
    
        Hospital.find({ 'nombre': regex })
        .populate('usuario','nombre email')
        .exec((err, hospitales) => {

            if(err) {
                reject('Error al cargar Hhospitales',err);
            } else {
                resolve(hospitales);
            }
    
        });
    });
}


function buscarMedicos(busqueda, regex) {

    return new Promise((resolve,reject) => {
    
        Medico.find({ 'nombre': regex })
        .populate('usuario','nombre email')
        .populate('hospital','nombre')
        .exec((err, medicos) => {

            if(err) {
                reject('Error al cargar Medicos',err);
            } else {
                resolve(medicos);
            }
    
        });
    });
}

function buscarUsuarios(busqueda, regex) {

    return new Promise((resolve,reject) => {
    
        Usuario.find({}, 'nombre email img role')
        .or([{ 'nombre': regex }, { 'email': regex }])
        .exec((err,usuarios) => {
            if(err) {
                reject('Error al buscar los usuario',err);
            } else {
                resolve(usuarios);
            }
        });
    });
}

module.exports = app;