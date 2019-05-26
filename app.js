//Requires
var express = require('express');
var mongoose = require('mongoose');

var bodyParser = require('body-parser')

//inicializar variables
var app = express();

    //body parser
    app.use(bodyParser.urlencoded({extended:false}));
    app.use(bodyParser.json());


//importar rutas
var appRoutes = require('./routes/app');
var usuarioRoutes = require('./routes/usuario');
var loginRoutes = require('./routes/login');

// Conexion a la base de datos
mongoose.connection.openUri('mongodb://localhost:27017/HospitalDB', (err, resp)=>{
    if (err) throw err;
    console.log('base de datos: \x1b[32m%s\x1b[0m','online');
});

// Rutas
app.use('/login', loginRoutes);
app.use('/usuario', usuarioRoutes);
app.use('/', appRoutes);


// Escuchar Peticiones
app.listen(3000, () => {
    console.log('Express server puerto 3000: \x1b[32m%s\x1b[0m','online');
});