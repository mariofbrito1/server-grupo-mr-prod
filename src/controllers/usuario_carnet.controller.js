const { withConnection } = require('../../database/dbHelper');

const getList = async (req, res) => {
    await withConnection(async (client) => {
        try {
            const usuarioCarnet = await client.query(`
                SELECT uc.*, 
                       u.nombre as usuario_nombre,
                       u.apellido as usuario_apellido,
                       c.descripcion as carnet_descripcion
                FROM public."usuario_carnet" uc 
                INNER JOIN public."usuario" u ON uc.id_usuario = u.id 
                INNER JOIN public."carnet" c ON uc.id_carnet = c.id 
                ORDER BY u.apellido, u.nombre
            `);
            res.status(200).json(usuarioCarnet.rows);
        } catch (error) {
            res.status(500).json({
                error: "Ha ocurrido un error al intentar obtener las relaciones usuario-carnet",
                message: error.message,
            });
        }
    });
}

const getById = async (req, res) => {
    await withConnection(async (client) => {
        try {
            const { id_usuario, id_carnet } = req.params;
            const usuarioCarnet = await client.query(`
                SELECT uc.*, 
                       u.nombre as usuario_nombre,
                       u.apellido as usuario_apellido,
                       c.descripcion as carnet_descripcion
                FROM public."usuario_carnet" uc 
                INNER JOIN public."usuario" u ON uc.id_usuario = u.id 
                INNER JOIN public."carnet" c ON uc.id_carnet = c.id 
                WHERE uc.id_usuario = $1 AND uc.id_carnet = $2
            `, [id_usuario, id_carnet]);
            
            if (usuarioCarnet.rows.length === 0) {
                res.status(404).json({ error: 'Relación usuario-carnet no encontrada' });
                return;
            }
            res.status(200).json(usuarioCarnet.rows[0]);
        } catch (error) {
            res.status(500).json({
                error: "Ha ocurrido un error al intentar obtener la relación usuario-carnet",
                message: error.message,
            });
        }
    });
}

const getByUsuarioId = async (req, res) => {
    await withConnection(async (client) => {
        try {
            const id_usuario = req.params.id_usuario;
            const usuarioCarnet = await client.query(`
                SELECT uc.*, 
                       u.nombre as usuario_nombre,
                       u.apellido as usuario_apellido,
                       c.descripcion as carnet_descripcion
                FROM public."usuario_carnet" uc 
                INNER JOIN public."usuario" u ON uc.id_usuario = u.id 
                INNER JOIN public."carnet" c ON uc.id_carnet = c.id 
                WHERE uc.id_usuario = $1
            `, [id_usuario]);
            
            res.status(200).json(usuarioCarnet.rows);
        } catch (error) {
            res.status(500).json({
                error: "Ha ocurrido un error al intentar obtener los carnets del usuario",
                message: error.message,
            });
        }
    });
}

const getByCarnetId = async (req, res) => {
    await withConnection(async (client) => {
        try {
            const id_carnet = req.params.id_carnet;
            const usuarioCarnet = await client.query(`
                SELECT uc.*, 
                       u.nombre as usuario_nombre,
                       u.apellido as usuario_apellido,
                       c.descripcion as carnet_descripcion
                FROM public."usuario_carnet" uc 
                INNER JOIN public."usuario" u ON uc.id_usuario = u.id 
                INNER JOIN public."carnet" c ON uc.id_carnet = c.id 
                WHERE uc.id_carnet = $1
            `, [id_carnet]);
            
            res.status(200).json(usuarioCarnet.rows);
        } catch (error) {
            res.status(500).json({
                error: "Ha ocurrido un error al intentar obtener los usuarios del carnet",
                message: error.message,
            });
        }
    });
}

