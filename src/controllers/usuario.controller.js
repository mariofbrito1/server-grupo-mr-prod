const { withConnection } = require('../../database/dbHelper'); // ✅ AGREGA ESTA LÍNEA
const jwt = require('jsonwebtoken');
const { generarJWT } = require('../helpers/jwt');

var axios = require('axios');
var https = require('node:https');

// Nodejs encryption   
var Cryptr = require('cryptr');
var nodemailer = require('nodemailer');

// Verifica que no haya espacios o caracteres especiales
//console.log('Clave Cryptr actual:', 'mrTrasnsp');
//console.log('Longitud de la clave:', 'mrTrasnsp'.length);

// Si necesitas cambiar la clave, hazlo consistentemente
const CRYPTR_KEY = process.env.CRYPTR_SECRET || 'mrTrasnsp';
const cryptr = new Cryptr(CRYPTR_KEY);
const ROL_ADMIN = 1;

// FUNCIONES ACTUALIZADAS CON MANEJO SEGURO DE CONEXIONES

const login = async (req, res) => {
    await withConnection(async (client) => {
        console.log("login");
        try {
            const { username, password } = req.body;
            console.log("login -->", username, password);
            
            if (!username || !password) {
                return res.status(401).json({ message: 'El usuario o contraseña ingresados no son válidos'});
            }

            const response = await client.query('SELECT * FROM public."usuario" WHERE email = $1 ', [username]);
            if (!response.rows.length) {
                console.log("USER NO");
                return res.status(401).json({ message: 'El usuario ingresado no existe'});
            }
            
            const userActive = await client.query(`SELECT U.id 
                                                    FROM public.USUARIO U  
                                                    INNER JOIN public.usuario_rol UR ON Ur.id_usuario = u.id 
                                                    WHERE (UR.id_rol = 1 ) AND email = $1`, [username]);
            

            const user = response.rows[0];
            if (!user.activo) {
                console.log("usuario esta desactivado o bloqueado!");
                return res.status(401).json({ message: 'El usuario esta desactivado o bloqueado!'});
            }
            
            if (user.restaurar !== null) {
                const { restaurar: hash } = user;
                if (password !== hash) {
                    return res.status(401).json({ 
                        message: 'Ha solicitado un cambio de contraseña. Por favor ingrese la contraseña que fue enviada a la dirección de Email.' 
                    });
                }
                return res.status(200).json({
                    changePassword: true,
                    message: 'Ingrese una Nueva Contraseña'
                });
            }
            
            const decryptedPassword = cryptr.decrypt(user.password);
            console.log("decryptedPassword", decryptedPassword);
            
            if (password === decryptedPassword) {
                const token = await generarJWT(user.id, username); // ✅ CORREGIDO: usar user.id en lugar de password
                const { id, nombre, apellido, email, id_categoria, id_centro, legajo } = user;
                console.log("login ok", user);
                return res.status(200).json({ id, nombre, apellido, email, id_categoria, id_centro, token, legajo });
            } else {
                return res.status(401).json({ message: 'La Contraseña ingresada no es válida' });
            }
        } catch (err) {
            console.log("login err", err);
            return res.status(500).json({ 
                error: 'Ocurrió un error al intentar iniciar sesión', 
                message: err.message
            });
        }
    });
}

// ✅ ELIMINA esta función o mantenla comentada - NO USES pool.end() en producción
/*
async function resetAllPasswords() {
    const client = await pool.connect();
    
    try {
        console.log('🔧 Iniciando reparación de passwords...');
        
        const users = await client.query('SELECT id, legajo, password FROM public."usuario"');
        
        console.log(`📊 Encontrados ${users.rows.length} usuarios`);
        
        for (const user of users.rows) {
            try {
                cryptr.decrypt(user.password);
                console.log(`✓ Usuario ${user.id}: Password OK - No necesita reset`);
            } catch (error) {
                const newPassword = user.legajo ? user.legajo.toString() : '123456';
                const encryptedPassword = cryptr.encrypt(newPassword);
                
                await client.query(
                    'UPDATE public."usuario" SET password = $1 WHERE id = $2',
                    [encryptedPassword, user.id]
                );
                
                console.log(`🔄 Usuario ${user.id}: Password reseteado a "${newPassword}"`);
            }
        }
        
        console.log('✅ Reparación completada');
        
    } catch (error) {
        console.error('❌ Error en reparación:', error);
    } finally {
        client.release();
        // ❌ NO USES pool.end() - esto cierra el pool permanentemente
    }
}
*/

