var jwt = require('jsonwebtoken');
var SEED = require('../config/config').SEED;


exports.verificaToken = function(req,resp,next) {

    var token = req.query.token;
    jwt.verify(token, SEED, (err,decoded) => {
        if(err) {
            return res.status(401).json({
                ok: false,
                mensaje: 'Token invalido',
                errors: err
            }); 
        }

        //se envia la informacion del usuario que hizo la peticion
        req.usuario = decoded.usuario;
        next();

        //res.status(200).json({
        //    ok: true,
        //    decoded: decoded
        //});

    });
};
