const { Pool } = require('pg');
const config = require('../config');
const jwt = require('jsonwebtoken');
const { generarJWT } = require('../helpers/jwt');

var axios = require('axios');
var https = require('node:https');
const pool = new Pool(config);

// Nodejs encr yption 
var Cryptr = require('cryptr');
var nodemailer = require('nodemailer');
const cryptr = new Cryptr('mfgElab');
const ROL_ADMIN = 1;

const login = async (req, res) => {
    try {
        const { username, password } = req.body;
        if (!username || !password) {
            res.status(401).json({ message: 'El usuario o contraseña ingresados no son válidos'});
            return;
        }

        const response = await pool.query('SELECT * FROM public."usuario" WHERE email = $1 ', [username]);
        if (!response.rows.length) {
            res.status(401).json({ message: 'El usuario ingresado no existe'});
            return;
        }
        
        const userActive = await pool.query(`SELECT U.id 
                                                FROM public.USUARIO U 
                                                INNER JOIN public.CENTRO C ON C.Id = U.id_centro 
                                                INNER JOIN public.usuario_rol UR ON Ur.id_usuario = u.id 
                                                WHERE (UR.id_rol = 1 OR C.activo= true) AND email = $1`, [username]);
        if (!userActive.rows.length) {
             res.status(401).json({ message: 'El usuario ingresado no tiene asignado un centro habilitado'});
             return;
        }

        const user = response.rows[0];
        if (!user.activo) {
            res.status(401).json({ message: 'El usuario esta desactivado o bloqueado!'});
            return;
        }
        if (user.restaurar !== null) {
            const { restaurar: hash } = user;
            if (password !== hash) {
                res.status(401).json({ 
                    message: 
                        'Ha solicitado un cambio de contraseña. Por favor ingrese la contraseña que fue enviada a la dirección de Email.' 
                    });
                return;
            }
            res.status(200).json({
                changePassword: true,
                message: 'Ingrese una Nueva Contraseña'
            });
            return;
        }
        const decryptedPassword = cryptr.decrypt(user.password);
        if (password === decryptedPassword) {
            const token = await generarJWT(password, username);
            const { id, nombre, apellido, email, id_categoria, id_centro, legajo } = user;
            res.status(200).json({ id, nombre, apellido, email, id_categoria, id_centro, token, legajo });
        } else {
            res.status(401).json({ message: 'La Contraseña ingresada no es válida' });
        }
    } catch (err) {
        res.status(500).json({ 
            error: 'Ocurrió un error al intentar iniciar sesión', 
            message: err.message
        });
    }
}

const getList = async (req, res) => {
    try {
        const usuarios = await pool.query(`
            SELECT 
                u.id,
                u.activo, 
                u.nombre, 
                u.apellido, 
                u.fecha_creado, 
                u.legajo, 
                u.email_notificacion, 
                email, 
                c.descripcion as categoria, 
                s.descripcion as sector, 
                ce.nombre as centro, 
                r.nombre as rol
                    FROM public."usuario" as u
                    INNER JOIN public."categoria" as c on (c.id = u.id_categoria)
                    INNER JOIN public."sector" as s on (s.id = u.id_sector)
                    INNER JOIN public."centro" as ce on (ce.id = u.id_centro)
                    INNER JOIN public."usuario_rol" as ur on (ur.id_usuario = u.id)
                    INNER JOIN public."roles" as r on (r.id = ur.id_rol)
                    ORDER BY id ASC
        `);
        res.status(200).json(usuarios.rows);
    } catch (err) {
        res.status(500).json({ 
            error: 'Ocurrió un error al intentar obtener los usuarios', 
            message: err.message
        });
    }
}

