const { withConnection } = require('../dbHelper'); 

const getList = async (req, res) => {
    await withConnection(async (client) => {
        try {
            const usuariosRol = await client.query(`
                SELECT ur.*, 
                       u.nombre as usuario,
                       r.descripcion as rol
                FROM public."usuario_rol" ur
                INNER JOIN public."usuario" u ON ur.id_usuario = u.id
                INNER JOIN public."roles" r ON ur.id_rol = r.id
                ORDER BY u.nombre, r.descripcion
            `);
            res.status(200).json(usuariosRol.rows);
        } catch (error) {
            res.status(500).json({
                error: "Ha ocurrido un error al intentar obtener los usuarios y roles",
                message: error.message,
            });
        }
    });
}

const getByUsuario = async (req, res) => {
    await withConnection(async (client) => {
        try {
            const id_usuario = req.params.id_usuario;
            const roles = await client.query(`
                SELECT ur.*, r.descripcion as rol
                FROM public."usuario_rol" ur
                INNER JOIN public."roles" r ON ur.id_rol = r.id
                WHERE ur.id_usuario = $1
                ORDER BY r.descripcion
            `, [id_usuario]);
            
            res.status(200).json(roles.rows);
        } catch (error) {
            res.status(500).json({
                error: "Ha ocurrido un error al intentar obtener los roles del usuario",
                message: error.message,
            });
        }
    });
}

const getByRol = async (req, res) => {
    await withConnection(async (client) => {
        try {
            const id_rol = req.params.id_rol;
            const usuarios = await client.query(`
                SELECT ur.*, u.nombre as usuario
                FROM public."usuario_rol" ur
                INNER JOIN public."usuario" u ON ur.id_usuario = u.id
                WHERE ur.id_rol = $1
                ORDER BY u.nombre
            `, [id_rol]);
            
            res.status(200).json(usuarios.rows);
        } catch (error) {
            res.status(500).json({
                error: "Ha ocurrido un error al intentar obtener los usuarios del rol",
                message: error.message,
            });
        }
    });
}

const insert = async (req, res) => {
    await withConnection(async (client) => {
        try {
            const { id_usuario, id_rol } = req.body;
            
            // Verificar si ya existe la relación
            const existe = await client.query(
                'SELECT * FROM public."usuario_rol" WHERE id_usuario = $1 AND id_rol = $2',
                [id_usuario, id_rol]
            );
            
            if (existe.rows.length > 0) {
                res.status(400).json({ error: 'Este usuario ya tiene asignado este rol' });
                return;
            }
            
            const nuevaRelacion = await client.query(
                'INSERT INTO public."usuario_rol" (id_usuario, id_rol) VALUES ($1, $2) RETURNING *', 
                [id_usuario, id_rol]
            );
            
            res.status(201).json({
                success: 'Rol asignado al usuario exitosamente',
                nuevaRelacion: nuevaRelacion.rows[0],
            });
        } catch (error) {
            res.status(500).json({
                error: "Ha ocurrido un error al intentar asignar el rol al usuario",
                message: error.message,
            });
        }
    });
}

const deleteById = async (req, res) => {
    await withConnection(async (client) => {
        try {
            const { id_usuario, id_rol } = req.params;
            
            const relacion = await client.query(
                'SELECT * FROM public."usuario_rol" WHERE id_usuario = $1 AND id_rol = $2',
                [id_usuario, id_rol]
            );
            
            if (relacion.rows.length === 0) {
                res.status(404).json({ error: 'Relación no encontrada' });
                return;
            }
            
            await client.query(
                'DELETE FROM public."usuario_rol" WHERE id_usuario = $1 AND id_rol = $2',
                [id_usuario, id_rol]
            );
            
            res.status(200).json({
                success: 'Rol removido del usuario exitosamente',
                relacionEliminada: relacion.rows[0],
            });
        } catch (error) {
            res.status(500).json({
                error: "Ha ocurrido un error al intentar remover el rol del usuario",
                message: error.message,
            });
        }
    });
}

module.exports = {
    getList,
    getByUsuario,
    getByRol,
    insert,
    deleteById
}
