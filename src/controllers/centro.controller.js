const { withConnection } = require('../dbHelper');  // ✅ AGREGA ESTA LÍNEA

const getList = async (req, res) => {
    await withConnection(async (client) => {
        try {
            const centros = await client.query('SELECT * FROM public."centro" ORDER BY nombre DESC');
            res.status(200).json(centros.rows);
        } catch (error) {
            res.status(500).json({
                error: "Ha ocurrido un error al intentar obtener los centros",
                message: error.message,
            });
        }
    });
}

const getListActive = async (req, res) => {
    await withConnection(async (client) => {
        try {
            const centros = await client.query('SELECT * FROM public."centro" WHERE activo = true ORDER BY nombre DESC');
            res.status(200).json(centros.rows);
        } catch (error) {
            res.status(500).json({
                error: "Ha ocurrido un error al intentar obtener los centros",
                message: error.message,
            });
        }
    });
}

const getById = async (req, res) => {
    await withConnection(async (client) => {
        try {
            const id = req.params.id;
            console.log("centro by id", id);
            const centro = await client.query('SELECT * FROM public."centro" WHERE id = $1', [id]);
            if (centro.rows.length === 0) {
                res.status(404).json({ error: 'Centro no encontrado' });
                return;
            }
            console.log("centro -->", centro.rows[0]);
            res.status(200).json(centro.rows[0]);
        } catch (error) {
            res.status(500).json({
                error: "Ha ocurrido un error al intentar obtener el centro",
                message: error.message,
            });
        }
    });
}

const insert = async (req, res) => {
    await withConnection(async (client) => {
        try {
            const { nombre } = req.body;
            
            // Validación básica
            if (!nombre) {
                res.status(400).json({ error: 'El campo nombre es requerido' });
                return;
            }
            
            const nuevoCentro = await client.query(
                'INSERT INTO public."centro" (nombre) VALUES ($1) RETURNING id, nombre', 
                [nombre]
            );
            res.status(201).json({
                success: 'Centro creado exitosamente',
                nuevoCentro: nuevoCentro.rows[0],
            });
        } catch (error) {
            res.status(500).json({
                error: "Ha ocurrido un error al intentar crear el centro",
                message: error.message,
            });
        }
    });
}

const deleteById = async (req, res) => {
    await withConnection(async (client) => {
        try {
            const id = req.params.id;
            const centro = await client.query('SELECT * FROM public."centro" WHERE id = $1', [id]);
            if (centro.rows.length === 0) {
                res.status(404).json({ error: 'Centro no encontrado' });
                return;
            }
            
            await client.query('DELETE FROM public."centro" WHERE id = $1', [id]);
            
            res.status(200).json({
                success: 'Centro eliminado exitosamente',
                centroEliminado: centro.rows[0],
            });
        } catch (error) {
            res.status(500).json({
                error: "Ha ocurrido un error al intentar eliminar el centro",
                message: error.message,
            });
        }
    });
}

const update = async (req, res) => {
    await withConnection(async (client) => {
        try {
            const id = req.params.id;
            const { nombre, activo } = req.body;
            
            console.log("Update Centro-->", req.body);
            
            // Validación básica
            if (!nombre) {
                res.status(400).json({ error: 'El campo nombre es requerido' });
                return;
            }
            
            const centroExistente = await client.query('SELECT * FROM public."centro" WHERE id = $1', [id]);
            if (centroExistente.rows.length === 0) {
                res.status(404).json({ error: 'Centro no encontrado' });
                return;
            }
            
            const centroActualizado = await client.query(
                'UPDATE public."centro" SET nombre = $1, activo = $2 WHERE id = $3 RETURNING *', 
                [nombre, activo, id]
            );
            
            res.status(200).json({
                success: 'Centro actualizado exitosamente',
                centroActualizado: centroActualizado.rows[0],
            });
        } catch (error) {
            res.status(500).json({
                error: "Ha ocurrido un error al intentar actualizar el centro",
                message: error.message,
            });
        }
    });
}

module.exports = {
    getList,
    getListActive,
    getById,
    insert,
    update,
    deleteById
}