const getById = async (req, res) => {
    try {
        const id = req.params.id;

        const query = `SELECT id, nombre, apellido, fecha_creado, legajo, email_notificacion, password, id_centro, id_sector, id_categoria, activo
            FROM public."usuario"
            WHERE id = $1`
        const usuario = await pool.query(query,[id]);
        if (!usuario.rows.length) {
            res.status(404).json({ message: 'Usuario no encontrado'})
            return;
        }
        const rolDelUsuario = await pool.query(`
            SELECT * FROM "public".usuario_rol AS usuario_rol
            WHERE usuario_rol.id_usuario = $1
        `, [id]);
        const id_rol = rolDelUsuario.rows.length ? rolDelUsuario.rows[0].id_rol : ''
        res.status(200).json({ ...usuario.rows[0], id_rol });
    } catch (err) {
        res.status(500).json({ 
            error: 'Ocurrió un error al intentar obtener el usuario', 
            message: err.message
        });
    }
}

const insert = async (req, res) => {
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
        const centro = await pool.query('SELECT * FROM public."centro" WHERE id = $1', [id_centro]);
        if (centro.rows.length === 0) {
            res.status(400).json({ error: 'El centro ingresado no es válido' });
            return;
        }
        const sector = await pool.query('SELECT * FROM public."sector" WHERE id = $1', [id_sector]);
        if (sector.rows.length === 0) {
            res.status(400).json({ error: 'El sector ingresado no es válido' });
            return;
        }
        const rol = await pool.query('SELECT * FROM public."roles" WHERE id = $1', [id_rol]);
        if (rol.rows.length === 0) {
            res.status(400).json({ error: 'El rol ingresado no es válido' });
            return;
        }
        const checkLegajo = await pool.query('SELECT * FROM public."usuario" WHERE legajo = $1', [legajo]);
        if (checkLegajo.rows.length)
        {
            res.status(400).json({ error: 'El legajo ingresado ya existe' });
            return;
        }
        const checkEmail = await pool.query('SELECT * FROM public."usuario" WHERE email = $1', [email]);
        if (checkEmail.rows.length) {
            res.status(400).json({ error: 'El email ingresado ya existe' });
            return;
        }
        const encryptedPassword = cryptr.encrypt(password);
        const fecha_creado = new Date();
        const nuevoUsuario = await pool.query(`
            INSERT INTO public."usuario" (nombre, apellido, fecha_creado, legajo, email, password, id_centro, id_sector, cliente_sap, id_categoria) 
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) 
            RETURNING id, nombre, apellido, fecha_creado, legajo, email, password, id_centro, id_sector, cliente_sap
            `, 
            [nombre, apellido, fecha_creado, legajo, email, encryptedPassword, id_centro, id_sector, legajo, id_categoria]
        );
        const idUser = nuevoUsuario.rows[0].id;
        await pool.query(`
            INSERT INTO public."usuario_rol" (id_usuario, id_rol)
            VALUES ($1, $2)
            `, 
            [idUser, id_rol]
        );
        res.status(201).json({
            success: 'Usuario creado exitosamente',
            nuevoUsuario: nuevoUsuario.rows[0]
        });
    } catch (err) {
        res.status(500).json({ 
            error: 'Ocurrió un error al intentar crear el usuario', 
            message: err.message
        });
    }
}

const deleteById = async (req, res) => {
    try {
        const id = req.params.id;
        const usuario = await pool.query('SELECT * FROM public."usuario" WHERE id = $1', [id]);
        if (!usuario.rows.length) {
            res.status(404).json({ message: 'Usuario no encontrado'})
            return;
        }
        await pool.query('DELETE FROM public."usuario_rol" WHERE id_usuario = $1', [id]);
        await pool.query('DELETE FROM public."usuario" WHERE id = $1', [id]);
        res.status(200).json({
            success: 'Usuario eliminado exitosamente',
            usuarioEliminado: usuario.rows[0]
        });
    } catch (err) {
        res.status(500).json({ 
            error: 'Ocurrió un error al intentar eliminar el usuario', 
            message: err.message
        });
    }
}