const getList = async (req, res) => {
    await withConnection(async (client) => {
        try {
            const usuarios = await client.query(`
                SELECT 
                    u.*,
                    r.nombre as rol
                FROM public."usuario" as u 
                INNER JOIN public."usuario_rol" as ur on (ur.id_usuario = u.id)
                INNER JOIN public."roles" as r on (r.id = ur.id_rol)
                ORDER BY id ASC
            `);
            res.status(200).json(usuarios.rows);
        } catch (err) {
            console.log("get usuarios err", err);
            res.status(500).json({ 
                error: 'Ocurrió un error al intentar obtener los usuarios', 
                message: err.message
            });
        }
    });
}

const getListNac = async (req, res) => {
    console.log("get nacionalidades")
    await withConnection(async (client) => {
        try {
            const nac = await client.query(`
                SELECT *
                     
                FROM public."nacionalidad"   
                ORDER BY id ASC
            `);
            console.log("get nacionalidades",  nac.rows);
            res.status(200).json(nac.rows);
        } catch (err) {
            console.log("get nac err", err);
            res.status(500).json({ 
                error: 'Ocurrió un error al intentar obtener los nacionalidad', 
                message: err.message
            });
        }
    });
}

const getById = async (req, res) => {
    await withConnection(async (client) => {
        try {
            const id = req.params.id;
            const query = `SELECT id, nombre, apellido, fecha_creado, legajo, email_notificacion, password, id_centro, id_sector, id_categoria, activo
                FROM public."usuario"
                WHERE id = $1`;
                
            const usuario = await client.query(query,[id]);
            if (!usuario.rows.length) {
                return res.status(404).json({ message: 'Usuario no encontrado'});
            }
            
            const rolDelUsuario = await client.query(`
                SELECT * FROM "public".usuario_rol AS usuario_rol
                WHERE usuario_rol.id_usuario = $1
            `, [id]);
            
            const id_rol = rolDelUsuario.rows.length ? rolDelUsuario.rows[0].id_rol : '';
            return res.status(200).json({ ...usuario.rows[0], id_rol });
        } catch (err) {
            return res.status(500).json({ 
                error: 'Ocurrió un error al intentar obtener el usuario', 
                message: err.message
            });
        }
    });
}

const insert = async (req, res) => {
    await withConnection(async (client) => {
        try {
            const { 
                nombre, 
                apellido, 
                legajo, 
                email, 
                password,
                id_rol,
                id_centro,
                id_categoria,
                id_sector
            } = req.body;
            
            // Validaciones
            const centro = await client.query('SELECT * FROM public."centro" WHERE id = $1', [id_centro]);
            if (centro.rows.length === 0) {
                return res.status(400).json({ error: 'El centro ingresado no es válido' });
            }
            
            const sector = await client.query('SELECT * FROM public."sector" WHERE id = $1', [id_sector]);
            if (sector.rows.length === 0) {
                return res.status(400).json({ error: 'El sector ingresado no es válido' });
            }
            
            const rol = await client.query('SELECT * FROM public."roles" WHERE id = $1', [id_rol]);
            if (rol.rows.length === 0) {
                return res.status(400).json({ error: 'El rol ingresado no es válido' });
            }
            
            const checkLegajo = await client.query('SELECT * FROM public."usuario" WHERE legajo = $1', [legajo]);
            if (checkLegajo.rows.length) {
                return res.status(400).json({ error: 'El legajo ingresado ya existe' });
            }
            
            const checkEmail = await client.query('SELECT * FROM public."usuario" WHERE email = $1', [email]);
            if (checkEmail.rows.length) {
                return res.status(400).json({ error: 'El email ingresado ya existe' });
            }
            
            const encryptedPassword = cryptr.encrypt(password);
            const fecha_creado = new Date();
            
            const nuevoUsuario = await client.query(`
                INSERT INTO public."usuario" (nombre, apellido, fecha_creado, legajo, email, password, id_centro, id_sector, cliente_sap, id_categoria) 
                VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) 
                RETURNING id, nombre, apellido, fecha_creado, legajo, email, password, id_centro, id_sector, cliente_sap
            `, [nombre, apellido, fecha_creado, legajo, email, encryptedPassword, id_centro, id_sector, legajo, id_categoria]);
            
            const idUser = nuevoUsuario.rows[0].id;
            await client.query(`
                INSERT INTO public."usuario_rol" (id_usuario, id_rol)
                VALUES ($1, $2)
            `, [idUser, id_rol]);
            
            return res.status(201).json({
                success: 'Usuario creado exitosamente',
                nuevoUsuario: nuevoUsuario.rows[0]
            });
        } catch (err) {
            return res.status(500).json({ 
                error: 'Ocurrió un error al intentar crear el usuario', 
                message: err.message
            });
        }
    });
}

