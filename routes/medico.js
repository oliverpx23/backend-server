var express = require('express');


var mdAutenticacion = require('../middleware/autenticacion');

var app = express();


var Medico = require('../models/medico');

//======================================
// Obtener todos los medicos
//======================================

app.get('/', (req, res) => {

    var desde = req.query.desde || 0;
    desde = Number(desde);

    Medico.find({})
        .skip(desde)
        .limit(5)
        .populate('usuario', 'nombre email')
        .populate('hospital')
        .exec(
            (err, medicos) => {

                if (err) {
                    return res.status(500).json({
                        ok: false,
                        mensaje: 'Error cargando medicos',
                        errors: err
                    });
                }


                Medico.count({},(err,conteo) => {
                    res.status(200).json({
                        ok: true,
                        medicos: medicos,
                        total: conteo
                    });
    
                });

            });
});



//======================================
// Insertar medico
//======================================
app.post('/', mdAutenticacion.verificaToken, (req, resp) => {
    var body = req.body;

    var medico = new Medico({
        nombre: body.nombre,
        hospital: body.hospital,
        usuario: req.usuario._id
    });

    medico.save((err, medicoGuardado) => {
        if (err) {
            return resp.status(400).json({
                ok: false,
                mensaje: 'Error insertando medico',
                errors: err
            });
        }

        resp.status(201).json({
            ok: true,
            medico: medicoGuardado,
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

    Medico.findById(id, (err, medico) => {

        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al buscar Medico',
                errors: err
            });
        }

        if( !medico )
        {
            return res.status(400).json({
                ok: false,
                mensaje: 'El medico con el id: ' + id + ' no existe',
                errors: { message: 'No existe un hospital con ese ID' }
            });
        }

        medico.nombre = body.nombre;
        medico.hospital = body.hospital;
        medico.usuario = req.usuario._id;

        medico.save( (err, medicoGuardado) => {
            if (err) {
                return res.status(400).json({
                    ok: false,
                    mensaje: 'Error al actualizar hospital',
                    errors: err
                });
            }

            res.status(200).json({
                ok: true,
                medico: medicoGuardado
            });

        });

    });


});


app.delete('/:id', mdAutenticacion.verificaToken, (req, resp) => {
    var id = req.params.id;

    Medico.findByIdAndRemove(id, (err, medicoBorrado) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al borrar medico',
                errors: err
            });
        }

        if (!medicoBorrado) {
            return resp.status(500).json({
                ok: false,
                mensaje: 'No existe un medico con ese ID',
                errors: err
            });
        }

        resp.status(200).json({
            ok: true,
            mensaje: 'Hospital Borrado Correctamente',
            medico: medicoBorrado
        });

    });
});


module.exports = app;