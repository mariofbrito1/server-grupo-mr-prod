const { withConnection } = require('../dbHelper'); 

const getList = async (req, res) => {
    await withConnection(async (client) => {
        try {
            const carnets = await client.query('SELECT c.*, tc.descripcion as tipo_carnet FROM public."carnet" c INNER JOIN public."tipo_carnet" tc ON c.id_tipo_carnet = tc.id ORDER BY c.fecha_vencimiento DESC');
            res.status(200).json(carnets.rows);
        } catch (error) {
            res.status(500).json({
                error: "Ha ocurrido un error al intentar obtener los carnets",
                message: error.message,
            });
        }
    });
}

const getById = async (req, res) => {
    await withConnection(async (client) => {
        try {
            const id = req.params.id;
            const carnet = await client.query('SELECT c.*, tc.descripcion as tipo_carnet FROM public."carnet" c INNER JOIN public."tipo_carnet" tc ON c.id_tipo_carnet = tc.id WHERE c.id = $1', [id]);
            if (carnet.rows.length === 0) {
                res.status(404).json({ error: 'Carnet no encontrado' });
                return;
            }
            res.status(200).json(carnet.rows[0]);
        } catch (error) {
            res.status(500).json({
                error: "Ha ocurrido un error al intentar obtener el carnet",
                message: error.message,
            });
        }
    });
}

const insert = async (req, res) => {
    await withConnection(async (client) => {
        try {
            const { id_tipo_carnet, fecha_vencimiento, descripcion, img_carnet } = req.body;
            
            // Validación básica
            if (!id_tipo_carnet || !fecha_vencimiento) {
                res.status(400).json({ error: 'Los campos id_tipo_carnet y fecha_vencimiento son requeridos' });
                return;
            }
            
            const nuevoCarnet = await client.query(
                'INSERT INTO public."carnet" (id_tipo_carnet, fecha_vencimiento, descripcion, img_carnet) VALUES ($1, $2, $3, $4) RETURNING *', 
                [id_tipo_carnet, fecha_vencimiento, descripcion, img_carnet]
            );
            res.status(201).json({
                success: 'Carnet creado exitosamente',
                nuevoCarnet: nuevoCarnet.rows[0],
            });
        } catch (error) {
            res.status(500).json({
                error: "Ha ocurrido un error al intentar crear el carnet",
                message: error.message,
            });
        }
    });
}

const deleteById = async (req, res) => {
    await withConnection(async (client) => {
        try {
            const id = req.params.id;
            const carnet = await client.query('SELECT * FROM public."carnet" WHERE id = $1', [id]);
            if (carnet.rows.length === 0) {
                res.status(404).json({ error: 'Carnet no encontrado' });
                return;
            }
            await client.query('DELETE FROM public."carnet" WHERE id = $1', [id]);
            res.status(200).json({
                success: 'Carnet eliminado exitosamente',
                carnetEliminado: carnet.rows[0],
            });
        } catch (error) {
            res.status(500).json({
                error: "Ha ocurrido un error al intentar eliminar el carnet",
                message: error.message,
            });
        }
    });
}

const update = async (req, res) => {
    await withConnection(async (client) => {
        try {
            const id = req.params.id;
            const { id_tipo_carnet, fecha_vencimiento, descripcion, img_carnet } = req.body;
            
            // Validación básica
            if (!id_tipo_carnet || !fecha_vencimiento) {
                res.status(400).json({ error: 'Los campos id_tipo_carnet y fecha_vencimiento son requeridos' });
                return;
            }
            
            const carnet = await client.query('SELECT * FROM public."carnet" WHERE id = $1', [id]);
            if (carnet.rows.length === 0) {
                res.status(404).json({ error: 'Carnet no encontrado' });
                return;
            }
            
            const carnetActualizado = await client.query(
                'UPDATE public."carnet" SET id_tipo_carnet = $1, fecha_vencimiento = $2, descripcion = $3, img_carnet = $4 WHERE id = $5 RETURNING *', 
                [id_tipo_carnet, fecha_vencimiento, descripcion, img_carnet, id]
            );
            
            res.status(200).json({
                success: 'Carnet actualizado exitosamente',
                carnetActualizado: carnetActualizado.rows[0],
            });
        } catch (error) {
            res.status(500).json({
                error: "Ha ocurrido un error al intentar actualizar el carnet",
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