const update = async (req, res) => {
    try {
        const id = req.params.id;
        //console.log("user update", req.body)
        const user = await pool.query('SELECT * FROM public."usuario" WHERE id = $1', [id]);
        if (!user.rows.length) {
            res.status(404).json({ message: 'Usuario no encontrado'})
            return;
        }
        const { nombre, apellido, legajo, id_rol, id_centro, id_categoria, id_sector, email, activo } = req.body;
        const centro = await pool.query('SELECT * FROM public."centro" WHERE id = $1', [id_centro]);
        if (centro.rows.length === 0) {
            res.status(400).json({ error: 'El centro ingresado no es válido' });
            return;
        }
        const rol = await pool.query('SELECT * FROM public."roles" WHERE id = $1', [id_rol]);
        if (rol.rows.length === 0) {
            res.status(400).json({ error: 'El rol ingresado no es válido' });
            return;
        }
        const sector = await pool.query('SELECT * FROM public."sector" WHERE id = $1', [id_sector]);
        if (sector.rows.length === 0) {
            res.status(400).json({ error: 'El sector ingresado no es válido' });
            return;
        }
        const usuarioActualizado = await pool.query(`
            UPDATE public."usuario" 
            SET nombre=$1, apellido=$2, legajo=$3, id_centro=$4, id_sector=$5, id_categoria=$6, email_notificacion=$7, activo=$8 WHERE id = $9
            RETURNING id, usuario, email_notificacion, legajo, nombre, apellido, id_centro, fecha_creado, id_sector, id_categoria
            `,
            [nombre, apellido, legajo, id_centro, id_sector, id_categoria, email, activo, id]
        );
        await pool.query(`
            UPDATE public."usuario_rol"
            SET id_rol=$1
            WHERE id_usuario=$2
            `, 
            [id_rol, id]
        );
        res.status(200).json({
            success: 'Usuario actualizado exitosamente',
            usuarioActualizado: { ...usuarioActualizado.rows[0], id_rol, id_categoria, id_sector }
        });
    } catch (err) {
        console.log("user update err", err)
        res.status(500).json({ 
            error: 'Ocurrió un error al intentar actualizar el usuario', 
            message: err.message
        });
    }
}

const renew = async (req, res) => {
    const { token } = req.body;
    //console.log(req.body);
    if (!token) {
        return res.status(401).json({
            ok: false,
            msg: 'No hay token en la petición'
        });
    }
    try {
        jwt.verify(
            token,
            'MR-Esto-Es-UnA-PalbR@_SecretA12341267'
        );
        res.status(200).json({ valid: true, msg: 'Token válido' });
    } catch (error) {
        return res.status(401).json({
            valid: false,
            msg: 'Token no válido'
        });
    }
};

