var express = require('express');
var fileUpload = require('express-fileupload');
var fs = require('fs');

var app = express();

var Usuario = require('../models/usuario');
var Medico = require('../models/medico');
var Hospital = require('../models/hospital');


app.use(fileUpload());


app.put('/:tipo/:id', (req, resp, next) => {

    var tipo = req.params.tipo;
    var id = req.params.id;

    // tipos de coleccion
    var tiposValidos = ['hospitales', 'medicos','usuarios'];
    if ( tiposValidos.indexOf(tipo) < 0 ) {
        return resp.status(400).json({
            ok: false,
            mensaje: 'Tipo de coleccion no es valida',
            errors: { message: 'Tipo de coleccion no es valida' }
        });
    }

    if(!req.files) {
        return resp.status(400).json({
            ok: false,
            mensaje: 'No selecciono nada',
            errors: { message: 'Debe seleccionar una imagen' }
        });
    }

    //obtener nombre del archivo
    var archivo = req.files.imagen;
    var nombreCortado = archivo.name.split('.');
    var extensionArchivo = nombreCortado[nombreCortado.length-1];

    //solo estas extensiones
    var extensionesValidas = ['png','jpg','gif','jpeg'];

    if(extensionesValidas.indexOf(extensionArchivo) < 0) {
        return resp.status(400).json({
            ok: false,
            mensaje: 'Extension no valida',
            errors: { message: 'Las extensiones validas son ' + extensionesValidas.join(', ') }
        });
    }


    // Nombre de archivo personalizado
    var nombreArchivo = `${id}-${ new Date().getMilliseconds()}.${extensionArchivo}`;

    // Mover el archivo del temporal a un path
    var path = `./uploads/${tipo}/${nombreArchivo}`;

    archivo.mv( path, err => {
        if(err) {
            return resp.status(500).json({
                ok: false,
                mensaje: 'Error al mover archivo',
                errors: err
            });  
        }
    });

    subirPorTipo( tipo, id, nombreArchivo, resp );

});


function subirPorTipo( tipo, id, nombreArchivo, res ) {


    if (tipo === 'usuarios') {
        Usuario.findById(id, (err, usuario) => {

            if(err) {
                return res.status(400).json({
                    ok: false,
                    mensaje: 'no se encontro Hospital con ese Id',
                    errors: err
                });  
            }

            if(!medico) {
                return res.status(400).json({
                    ok: false,
                    mensaje: 'No existe el usuario',
                });  
            }


            var pathAntiguo = './uploads/usuarios/' + usuario.img;
            // si existe, elimina
            if( fs.existsSync(pathAntiguo)) {
                fs.unlinkSync(pathAntiguo);
            }

            usuario.img = nombreArchivo;

            usuario.save((err, usuarioActualizado) => {

                if(err) {
                    return res.status(500).json({
                        ok: false,
                        mensaje: 'Error al actualizar el usuario',
                        errors: err
                    });  
                }

                usuarioActualizado.password = ':)';
                return res.status(200).json({
                    ok: true,
                    mensaje: 'Usuario Actualizado',
                    usuario: usuarioActualizado
                });  

            });

        });
    }   


    if (tipo === 'medicos') {
        Medico.findById(id, (err, medico) => {

            if(err) {
                return res.status(400).json({
                    ok: false,
                    mensaje: 'no se encontro Hospital con ese Id',
                    errors: err
                });  
            }

            if(!medico) {
                return res.status(400).json({
                    ok: false,
                    mensaje: 'No existe el medico',
                });  
            }

            var pathAntiguo = './uploads/medicos/' + medico.img;
            // si existe, elimina
            if( fs.existsSync(pathAntiguo)) {
                fs.unlinkSync(pathAntiguo);
            }

            medico.img = nombreArchivo;

            medico.save((err, medicoActualizado) => {

                if(err) {
                    return res.status(500).json({
                        ok: false,
                        mensaje: 'Error al actualizar el Medico',
                        errors: err
                    });  
                }


                return res.status(200).json({
                    ok: true,
                    mensaje: 'Medico Actualizado',
                    medico: medicoActualizado
                });  

            });

        });
    }

    if (tipo === 'hospitales') {
        Hospital.findById(id, (err, hospital) => {

            if(err) {
                return res.status(400).json({
                    ok: false,
                    mensaje: 'Error al buscar hospital',
                    errors: err
                });  
            }

            if(!hospital) {
                return res.status(400).json({
                    ok: false,
                    mensaje: 'No existe el hospital'
                });  
            }

            var pathAntiguo = './uploads/hospitales/' + hospital.img;
            // si existe, elimina
            if( fs.existsSync(pathAntiguo)) {
                fs.unlinkSync(pathAntiguo);
            }

            hospital.img = nombreArchivo;

            hospital.save((err, hospitalActualizado) => {

                if(err) {
                    return res.status(500).json({
                        ok: false,
                        mensaje: 'Error al actualizar el Hospital',
                        errors: err
                    });  
                }


                return res.status(200).json({
                    ok: true,
                    mensaje: 'Hospital Actualizado',
                    hospital: hospitalActualizado
                });  

            });

        });     
    }
}

module.exports = app;