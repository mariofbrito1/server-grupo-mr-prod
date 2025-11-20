const { withConnection } = require('../../database/dbHelper'); // ✅ SOLO esto

const getList = async (req, res) => {
    await withConnection(async (client) => {
        try {
            const gpsList = await client.query(`
                SELECT g.*, p.descripcion as proveedor 
                FROM public."gps" g
                INNER JOIN public."proveedor" p ON g.id_proveedor = p.id
                ORDER BY g.descripcion
            `);
            res.status(200).json(gpsList.rows);
        } catch (error) {
            res.status(500).json({
                error: "Ha ocurrido un error al intentar obtener los GPS",
                message: error.message,
            });
        }
    });
}

const getById = async (req, res) => {
    await withConnection(async (client) => {
        try {
            const id = req.params.id;
            const gps = await client.query(`
                SELECT g.*, p.descripcion as proveedor 
                FROM public."gps" g
                INNER JOIN public."proveedor" p ON g.id_proveedor = p.id
                WHERE g.id = $1
            `, [id]);
            
            if (gps.rows.length === 0) {
                res.status(404).json({ error: 'GPS no encontrado' });
                return;
            }
            res.status(200).json(gps.rows[0]);
        } catch (error) {
            res.status(500).json({
                error: "Ha ocurrido un error al intentar obtener el GPS",
                message: error.message,
            });
        }
    });
}

const insert = async (req, res) => {
    await withConnection(async (client) => {
        try {
            const { descripcion, id_proveedor } = req.body;
            const nuevoGps = await client.query(
                'INSERT INTO public."gps" (descripcion, id_proveedor) VALUES ($1, $2) RETURNING *', 
                [descripcion, id_proveedor]
            );
            res.status(201).json({
                success: 'GPS creado exitosamente',
                nuevoGps: nuevoGps.rows[0],
            });
        } catch (error) {
            res.status(500).json({
                error: "Ha ocurrido un error al intentar crear el GPS",
                message: error.message,
            });
        }
    });
}

const deleteById = async (req, res) => {
    await withConnection(async (client) => {
        try {
            const id = req.params.id;
            const gps = await client.query('SELECT * FROM public."gps" WHERE id = $1', [id]);
            if (gps.rows.length === 0) {
                res.status(404).json({ error: 'GPS no encontrado' });
                return;
            }
            await client.query('DELETE FROM public."gps" WHERE id = $1', [id]);
            res.status(200).json({
                success: 'GPS eliminado exitosamente',
                gpsEliminado: gps.rows[0],
            });
        } catch (error) {
            res.status(500).json({
                error: "Ha ocurrido un error al intentar eliminar el GPS",
                message: error.message,
            });
        }
    });
}

const update = async (req, res) => {
    await withConnection(async (client) => {
        try {
            const id = req.params.id;
            const { descripcion, id_proveedor } = req.body;
            
            const gps = await client.query('SELECT * FROM public."gps" WHERE id = $1', [id]);
            if (gps.rows.length === 0) {
                res.status(404).json({ error: 'GPS no encontrado' });
                return;
            }
            
            const gpsActualizado = await client.query(
                'UPDATE public."gps" SET descripcion = $1, id_proveedor = $2 WHERE id = $3 RETURNING *', 
                [descripcion, id_proveedor, id]
            );
            
            res.status(200).json({
                success: 'GPS actualizado exitosamente',
                gpsActualizado: gpsActualizado.rows[0],
            });
        } catch (error) {
            res.status(500).json({
                error: "Ha ocurrido un error al intentar actualizar el GPS",
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