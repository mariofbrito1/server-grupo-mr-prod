const { withConnection } = require('../../database/dbHelper'); // ✅ AGREGA ESTA LÍNEA

const getList = async (req, res) => {
    await withConnection(async (client) => {
        try {
            const camaras = await client.query('SELECT c.*, p.descripcion as proveedor FROM public."camara" c INNER JOIN public."proveedor" p ON c.id_proveedor = p.id ORDER BY c.descripcion DESC');
            res.status(200).json(camaras.rows);
        } catch (error) {
            res.status(500).json({
                error: "Ha ocurrido un error al intentar obtener las cámaras",
                message: error.message,
            });
        }
    });
} 
 
const getById = async (req, res) => {
    await withConnection(async (client) => {
        try {
            const id = req.params.id;
            const camara = await client.query('SELECT c.*, p.descripcion as proveedor FROM public."camara" c INNER JOIN public."proveedor" p ON c.id_proveedor = p.id WHERE c.id = $1', [id]);
            if (camara.rows.length === 0) {
                res.status(404).json({ error: 'Cámara no encontrada' });
                return;
            }
            res.status(200).json(camara.rows[0]);
        } catch (error) {
            res.status(500).json({
                error: "Ha ocurrido un error al intentar obtener la cámara",
                message: error.message,
            });
        }
    });
}

const insert = async (req, res) => {
    await withConnection(async (client) => {
        try {
            const { descripcion, id_proveedor } = req.body;
            
            // Validación básica
            if (!descripcion || !id_proveedor) {
                res.status(400).json({ error: 'Los campos descripcion e id_proveedor son requeridos' });
                return;
            }
            
            const nuevaCamara = await client.query(
                'INSERT INTO public."camara" (descripcion, id_proveedor) VALUES ($1, $2) RETURNING id, descripcion, id_proveedor', 
                [descripcion, id_proveedor]
            );
            res.status(201).json({
                success: 'Cámara creada exitosamente',
                nuevaCamara: nuevaCamara.rows[0],
            });
        } catch (error) {
            res.status(500).json({
                error: "Ha ocurrido un error al intentar crear la cámara",
                message: error.message,
            });
        }
    });
}

const deleteById = async (req, res) => {
    await withConnection(async (client) => {
        try {
            const id = req.params.id;
            const camara = await client.query('SELECT * FROM public."camara" WHERE id = $1', [id]);
            if (camara.rows.length === 0) {
                res.status(404).json({ error: 'Cámara no encontrada' });
                return;
            }
            await client.query('DELETE FROM public."camara" WHERE id = $1', [id]);
            res.status(200).json({
                success: 'Cámara eliminada exitosamente',
                camaraEliminada: camara.rows[0],
            });
        } catch (error) {
            res.status(500).json({
                error: "Ha ocurrido un error al intentar eliminar la cámara",
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
            
            // Validación básica
            if (!descripcion || !id_proveedor) {
                res.status(400).json({ error: 'Los campos descripcion e id_proveedor son requeridos' });
                return;
            }
            
            const camara = await client.query('SELECT * FROM public."camara" WHERE id = $1', [id]);
            if (camara.rows.length === 0) {
                res.status(404).json({ error: 'Cámara no encontrada' });
                return;
            }
            
            const camaraActualizada = await client.query(
                'UPDATE public."camara" SET descripcion = $1, id_proveedor = $2 WHERE id = $3 RETURNING id, descripcion, id_proveedor', 
                [descripcion, id_proveedor, id]
            );
            
            res.status(200).json({
                success: 'Cámara actualizada exitosamente',
                camaraActualizada: camaraActualizada.rows[0],
            });
        } catch (error) {
            res.status(500).json({
                error: "Ha ocurrido un error al intentar actualizar la cámara",
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