const deleteById = async (req, res) => {
    await withConnection(async (client) => {
        try {
            const id = req.params.id;
            const usuario = await client.query('SELECT * FROM public."usuario" WHERE id = $1', [id]);
            if (!usuario.rows.length) {
                return res.status(404).json({ message: 'Usuario no encontrado'});
            }
            
            await client.query('DELETE FROM public."usuario_rol" WHERE id_usuario = $1', [id]);
            await client.query('DELETE FROM public."usuario" WHERE id = $1', [id]);
            
            return res.status(200).json({
                success: 'Usuario eliminado exitosamente',
                usuarioEliminado: usuario.rows[0]
            });
        } catch (err) {
            return res.status(500).json({ 
                error: 'Ocurrió un error al intentar eliminar el usuario', 
                message: err.message
            });
        }
    });
}

const update = async (req, res) => {
    await withConnection(async (client) => {
        try {
            const id = req.params.id;
            const user = await client.query('SELECT * FROM public."usuario" WHERE id = $1', [id]);
            if (!user.rows.length) {
                return res.status(404).json({ message: 'Usuario no encontrado'});
            }
            
            const { nombre, apellido, legajo, id_rol, id_centro, id_categoria, id_sector, email, activo } = req.body;
            
            // Validaciones
            const centro = await client.query('SELECT * FROM public."centro" WHERE id = $1', [id_centro]);
            if (centro.rows.length === 0) {
                return res.status(400).json({ error: 'El centro ingresado no es válido' });
            }
            
            const rol = await client.query('SELECT * FROM public."roles" WHERE id = $1', [id_rol]);
            if (rol.rows.length === 0) {
                return res.status(400).json({ error: 'El rol ingresado no es válido' });
            }
            
            const sector = await client.query('SELECT * FROM public."sector" WHERE id = $1', [id_sector]);
            if (sector.rows.length === 0) {
                return res.status(400).json({ error: 'El sector ingresado no es válido' });
            }
            
            const usuarioActualizado = await client.query(`
                UPDATE public."usuario" 
                SET nombre=$1, apellido=$2, legajo=$3, id_centro=$4, id_sector=$5, id_categoria=$6, email_notificacion=$7, activo=$8 WHERE id = $9
                RETURNING id, usuario, email_notificacion, legajo, nombre, apellido, id_centro, fecha_creado, id_sector, id_categoria
            `, [nombre, apellido, legajo, id_centro, id_sector, id_categoria, email, activo, id]);
            
            await client.query(`
                UPDATE public."usuario_rol"
                SET id_rol=$1
                WHERE id_usuario=$2
            `, [id_rol, id]);
            
            return res.status(200).json({
                success: 'Usuario actualizado exitosamente',
                usuarioActualizado: { ...usuarioActualizado.rows[0], id_rol, id_categoria, id_sector }
            });
        } catch (err) {
            console.log("user update err", err);
            return res.status(500).json({ 
                error: 'Ocurrió un error al intentar actualizar el usuario', 
                message: err.message
            });
        }
    });
}

