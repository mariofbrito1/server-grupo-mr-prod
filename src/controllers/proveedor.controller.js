const { withConnection } = require('../../database/dbHelper'); // ✅ SOLO esto

const getList = async (req, res) => {
    await withConnection(async (client) => {
        try {
            const proveedores = await client.query('SELECT * FROM public."proveedor" ORDER BY descripcion');
            res.status(200).json(proveedores.rows);
        } catch (error) {
            res.status(500).json({
                error: "Ha ocurrido un error al intentar obtener los proveedores",
                message: error.message,
            });
        }
    });
}

const getById = async (req, res) => {
    await withConnection(async (client) => {
        try {
            const id = req.params.id;
            const proveedor = await client.query('SELECT * FROM public."proveedor" WHERE id = $1', [id]);
            if (proveedor.rows.length === 0) {
                res.status(404).json({ error: 'Proveedor no encontrado' });
                return;
            }
            res.status(200).json(proveedor.rows[0]);
        } catch (error) {
            res.status(500).json({
                error: "Ha ocurrido un error al intentar obtener el proveedor",
                message: error.message,
            });
        }
    });
}

const insert = async (req, res) => {
    await withConnection(async (client) => {
        try {
            const { descripcion, telefono } = req.body;
            const nuevoProveedor = await client.query(
                'INSERT INTO public."proveedor" (descripcion, telefono) VALUES ($1, $2) RETURNING *', 
                [descripcion, telefono]
            );
            res.status(201).json({
                success: 'Proveedor creado exitosamente',
                nuevoProveedor: nuevoProveedor.rows[0],
            });
        } catch (error) {
            res.status(500).json({
                error: "Ha ocurrido un error al intentar crear el proveedor",
                message: error.message,
            });
        }
    });
}

const deleteById = async (req, res) => {
    await withConnection(async (client) => {
        try {
            const id = req.params.id;
            const proveedor = await client.query('SELECT * FROM public."proveedor" WHERE id = $1', [id]);
            if (proveedor.rows.length === 0) {
                res.status(404).json({ error: 'Proveedor no encontrado' });
                return;
            }
            await client.query('DELETE FROM public."proveedor" WHERE id = $1', [id]);
            res.status(200).json({
                success: 'Proveedor eliminado exitosamente',
                proveedorEliminado: proveedor.rows[0],
            });
        } catch (error) {
            res.status(500).json({
                error: "Ha ocurrido un error al intentar eliminar el proveedor",
                message: error.message,
            });
        }
    });
}

const update = async (req, res) => {
    await withConnection(async (client) => {
        try {
            const id = req.params.id;
            const { descripcion, telefono } = req.body;
            
            const proveedor = await client.query('SELECT * FROM public."proveedor" WHERE id = $1', [id]);
            if (proveedor.rows.length === 0) {
                res.status(404).json({ error: 'Proveedor no encontrado' });
                return;
            }
            
            const proveedorActualizado = await client.query(
                'UPDATE public."proveedor" SET descripcion = $1, telefono = $2 WHERE id = $3 RETURNING *', 
                [descripcion, telefono, id]
            );
            
            res.status(200).json({
                success: 'Proveedor actualizado exitosamente',
                proveedorActualizado: proveedorActualizado.rows[0],
            });
        } catch (error) {
            res.status(500).json({
                error: "Ha ocurrido un error al intentar actualizar el proveedor",
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