const resetPassword = async (req, res) => {
  
    const { email } = req.body;
    //console.log("Recovery pass-->" ,email);
    const response = await pool.query('SELECT * FROM public."usuario" WHERE email = $1', [email]);
    console.log("Recovery pass resp-->" ,response.rows.length, response.rows[0]);
    const hash = Math.random().toString(16).slice(8);
    const email_notify = response.rows[0].email_notificacion && response.rows[0].email_notificacion.length>0?response.rows[0].email_notificacion:'info.marfrig.ventas@gmail.com';
    var mailOpts, smtpTrans;
    console.log("email_notify" ,email_notify);
    //const password_aplicacion='rjbczfbvuilkhpnx';
    const password_aplicacion='lmogunoogbwonbtz';
    var transport = {
      host: 'smtp.gmail.com',
      port: 465,
      secure: true,
      auth: {
        user: 'info.mr.ventas@gmail.com',
        pass: password_aplicacion,
      },
    };
    var smtpTrans = nodemailer.createTransport(transport);
  
    const mailContent =
      '<html>\n\
      <body>\n\
      <table>\n\
      <tr>\n\
      <td>Name: </td>' +
      `Hola ${email}, vimos que solicitaste un cambio de contraseña, utiliza el siguiente codigo para acceder al sistema` +
      '<td></td>\n\
      </tr>\n\
      <tr>\n\
      <td>Codigo: </td><td>' +
      hash +
      '</td>\n\
      </tr>\n\
      </table></body></html>';
  
    mailOpts = {
      from: 'info.marfrig.ventas@gmail.com',
      to: email_notify,
      text: "abc",
      subject: 'CAMBIO DE CONTRASEÑA SISTEMA Transporte-MR-Sol-Bus',
      html: mailContent,
    };
  
    console.log("envia hash-->" ,hash);
    await pool.query('UPDATE public."usuario" SET restaurar = $1 WHERE email = $2', [hash, email]);
    res.status(200).json();
    
    try {
        if (response.rows.length) {
          smtpTrans.verify((error, success) => {
            if (error) {
              console.log("Error mensaje ^: ",error);
            } else {
              console.log('Server is ready to take messages');
              smtpTrans.sendMail(mailOpts, (error, res) => {
                if (error) {
                  console.log("error send: --> ", error)
                  return;
                }
                console.log('*** success send ***');
                res.status(200).json();
              });
            }
          });
          
        }
      } catch (e) {
        res.status(400).json({});
      }
};

const changePassword = async (req, res) => {
    try {
        const { email, password, repeatPassword, restaurar = false } = req.body;

        if (!email || !password || !repeatPassword) {
            res.status(400).json({ message: 'Uno o más campos están vacíos' });
            return;
        }
        const response = await pool.query('SELECT * FROM public."usuario" WHERE email = $1', [email]);
        if (!response.rows.length) {
            res.status(400).json({ message: 'El usuario ingresado no existe'});
            return;
        }
        const user = response.rows[0];
        if (user.restaurar === null && restaurar === false) {
            res.status(400).json({ message: 'El usuario ingresado no ha solicitado cambio de contraseña' });
            return;
        }
        if (password.length < 6 || repeatPassword.length < 6) {
            res.status(400).json({ message: 'Las contraseñas deben tener al menos 4 caracteres' });
            return;
        }
        if (password !== repeatPassword) {
            res.status(400).json({ message: 'Las contraseñas no coinciden' });
            return;
        }
        const newPassword = cryptr.encrypt(password);
        await pool.query('UPDATE public."usuario" SET password = $1, restaurar = $2 WHERE email = $3', [newPassword, null, email]);
        res.status(200).json({ message: 'La contraseña se cambió exitosamente. Ya puede iniciar sesión.' });
    } catch (err) {
        res.status(500).json({
            error: 'Ocurrió un error al intentar cambiar la contraseña. Por favor intente de nuevo más tarde.',
            message: err.message
        })
    }
};

