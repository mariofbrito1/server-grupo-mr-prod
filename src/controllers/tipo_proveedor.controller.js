const { withConnection } = require('../../database/dbHelper'); // ✅ SOLO esto

const getList = async (req, res) => {
    await withConnection(async (client) => {
        try {
            const tipos = await client.query('SELECT * FROM public."tipo_proveedor" ORDER BY tipo');
            res.status(200).json(tipos.rows);
        } catch (error) {
            res.status(500).json({
                error: "Ha ocurrido un error al intentar obtener los tipos de proveedor",
                message: error.message,
            });
        }
    });
}

const getById = async (req, res) => {
    await withConnection(async (client) => {
        try {
            const id = req.params.id;
            const tipo = await client.query('SELECT * FROM public."tipo_proveedor" WHERE id = $1', [id]);
            if (tipo.rows.length === 0) {
                res.status(404).json({ error: 'Tipo de proveedor no encontrado' });
                return;
            }
            res.status(200).json(tipo.rows[0]);
        } catch (error) {
            res.status(500).json({
                error: "Ha ocurrido un error al intentar obtener el tipo de proveedor",
                message: error.message,
            });
        }
    });
}

const insert = async (req, res) => {
    await withConnection(async (client) => {
        try {
            const { tipo } = req.body;
            const nuevoTipo = await client.query(
                'INSERT INTO public."tipo_proveedor" (tipo) VALUES ($1) RETURNING *', 
                [tipo]
            );
            res.status(201).json({
                success: 'Tipo de proveedor creado exitosamente',
                nuevoTipo: nuevoTipo.rows[0],
            });
        } catch (error) {
            res.status(500).json({
                error: "Ha ocurrido un error al intentar crear el tipo de proveedor",
                message: error.message,
            });
        }
    });
}

const deleteById = async (req, res) => {
    await withConnection(async (client) => {
        try {
            const id = req.params.id;
            const tipo = await client.query('SELECT * FROM public."tipo_proveedor" WHERE id = $1', [id]);
            if (tipo.rows.length === 0) {
                res.status(404).json({ error: 'Tipo de proveedor no encontrado' });
                return;
            }
            await client.query('DELETE FROM public."tipo_proveedor" WHERE id = $1', [id]);
            res.status(200).json({
                success: 'Tipo de proveedor eliminado exitosamente',
                tipoEliminado: tipo.rows[0],
            });
        } catch (error) {
            res.status(500).json({
                error: "Ha ocurrido un error al intentar eliminar el tipo de proveedor",
                message: error.message,
            });
        }
    });
}

const update = async (req, res) => {
    await withConnection(async (client) => {
        try {
            const id = req.params.id;
            const { tipo } = req.body;
            
            const tipoProveedor = await client.query('SELECT * FROM public."tipo_proveedor" WHERE id = $1', [id]);
            if (tipoProveedor.rows.length === 0) {
                res.status(404).json({ error: 'Tipo de proveedor no encontrado' });
                return;
            }
            
            const tipoActualizado = await client.query(
                'UPDATE public."tipo_proveedor" SET tipo = $1 WHERE id = $2 RETURNING *', 
                [tipo, id]
            );
            
            res.status(200).json({
                success: 'Tipo de proveedor actualizado exitosamente',
                tipoActualizado: tipoActualizado.rows[0],
            });
        } catch (error) {
            res.status(500).json({
                error: "Ha ocurrido un error al intentar actualizar el tipo de proveedor",
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