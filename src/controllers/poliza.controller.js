const { withConnection } = require('../dbHelper'); 

const getList = async (req, res) => {
    await withConnection(async (client) => {
        try {
            const polizas = await client.query(`
                SELECT p.*, prov.descripcion as proveedor 
                FROM public."poliza" p
                LEFT JOIN public."proveedor" prov ON p.id_proveedor = prov.id
                ORDER BY p.fecha_vencimiento DESC
            `);
            res.status(200).json(polizas.rows);
        } catch (error) {
            res.status(500).json({
                error: "Ha ocurrido un error al intentar obtener las pólizas",
                message: error.message,
            });
        }
    });
}

const getById = async (req, res) => {
    await withConnection(async (client) => {
        try {
            const id = req.params.id;
            const poliza = await client.query(`
                SELECT p.*, prov.descripcion as proveedor 
                FROM public."poliza" p
                LEFT JOIN public."proveedor" prov ON p.id_proveedor = prov.id
                WHERE p.id = $1
            `, [id]);
            
            if (poliza.rows.length === 0) {
                res.status(404).json({ error: 'Póliza no encontrada' });
                return;
            }
            res.status(200).json(poliza.rows[0]);
        } catch (error) {
            res.status(500).json({
                error: "Ha ocurrido un error al intentar obtener la póliza",
                message: error.message,
            });
        }
    });
}

const insert = async (req, res) => {
    await withConnection(async (client) => {
        try {
            const { descripcion, id_proveedor, img_poliza, fecha_vencimiento, numero } = req.body;
            const nuevaPoliza = await client.query(
                'INSERT INTO public."poliza" (descripcion, id_proveedor, img_poliza, fecha_vencimiento, numero) VALUES ($1, $2, $3, $4, $5) RETURNING *', 
                [descripcion, id_proveedor, img_poliza, fecha_vencimiento, numero]
            );
            res.status(201).json({
                success: 'Póliza creada exitosamente',
                nuevaPoliza: nuevaPoliza.rows[0],
            });
        } catch (error) {
            res.status(500).json({
                error: "Ha ocurrido un error al intentar crear la póliza",
                message: error.message,
            });
        }
    });
}

const deleteById = async (req, res) => {
    await withConnection(async (client) => {
        try {
            const id = req.params.id;
            const poliza = await client.query('SELECT * FROM public."poliza" WHERE id = $1', [id]);
            if (poliza.rows.length === 0) {
                res.status(404).json({ error: 'Póliza no encontrada' });
                return;
            }
            await client.query('DELETE FROM public."poliza" WHERE id = $1', [id]);
            res.status(200).json({
                success: 'Póliza eliminada exitosamente',
                polizaEliminada: poliza.rows[0],
            });
        } catch (error) {
            res.status(500).json({
                error: "Ha ocurrido un error al intentar eliminar la póliza",
                message: error.message,
            });
        }
    });
}

const update = async (req, res) => {
    await withConnection(async (client) => {
        try {
            const id = req.params.id;
            const { descripcion, id_proveedor, img_poliza, fecha_vencimiento, numero } = req.body;
            
            const poliza = await client.query('SELECT * FROM public."poliza" WHERE id = $1', [id]);
            if (poliza.rows.length === 0) {
                res.status(404).json({ error: 'Póliza no encontrada' });
                return;
            }
            
            const polizaActualizada = await client.query(
                'UPDATE public."poliza" SET descripcion = $1, id_proveedor = $2, img_poliza = $3, fecha_vencimiento = $4, numero = $5 WHERE id = $6 RETURNING *', 
                [descripcion, id_proveedor, img_poliza, fecha_vencimiento, numero, id]
            );
            
            res.status(200).json({
                success: 'Póliza actualizada exitosamente',
                polizaActualizada: polizaActualizada.rows[0],
            });
        } catch (error) {
            res.status(500).json({
                error: "Ha ocurrido un error al intentar actualizar la póliza",
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