// INSERT - Ahora elimina todos los registros del usuario y luego inserta los nuevos
const insert = async (req, res) => {
    await withConnection(async (client) => {
        try {
            const { id_usuario, carnets } = req.body;
            
            // Validación básica
            if (!id_usuario || !carnets || !Array.isArray(carnets)) {
                res.status(400).json({ 
                    error: 'Los campos id_usuario y carnets (array) son requeridos' 
                });
                return;
            }

            // Verificar que el usuario existe
            const usuarioExiste = await client.query(
                'SELECT id FROM public."usuario" WHERE id = $1',
                [id_usuario]
            );

            if (usuarioExiste.rows.length === 0) {
                res.status(404).json({ error: 'El usuario especificado no existe' });
                return;
            }

            // Iniciar transacción
            await client.query('BEGIN');

            try {
                // 1. Eliminar todas las relaciones existentes para este usuario
                await client.query(
                    'DELETE FROM public."usuario_carnet" WHERE id_usuario = $1',
                    [id_usuario]
                );

                // 2. Insertar las nuevas relaciones
                const relacionesCreadas = [];
                
                for (const id_carnet of carnets) {
                    // Verificar que el carnet existe
                    const carnetExiste = await client.query(
                        'SELECT id FROM public."carnet" WHERE id = $1',
                        [id_carnet]
                    );

                    if (carnetExiste.rows.length === 0) {
                        await client.query('ROLLBACK');
                        res.status(400).json({ 
                            error: `El carnet con ID ${id_carnet} no existe` 
                        });
                        return;
                    }

                    // Insertar la nueva relación
                    const nuevaRelacion = await client.query(
                        'INSERT INTO public."usuario_carnet" (id_usuario, id_carnet) VALUES ($1, $2) RETURNING *', 
                        [id_usuario, id_carnet]
                    );

                    relacionesCreadas.push(nuevaRelacion.rows[0]);
                }

                // Confirmar transacción
                await client.query('COMMIT');

                res.status(201).json({
                    success: 'Relaciones usuario-carnet actualizadas exitosamente',
                    usuario_id: id_usuario,
                    relaciones_creadas: relacionesCreadas,
                    total_relaciones: relacionesCreadas.length
                });

            } catch (error) {
                // Revertir transacción en caso de error
                await client.query('ROLLBACK');
                throw error;
            }

        } catch (error) {
            res.status(500).json({
                error: "Ha ocurrido un error al intentar crear/actualizar las relaciones usuario-carnet",
                message: error.message,
            });
        }
    });
}

// UPDATE - Mismo comportamiento que INSERT (elimina todo e inserta nuevo)
const update = async (req, res) => {
    // Reutilizamos la misma lógica del insert
    await insert(req, res);
}

const deleteById = async (req, res) => {
    await withConnection(async (client) => {
        try {
            const { id_usuario, id_carnet } = req.params;
            
            const usuarioCarnet = await client.query(
                'SELECT * FROM public."usuario_carnet" WHERE id_usuario = $1 AND id_carnet = $2', 
                [id_usuario, id_carnet]
            );
            
            if (usuarioCarnet.rows.length === 0) {
                res.status(404).json({ error: 'Relación usuario-carnet no encontrada' });
                return;
            }
            
            await client.query(
                'DELETE FROM public."usuario_carnet" WHERE id_usuario = $1 AND id_carnet = $2', 
                [id_usuario, id_carnet]
            );
            
            res.status(200).json({
                success: 'Relación usuario-carnet eliminada exitosamente',
                relacionEliminada: usuarioCarnet.rows[0],
            });
        } catch (error) {
            res.status(500).json({
                error: "Ha ocurrido un error al intentar eliminar la relación usuario-carnet",
                message: error.message,
            });
        }
    });
}

// Método para eliminar todas las relaciones de un usuario
const deleteByUsuario = async (req, res) => {
    await withConnection(async (client) => {
        try {
            const id_usuario = req.params.id_usuario;
            
            // Verificar que el usuario existe
            const usuarioExiste = await client.query(
                'SELECT id FROM public."usuario" WHERE id = $1',
                [id_usuario]
            );

            if (usuarioExiste.rows.length === 0) {
                res.status(404).json({ error: 'El usuario especificado no existe' });
                return;
            }
            
            // Obtener relaciones que se van a eliminar
            const relacionesEliminadas = await client.query(
                'SELECT * FROM public."usuario_carnet" WHERE id_usuario = $1', 
                [id_usuario]
            );
            
            // Eliminar todas las relaciones del usuario
            await client.query(
                'DELETE FROM public."usuario_carnet" WHERE id_usuario = $1', 
                [id_usuario]
            );
            
            res.status(200).json({
                success: 'Todas las relaciones usuario-carnet eliminadas exitosamente',
                usuario_id: id_usuario,
                relaciones_eliminadas: relacionesEliminadas.rows,
                total_eliminadas: relacionesEliminadas.rows.length
            });
        } catch (error) {
            res.status(500).json({
                error: "Ha ocurrido un error al intentar eliminar las relaciones usuario-carnet",
                message: error.message,
            });
        }
    });
}

module.exports = {
    getList, 
    getById,
    getByUsuarioId,
    getByCarnetId,
    insert,  // Ahora recibe carnets como array
    update,  // Mismo comportamiento que insert
    deleteById,
    deleteByUsuario  // Nuevo método para eliminar todas las relaciones de un usuario
}