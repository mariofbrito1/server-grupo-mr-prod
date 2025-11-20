const { withConnection } = require('../../database/dbHelper'); // ✅ SOLO esto

const getList = async (req, res) => {
    await withConnection(async (client) => {
        try {
            const estados = await client.query('SELECT * FROM public."estado_movimiento_repuesto" ORDER BY descripcion DESC');
            res.status(200).json(estados.rows);
        } catch (error) {
            res.status(500).json({
                error: "Ha ocurrido un error al intentar obtener los estados de movimiento de repuesto",
                message: error.message,
            });
        }
    });
}

const getById = async (req, res) => {
    await withConnection(async (client) => {
        try {
            const id = req.params.id;
            const estado = await client.query('SELECT * FROM public."estado_movimiento_repuesto" WHERE id = $1', [id]);
            if (estado.rows.length === 0) {
                res.status(404).json({ error: 'Estado de movimiento de repuesto no encontrado' });
                return;
            }
            res.status(200).json(estado.rows[0]);
        } catch (error) {
            res.status(500).json({
                error: "Ha ocurrido un error al intentar obtener el estado de movimiento de repuesto",
                message: error.message,
            });
        }
    });
}

const insert = async (req, res) => {
    await withConnection(async (client) => {
        try {
            const { descripcion } = req.body;
            const nuevoEstado = await client.query(
                'INSERT INTO public."estado_movimiento_repuesto" (descripcion) VALUES ($1) RETURNING *', 
                [descripcion]
            );
            res.status(201).json({
                success: 'Estado de movimiento de repuesto creado exitosamente',
                nuevoEstado: nuevoEstado.rows[0],
            });
        } catch (error) {
            res.status(500).json({
                error: "Ha ocurrido un error al intentar crear el estado de movimiento de repuesto",
                message: error.message,
            });
        }
    });
}

const deleteById = async (req, res) => {
    await withConnection(async (client) => {
        try {
            const id = req.params.id;
            const estado = await client.query('SELECT * FROM public."estado_movimiento_repuesto" WHERE id = $1', [id]);
            if (estado.rows.length === 0) {
                res.status(404).json({ error: 'Estado de movimiento de repuesto no encontrado' });
                return;
            }
            await client.query('DELETE FROM public."estado_movimiento_repuesto" WHERE id = $1', [id]);
            res.status(200).json({
                success: 'Estado de movimiento de repuesto eliminado exitosamente',
                estadoEliminado: estado.rows[0],
            });
        } catch (error) {
            res.status(500).json({
                error: "Ha ocurrido un error al intentar eliminar el estado de movimiento de repuesto",
                message: error.message,
            });
        }
    });
}

const update = async (req, res) => {
    await withConnection(async (client) => {
        try {
            const id = req.params.id;
            const { descripcion } = req.body;
            
            const estado = await client.query('SELECT * FROM public."estado_movimiento_repuesto" WHERE id = $1', [id]);
            if (estado.rows.length === 0) {
                res.status(404).json({ error: 'Estado de movimiento de repuesto no encontrado' });
                return;
            }
            
            const estadoActualizado = await client.query(
                'UPDATE public."estado_movimiento_repuesto" SET descripcion = $1 WHERE id = $2 RETURNING *', 
                [descripcion, id]
            );
            
            res.status(200).json({
                success: 'Estado de movimiento de repuesto actualizado exitosamente',
                estadoActualizado: estadoActualizado.rows[0],
            });
        } catch (error) {
            res.status(500).json({
                error: "Ha ocurrido un error al intentar actualizar el estado de movimiento de repuesto",
                message: error.message,
            });
        }
    });
}

module.exports = {
    getList,
    getById,
    insert,
    update,
    deleteById
}