// Las funciones que no usan la base de datos se mantienen igual
const renew = async (req, res) => {
    const { token } = req.body;
    if (!token) {
        return res.status(401).json({
            ok: false,
            msg: 'No hay token en la petición'
        });
    }
    try {
        jwt.verify(token, 'marfrig-Esto-Es-UnA-PalbR@_SecretA12341267');
        res.status(200).json({ valid: true, msg: 'Token válido' });
    } catch (error) {
        return res.status(401).json({
            valid: false,
            msg: 'Token no válido'
        });
    }
};

const resetPassword = async (req, res) => {
    await withConnection(async (client) => {
        try {
            const { email } = req.body;
            const response = await client.query('SELECT * FROM public."usuario" WHERE email = $1', [email]);
            console.log("Recovery pass resp-->", response.rows.length, response.rows[0]);
            
            const hash = Math.random().toString(16).slice(8);
            const email_notify = 'mariofbrito@gmail.com';
            
            // Configuración de email...
            const password_aplicacion = 'Samsung,2023';
            var transport = {
                host: 'smtp.office365.com',
                port: 465,
                secure: true,
                auth: {
                    user: 'S0001130@marfrig.com',
                    pass: password_aplicacion,
                },
            };
            
            var smtpTrans = nodemailer.createTransport(transport);
            const mailContent = `<html><body><table><tr><td>Name: </td>Hola ${email}, vimos que solicitaste un cambio de contraseña, utiliza el siguiente codigo para acceder al sistema<td></td></tr><tr><td>Codigo: </td><td>${hash}</td></tr></table></body></html>`;
            
            const mailOpts = {
                from: 'info.marfrig.ventas@gmail.com',
                to: email_notify,
                text: "abc",
                subject: 'CAMBIO DE CONTRASEÑA SISTEMA MARFRIG',
                html: mailContent,
            };
            
            console.log("envia hash-->", hash);
            await client.query('UPDATE public."usuario" SET restaurar = $1 WHERE email = $2', [hash, email]);
            
            if (response.rows.length) {
                smtpTrans.verify((error, success) => {
                    console.log("success-->", success);
                    if (error) {
                        console.log("Error mensaje: ", error);
                    } else {
                        console.log('Server is ready to take messages');
                        smtpTrans.sendMail(mailOpts, (error, result) => {
                            if (error) {
                                console.log("error send: --> ", error);
                                return;
                            }
                            console.log('*** success send ***');
                        });
                    }
                });
            }
            
            return res.status(200).json({ message: 'Instrucciones enviadas al email' });
        } catch (e) {
            console.log("error general-->", e);
            return res.status(400).json({ error: 'Error al procesar la solicitud' });
        }
    });
};

const changePassword = async (req, res) => {
    await withConnection(async (client) => {
        try {
            const { email, password, repeatPassword, restaurar = false } = req.body;

            if (!email || !password || !repeatPassword) {
                return res.status(400).json({ message: 'Uno o más campos están vacíos' });
            }
            
            const response = await client.query('SELECT * FROM public."usuario" WHERE email = $1', [email]);
            if (!response.rows.length) {
                return res.status(400).json({ message: 'El usuario ingresado no existe'});
            }
            
            const user = response.rows[0];
            if (user.restaurar === null && restaurar === false) {
                return res.status(400).json({ message: 'El usuario ingresado no ha solicitado cambio de contraseña' });
            }
            
            if (password.length < 6 || repeatPassword.length < 6) {
                return res.status(400).json({ message: 'Las contraseñas deben tener al menos 6 caracteres' });
            }
            
            if (password !== repeatPassword) {
                return res.status(400).json({ message: 'Las contraseñas no coinciden' });
            }
            
            const newPassword = cryptr.encrypt(password);
            await client.query('UPDATE public."usuario" SET password = $1, restaurar = $2 WHERE email = $3', [newPassword, null, email]);
            
            return res.status(200).json({ message: 'La contraseña se cambió exitosamente. Ya puede iniciar sesión.' });
        } catch (err) {
            return res.status(500).json({
                error: 'Ocurrió un error al intentar cambiar la contraseña. Por favor intente de nuevo más tarde.',
                message: err.message
            });
        }
    });
};
 

module.exports = {
    getList,
    getListNac,
    getById,
    insert,
    update,
    deleteById,
    login,
    renew,
    resetPassword,
    changePassword, 
};