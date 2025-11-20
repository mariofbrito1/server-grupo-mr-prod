const { withConnection } = require('../../database/dbHelper'); // ✅ SOLO esto

const getList = async (req, res) => {
    console.log("get sektor");
    await withConnection(async (client) => {
        try {
            const sectores = await client.query('SELECT * FROM public."sector" ORDER BY descripcion');
            res.status(200).json(sectores.rows);
        } catch (error) {
            res.status(500).json({
                error: "Ha ocurrido un error al intentar obtener los sectores",
                message: error.message,
            });
        }
    });
}

const getById = async (req, res) => {
    await withConnection(async (client) => {
        try {
            const id = req.params.id;
            const sector = await client.query('SELECT * FROM public."sector" WHERE id = $1', [id]);
            if (sector.rows.length === 0) {
                res.status(404).json({ error: 'Sector no encontrado' });
                return;
            }
            res.status(200).json(sector.rows[0]);
        } catch (error) {
            res.status(500).json({
                error: "Ha ocurrido un error al intentar obtener el sector",
                message: error.message,
            });
        }
    });
}

const insert = async (req, res) => {
    await withConnection(async (client) => {
        try {
            const { descripcion } = req.body;
            const nuevoSector = await client.query(
                'INSERT INTO public."sector" (descripcion) VALUES ($1) RETURNING *', 
                [descripcion]
            );
            res.status(201).json({
                success: 'Sector creado exitosamente',
                nuevoSector: nuevoSector.rows[0],
            });
        } catch (error) {
            res.status(500).json({
                error: "Ha ocurrido un error al intentar crear el sector",
                message: error.message,
            });
        }
    });
}

const deleteById = async (req, res) => {
    await withConnection(async (client) => {
        try {
            const id = req.params.id;
            const sector = await client.query('SELECT * FROM public."sector" WHERE id = $1', [id]);
            if (sector.rows.length === 0) {
                res.status(404).json({ error: 'Sector no encontrado' });
                return;
            }
            await client.query('DELETE FROM public."sector" WHERE id = $1', [id]);
            res.status(200).json({
                success: 'Sector eliminado exitosamente',
                sectorEliminado: sector.rows[0],
            });
        } catch (error) {
            res.status(500).json({
                error: "Ha ocurrido un error al intentar eliminar el sector",
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
            
            const sector = await client.query('SELECT * FROM public."sector" WHERE id = $1', [id]);
            if (sector.rows.length === 0) {
                res.status(404).json({ error: 'Sector no encontrado' });
                return;
            }
            
            const sectorActualizado = await client.query(
                'UPDATE public."sector" SET descripcion = $1 WHERE id = $2 RETURNING *', 
                [descripcion, id]
            );
            
            res.status(200).json({
                success: 'Sector actualizado exitosamente',
                sectorActualizado: sectorActualizado.rows[0],
            });
        } catch (error) {
            res.status(500).json({
                error: "Ha ocurrido un error al intentar actualizar el sector",
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