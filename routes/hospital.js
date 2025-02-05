var express = require('express');


var mdAutenticacion = require('../middleware/autenticacion');

var app = express();


var Hospital = require('../models/hospital');

//======================================
// Obtener todos los hospitales
//======================================

app.get('/', (req, res) => {

    var desde = req.query.desde || 0;
    desde = Number(desde);

    Hospital.find({})
        .skip(desde)
        .limit(5)
        .populate('usuario', 'nombre email')
        .exec(
            (err, hospitales) => {

                if (err) {
                    return res.status(500).json({
                        ok: false,
                        mensaje: 'Error cargando hospitales',
                        errors: err
                    });
                }


                Hospital.count({},(err,conteo) => {

                    res.status(200).json({
                        ok: true,
                        hospitales: hospitales
                    });
                });


            });
});



//======================================
// Insertar Hospital
//======================================
app.post('/', mdAutenticacion.verificaToken, (req, resp) => {
    var body = req.body;

    var hospital = new Hospital({
        nombre: body.nombre,
        usuario: req.usuario._id
    });

    hospital.save((err, hospitalGuardado) => {
        if (err) {
            return resp.status(400).json({
                ok: false,
                mensaje: 'Error insertando hospital',
                errors: err
            });
        }

        resp.status(201).json({
            ok: true,
            hospital: hospitalGuardado,
            usuarioTk: req.usuario
        });

    });

});



//======================================
// Actualizar usuarios
//======================================

app.put('/:id', mdAutenticacion.verificaToken, (req, res) => {
    var id = req.params.id;
    var body = req.body;

    Hospital.findById(id, (err, hospital) => {

        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al buscar Hospital',
                errors: err
            });
        }

        if( !hospital )
        {
            return res.status(400).json({
                ok: false,
                mensaje: 'El hospital con el id: ' + id + ' no existe',
                errors: { message: 'No existe un hospital con ese ID' }
            });
        }

        hospital.nombre = body.nombre;
        hospital.usuario = req.usuario._id;

        hospital.save( (err, hospitalGuardado) => {
            if (err) {
                return res.status(400).json({
                    ok: false,
                    mensaje: 'Error al actualizar hospital',
                    errors: err
                });
            }

            res.status(200).json({
                ok: true,
                hospital: hospitalGuardado
            });

        });

    });


});


app.delete('/:id', mdAutenticacion.verificaToken, (req, resp) => {
    var id = req.params.id;

    Hospital.findByIdAndRemove(id, (err, hospitalBorrado) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al borrar hospital',
                errors: err
            });
        }

        if (!hospitalBorrado) {
            return resp.status(500).json({
                ok: false,
                mensaje: 'No existe un hospital con ese ID',
                errors: err
            });
        }

        resp.status(200).json({
            ok: true,
            mensaje: 'Hospital Borrado Correctamente',
            hospital: hospitalBorrado
        });

    });
});


module.exports = app;