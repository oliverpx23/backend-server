var express = require('express');
var bcrypt = require('bcryptjs');
var jwt = require('jsonwebtoken');
var SEED = require('../config/config').SEED;

var app = express();

var Usuario = require('../models/usuario');


app.post('/', (req,resp) => {

    var body = req.body;

    Usuario.findOne({ email: body.email}, (err, usuarioDB) => {

        if(err) {
            return resp.status(500).json({
                ok: false,
                mensaje: 'Error al buscar Usuario',
                errors: err
            });
        }

        if(!usuarioDB) {
            return resp.status(400).json({
                ok:false,
                mensaje: 'Credenciales incorrectas - email',
                errors: err
            });
        }

        if(!bcrypt.compareSync(body.password, usuarioDB.password))
        {
            return resp.status(400).json({
                ok: false,
                mensaje: 'Credenciales incorrectas - password',
                errors: err
            });
        }

        //crear token
        usuarioDB.password = ':)';
        var token = jwt.sign({ usuario: usuarioDB }, SEED, { expiresIn: 14400 });


        resp.status(200).json({
            ok: true,
            usuarioDB: usuarioDB,
            id: usuarioDB._id,
            token: token
        });

    });

});


module.exports = app;