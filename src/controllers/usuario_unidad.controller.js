const { withConnection } = require('../dbHelper'); 

const getList = async (req, res) => {
    await withConnection(async (client) => {
        try {
            const usuariosUnidad = await client.query(`
                SELECT uu.*, 
                       u.nombre as usuario,
                       uv.nombre as unidad
                FROM public."usuario_unidad" uu
                INNER JOIN public."usuario" u ON uu.id_usuario = u.id
                INNER JOIN public."unidad_vehiculo" uv ON uu.id_unidad = uv.id
                ORDER BY u.nombre, uv.nombre
            `);
            res.status(200).json(usuariosUnidad.rows);
        } catch (error) {
            res.status(500).json({
                error: "Ha ocurrido un error al intentar obtener los usuarios y unidades",
                message: error.message,
            });
        }
    });
}

const getByUsuario = async (req, res) => {
    await withConnection(async (client) => {
        try {
            const id_usuario = req.params.id_usuario;
            const unidades = await client.query(`
                SELECT uu.*, uv.nombre as unidad
                FROM public."usuario_unidad" uu
                INNER JOIN public."unidad_vehiculo" uv ON uu.id_unidad = uv.id
                WHERE uu.id_usuario = $1
                ORDER BY uv.nombre
            `, [id_usuario]);
            
            res.status(200).json(unidades.rows);
        } catch (error) {
            res.status(500).json({
                error: "Ha ocurrido un error al intentar obtener las unidades del usuario",
                message: error.message,
            });
        }
    });
}

const getByUnidad = async (req, res) => {
    await withConnection(async (client) => {
        try {
            const id_unidad = req.params.id_unidad;
            const usuarios = await client.query(`
                SELECT uu.*, u.nombre as usuario
                FROM public."usuario_unidad" uu
                INNER JOIN public."usuario" u ON uu.id_usuario = u.id
                WHERE uu.id_unidad = $1
                ORDER BY u.nombre
            `, [id_unidad]);
            
            res.status(200).json(usuarios.rows);
        } catch (error) {
            res.status(500).json({
                error: "Ha ocurrido un error al intentar obtener los usuarios de la unidad",
                message: error.message,
            });
        }
    });
}

const insert = async (req, res) => {
    await withConnection(async (client) => {
        try {
            const { id_usuario, id_unidad } = req.body;
            
            // Verificar si ya existe la relación
            const existe = await client.query(
                'SELECT * FROM public."usuario_unidad" WHERE id_usuario = $1 AND id_unidad = $2',
                [id_usuario, id_unidad]
            );
            
            if (existe.rows.length > 0) {
                res.status(400).json({ error: 'Este usuario ya está asignado a esta unidad' });
                return;
            }
            
            const nuevaRelacion = await client.query(
                'INSERT INTO public."usuario_unidad" (id_usuario, id_unidad) VALUES ($1, $2) RETURNING *', 
                [id_usuario, id_unidad]
            );
            
            res.status(201).json({
                success: 'Usuario asignado a la unidad exitosamente',
                nuevaRelacion: nuevaRelacion.rows[0],
            });
        } catch (error) {
            res.status(500).json({
                error: "Ha ocurrido un error al intentar asignar el usuario a la unidad",
                message: error.message,
            });
        }
    });
}

const deleteById = async (req, res) => {
    await withConnection(async (client) => {
        try {
            const { id_usuario, id_unidad } = req.params;
            
            const relacion = await client.query(
                'SELECT * FROM public."usuario_unidad" WHERE id_usuario = $1 AND id_unidad = $2',
                [id_usuario, id_unidad]
            );
            
            if (relacion.rows.length === 0) {
                res.status(404).json({ error: 'Relación no encontrada' });
                return;
            }
            
            await client.query(
                'DELETE FROM public."usuario_unidad" WHERE id_usuario = $1 AND id_unidad = $2',
                [id_usuario, id_unidad]
            );
            
            res.status(200).json({
                success: 'Usuario removido de la unidad exitosamente',
                relacionEliminada: relacion.rows[0],
            });
        } catch (error) {
            res.status(500).json({
                error: "Ha ocurrido un error al intentar remover el usuario de la unidad",
                message: error.message,
            });
        }
    });
}

module.exports = {
    getList,
    getByUsuario,
    getByUnidad,
    insert,
    deleteById
}
