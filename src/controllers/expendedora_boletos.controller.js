const { withConnection } = require('../dbHelper'); 

const getList = async (req, res) => {
    await withConnection(async (client) => {
        try {
            const expendedoras = await client.query(`
                SELECT eb.*, p.descripcion as proveedor 
                FROM public."expendedora_boletos" eb
                INNER JOIN public."proveedor" p ON eb.id_proveedor = p.id
                ORDER BY eb.descripcion
            `);
            res.status(200).json(expendedoras.rows);
        } catch (error) {
            res.status(500).json({
                error: "Ha ocurrido un error al intentar obtener las expendedoras de boletos",
                message: error.message,
            });
        }
    });
}

const getById = async (req, res) => {
    await withConnection(async (client) => {
        try {
            const id = req.params.id;
            const expendedora = await client.query(`
                SELECT eb.*, p.descripcion as proveedor 
                FROM public."expendedora_boletos" eb
                INNER JOIN public."proveedor" p ON eb.id_proveedor = p.id
                WHERE eb.id = $1
            `, [id]);
            
            if (expendedora.rows.length === 0) {
                res.status(404).json({ error: 'Expendedora de boletos no encontrada' });
                return;
            }
            res.status(200).json(expendedora.rows[0]);
        } catch (error) {
            res.status(500).json({
                error: "Ha ocurrido un error al intentar obtener la expendedora de boletos",
                message: error.message,
            });
        }
    });
}

const insert = async (req, res) => {
    await withConnection(async (client) => {
        try {
            const { descripcion, id_proveedor } = req.body;
            const nuevaExpendedora = await client.query(
                'INSERT INTO public."expendedora_boletos" (descripcion, id_proveedor) VALUES ($1, $2) RETURNING *', 
                [descripcion, id_proveedor]
            );
            res.status(201).json({
                success: 'Expendedora de boletos creada exitosamente',
                nuevaExpendedora: nuevaExpendedora.rows[0],
            });
        } catch (error) {
            res.status(500).json({
                error: "Ha ocurrido un error al intentar crear la expendedora de boletos",
                message: error.message,
            });
        }
    });
}

const deleteById = async (req, res) => {
    await withConnection(async (client) => {
        try {
            const id = req.params.id;
            const expendedora = await client.query('SELECT * FROM public."expendedora_boletos" WHERE id = $1', [id]);
            if (expendedora.rows.length === 0) {
                res.status(404).json({ error: 'Expendedora de boletos no encontrada' });
                return;
            }
            await client.query('DELETE FROM public."expendedora_boletos" WHERE id = $1', [id]);
            res.status(200).json({
                success: 'Expendedora de boletos eliminada exitosamente',
                expendedoraEliminada: expendedora.rows[0],
            });
        } catch (error) {
            res.status(500).json({
                error: "Ha ocurrido un error al intentar eliminar la expendedora de boletos",
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
            
            const expendedora = await client.query('SELECT * FROM public."expendedora_boletos" WHERE id = $1', [id]);
            if (expendedora.rows.length === 0) {
                res.status(404).json({ error: 'Expendedora de boletos no encontrada' });
                return;
            }
            
            const expendedoraActualizada = await client.query(
                'UPDATE public."expendedora_boletos" SET descripcion = $1, id_proveedor = $2 WHERE id = $3 RETURNING *', 
                [descripcion, id_proveedor, id]
            );
            
            res.status(200).json({
                success: 'Expendedora de boletos actualizada exitosamente',
                expendedoraActualizada: expendedoraActualizada.rows[0],
            });
        } catch (error) {
            res.status(500).json({
                error: "Ha ocurrido un error al intentar actualizar la expendedora de boletos",
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
