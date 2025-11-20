const { withConnection } = require('../../database/dbHelper'); // ✅ SOLO esto

const getList = async (req, res) => {
    console.log("get sucursal usuario");
    await withConnection(async (client) => {
        try {
            const usuariosSucursal = await client.query(`
                SELECT us.*, 
                       u.nombre as usuario,
                       s.descripcion as sucursal
                FROM public."usuario_sucursal" us
                INNER JOIN public."usuario" u ON us.id_usuario = u.id
                INNER JOIN public."sucursal" s ON us.id_sucursal = s.id
                ORDER BY u.nombre, s.descripcion
            `);
            res.status(200).json(usuariosSucursal.rows);
        } catch (error) {
            res.status(500).json({
                error: "Ha ocurrido un error al intentar obtener los usuarios y sucursales",
                message: error.message,
            });
        }
    });
}

const getByUsuario = async (req, res) => {
    await withConnection(async (client) => {
        try {
            const id_usuario = req.params.id_usuario;
            const sucursales = await client.query(`
                SELECT us.*, s.descripcion as sucursal
                FROM public."usuario_sucursal" us
                INNER JOIN public."sucursal" s ON us.id_sucursal = s.id
                WHERE us.id_usuario = $1
                ORDER BY s.descripcion
            `, [id_usuario]);
            
            res.status(200).json(sucursales.rows);
        } catch (error) {
            res.status(500).json({
                error: "Ha ocurrido un error al intentar obtener las sucursales del usuario",
                message: error.message,
            });
        }
    });
}

const getBySucursal = async (req, res) => {
    await withConnection(async (client) => {
        try {
            const id_sucursal = req.params.id_sucursal;
            const usuarios = await client.query(`
                SELECT us.*, u.nombre as usuario
                FROM public."usuario_sucursal" us
                INNER JOIN public."usuario" u ON us.id_usuario = u.id
                WHERE us.id_sucursal = $1
                ORDER BY u.nombre
            `, [id_sucursal]);
            
            res.status(200).json(usuarios.rows);
        } catch (error) {
            res.status(500).json({
                error: "Ha ocurrido un error al intentar obtener los usuarios de la sucursal",
                message: error.message,
            });
        }
    });
}

const insert = async (req, res) => {
    await withConnection(async (client) => {
        try {
            const { id_usuario, id_sucursal } = req.body;
            
            // Verificar si ya existe la relación
            const existe = await client.query(
                'SELECT * FROM public."usuario_sucursal" WHERE id_usuario = $1 AND id_sucursal = $2',
                [id_usuario, id_sucursal]
            );
            
            if (existe.rows.length > 0) {
                res.status(400).json({ error: 'Este usuario ya está asignado a esta sucursal' });
                return;
            }
            
            const nuevaRelacion = await client.query(
                'INSERT INTO public."usuario_sucursal" (id_usuario, id_sucursal) VALUES ($1, $2) RETURNING *', 
                [id_usuario, id_sucursal]
            );
            
            res.status(201).json({
                success: 'Usuario asignado a la sucursal exitosamente',
                nuevaRelacion: nuevaRelacion.rows[0],
            });
        } catch (error) {
            res.status(500).json({
                error: "Ha ocurrido un error al intentar asignar el usuario a la sucursal",
                message: error.message,
            });
        }
    });
}

const deleteById = async (req, res) => {
    await withConnection(async (client) => {
        try {
            const { id_usuario, id_sucursal } = req.params;
            
            const relacion = await client.query(
                'SELECT * FROM public."usuario_sucursal" WHERE id_usuario = $1 AND id_sucursal = $2',
                [id_usuario, id_sucursal]
            );
            
            if (relacion.rows.length === 0) {
                res.status(404).json({ error: 'Relación no encontrada' });
                return;
            }
            
            await client.query(
                'DELETE FROM public."usuario_sucursal" WHERE id_usuario = $1 AND id_sucursal = $2',
                [id_usuario, id_sucursal]
            );
            
            res.status(200).json({
                success: 'Usuario removido de la sucursal exitosamente',
                relacionEliminada: relacion.rows[0],
            });
        } catch (error) {
            res.status(500).json({
                error: "Ha ocurrido un error al intentar remover el usuario de la sucursal",
                message: error.message,
            });
        }
    });
}

module.exports = {
    getList,
    getByUsuario,
    getBySucursal,
    insert,
    deleteById
}