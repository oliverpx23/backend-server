var express = require('express');
var bcrypt = require('bcryptjs');
var jwt = require('jsonwebtoken');
var SEED = require('../config/config').SEED;

var app = express();

var Usuario = require('../models/usuario');

//google
var CLIENT_ID = require('../config/config').CLIENT_ID;
const {OAuth2Client} = require('google-auth-library');
const client = new OAuth2Client(CLIENT_ID);





//=================================================================
// Autenticacion Google
//=================================================================

async function verify(token) {
    const ticket = await client.verifyIdToken({
        idToken: token,
        audience: CLIENT_ID,  // Specify the CLIENT_ID of the app that accesses the backend
        // Or, if multiple clients access the backend:
        //[CLIENT_ID_1, CLIENT_ID_2, CLIENT_ID_3]
    });
    const payload = ticket.getPayload();
    //const userid = payload['sub'];

    return {
        nombre: payload.name,
        email: payload.email,
        img: payload.picture,
        google: true,
    };
}


app.post('/google', async (req,resp) => {

    var token = req.body.token;

    var googleUser = await verify(token).catch( e => {
        return resp.status(403).json({
            ok: false,
            mensaje: 'Token no valido',
        });
    });


    Usuario.findOne({email: googleUser.email}, (err,usuarioDB) => {
        
        if(err) {
            return resp.status(500).json({
                ok: false,
                mensaje: 'Error al buscar Usuario',
                errors: err
            });
        }

        if(usuarioDB) {
            if  ( usuarioDB.google === false ) {
                return resp.status(500).json({
                    ok: false,
                    mensaje: 'Debe usar su autenticacion normal',
                });
            } else {
                usuarioDB.password = ':)';
                var token = jwt.sign({ usuario: usuarioDB }, SEED, { expiresIn: 14400 });
        
                resp.status(200).json({
                    ok: true,
                    usuarioDB: usuarioDB,
                    id: usuarioDB._id,
                    token: token
                });
            }

        } else {
            //el usuario no existe, y debe crearse
            var usuario = new Usuario();

            usuario.nombre = googleUser.nombre;
            usuario.email = googleUser.email;
            usuario.img = googleUser.img;
            usuario.google = true;
            usuario.password = ':)';

            usuario.save((err,usuarioDB) => {

                var token = jwt.sign({ usuario: usuarioDB }, SEED, { expiresIn: 14400 });
        
                resp.status(200).json({
                    ok: true,
                    usuarioDB: usuarioDB,
                    id: usuarioDB._id,
                    token: token
                });

            });
        }



    });

});


//=================================================================
// Autenticacion normal
//=================================================================

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