const CreateorUpdateUser = async (users) =>{
    const query = `SELECT * FROM public."usuario" WHERE legajo = $1`;
    let user = [];
    let categoria=0;
    for (const us of users) {
        // trae si existe usuario us.legajo
        user = await pool.query(query,[us.NroLegajo]);
    
        if(user.rows && user.rows.length>0){
            categoria= user.rows[0].id_categoria;
            //update user
            try {
                const { Nombre, Apellido, NroLegajo, IdCliente, DescripcionDivision, AreaNomina } = us;
                //console.log("user update : ",Nombre, Apellido, NroLegajo, IdCliente, DescripcionDivision);
                let  id_categoria=1; 
                switch (AreaNomina) {
                    case 'A3':
                        id_categoria=0; 
                        break;
                    case 'A7':
                        id_categoria=1; 
                        break;
                    case 'A8':
                        id_categoria=2; 
                        break;
                    case 'A10_JEFES':
                        id_categoria=3; 
                        break;
                    case 'A11_GERENTE_EJECUTIVO':
                        id_categoria=4; 
                        break;
                    default:
                        //console.log("nomina", AreaNomina)
                        break;
                }
                let id_centro=5;
                switch (DescripcionDivision) {
                    case 'Administración Central':
                        id_centro=5;
                        break;
                    case 'Baradero':
                        id_centro=1;
                        break;
                    case 'San Jorge':
                        id_centro=2;
                        break;
                    case 'Villa Mercedes':
                        id_centro=4;
                        break;
                    case 'Arroyo Seco':
                        id_centro=6;
                        break;
                    case 'Planta Pilar':
                        id_centro=3;
                        break;
                    case 'Unquillo':
                        id_centro=7;
                        break;
                    case 'CD Córdoba':
                        id_centro=8;
                        break;
                    default:
                        break;
                }

                // si  es categoria ==3 o 4 no hacer nada con el usuario NO actulizar
                if(parseInt(categoria) < 3){
                    await pool.query(`
                        UPDATE public."usuario" 
                        SET nombre = $1, apellido = $2, email = $3, id_centro =$4, id_categoria =$5, cliente_sap = $6 WHERE legajo = $7
                        RETURNING id 
                        `,
                        [Nombre, Apellido,  parseInt(NroLegajo)+'@marfrig.com', id_centro, id_categoria, IdCliente, NroLegajo]
                    );
                }else{
                    console.log("no actualizo la cat")
                }
            } catch (err) {
                console.log("err user update: ",err);
            }
        }else{
            //new user
            try {
                const { Nombre, Apellido, NroLegajo, IdCliente,DescripcionDivision, AreaNomina } = us;
                console.log("user new: ",Nombre, Apellido, NroLegajo, IdCliente, DescripcionDivision);
                const password=parseInt(NroLegajo);
                const encryptedPassword = cryptr.encrypt(password);
                let id_categoria=1;
                switch (AreaNomina) {
                    case 'A3':
                        id_categoria=0; 
                        break;
                    case 'A7':
                        id_categoria=1; 
                        break;
                    case 'A8':
                        id_categoria=2; 
                        break;
                    case 'A10_JEFES':
                        id_categoria=3; 
                        break;
                    case 'A11_GERENTE_EJECUTIVO':
                        id_categoria=4; 
                        break;
                    default:
                        break;
                }
                let id_centro=5;
                switch (DescripcionDivision) {
                    case 'Administración Central':
                        id_centro=5;
                        break;
                    case 'Baradero':
                        id_centro=1;
                        break;
                    case 'San Jorge':
                        id_centro=2;
                        break;
                    case 'Villa Mercedes':
                        id_centro=4;
                        break;
                    case 'Arroyo Seco':
                        id_centro=6;
                        break;
                    case 'Planta Pilar':
                        id_centro=3;
                        break;
                    case 'Unquillo':
                        id_centro=7;
                        break;
                    case 'CD Córdoba':
                        id_centro=8;
                        break;
                    default:
                        break;
                }
                const id_sector=0;
                const fecha_creado = new Date();
                const user_ = await pool.query(`
                    INSERT INTO public."usuario" (nombre, apellido, fecha_creado, legajo, email, password, id_centro, id_sector, cliente_sap, id_categoria) 
                    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) 
                    RETURNING id, nombre, apellido, fecha_creado, legajo, email, password, id_centro, id_sector, cliente_sap
                    `, 
                    [Nombre, Apellido, fecha_creado, NroLegajo, parseInt(NroLegajo)+'@marfrig.com', encryptedPassword, id_centro, id_sector, IdCliente, id_categoria]
                );
                await pool.query(`
                    INSERT INTO public."usuario_rol" (id_usuario, id_rol)
                    VALUES ($1, $2)
                    `, 
                    [user_.rows[0].id, 2]
                );
            } catch (err) {
                console.log("err user new: ",err);
            }
        }
    };
}


 
module.exports = {
    getList,
    getById,
    insert,
    update,
    deleteById,
    login,
    renew,
    resetPassword,
    changePassword, 
};
