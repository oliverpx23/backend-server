//Requires
var express = require('express');
var mongoose = require('mongoose');

//inicializar variables
var app = express();


// Conexion a la base de datos
mongoose.connection.openUri('mongodb://localhost:27017/HospitalDB', (err, resp)=>{
    if (err) throw err;
    console.log('base de datos: \x1b[32m%s\x1b[0m','online');
})

// Rutas
app.get('/', (req, resp, next) => {
    resp.status(200).json({
        ok: true,
        mensaje: 'Peticion realizada correctamente'
    })

});

// Escuchar Peticiones
app.listen(3000, () => {
    console.log('Express server puerto 3000: \x1b[32m%s\x1b[0m','online');
});