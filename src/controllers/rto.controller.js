const { withConnection } = require('../../database/dbHelper'); // ✅ SOLO esto

const getList = async (req, res) => {
    await withConnection(async (client) => {
        try {
            const rtos = await client.query(`
                SELECT r.*, tr.descripcion as tipo_rto 
                FROM public."rto" r
                INNER JOIN public."tipo_rto" tr ON r.id_tipo_rto = tr.id
                ORDER BY r.fecha_vencimiento DESC
            `);
            res.status(200).json(rtos.rows);
        } catch (error) {
            res.status(500).json({
                error: "Ha ocurrido un error al intentar obtener los RTOs",
                message: error.message,
            });
        }
    });
}

const getById = async (req, res) => {
    await withConnection(async (client) => {
        try {
            const id = req.params.id;
            const rto = await client.query(`
                SELECT r.*, tr.descripcion as tipo_rto 
                FROM public."rto" r
                INNER JOIN public."tipo_rto" tr ON r.id_tipo_rto = tr.id
                WHERE r.id = $1
            `, [id]);
            
            if (rto.rows.length === 0) {
                res.status(404).json({ error: 'RTO no encontrado' });
                return;
            }
            res.status(200).json(rto.rows[0]);
        } catch (error) {
            res.status(500).json({
                error: "Ha ocurrido un error al intentar obtener el RTO",
                message: error.message,
            });
        }
    });
}

const insert = async (req, res) => {
    await withConnection(async (client) => {
        try {
            const { fecha_vencimiento, descripcion, id_tipo_rto, img_rto } = req.body;
            const nuevoRto = await client.query(
                'INSERT INTO public."rto" (fecha_vencimiento, descripcion, id_tipo_rto, img_rto) VALUES ($1, $2, $3, $4) RETURNING *', 
                [fecha_vencimiento, descripcion, id_tipo_rto, img_rto]
            );
            res.status(201).json({
                success: 'RTO creado exitosamente',
                nuevoRto: nuevoRto.rows[0],
            });
        } catch (error) {
            res.status(500).json({
                error: "Ha ocurrido un error al intentar crear el RTO",
                message: error.message,
            });
        }
    });
}

const deleteById = async (req, res) => {
    await withConnection(async (client) => {
        try {
            const id = req.params.id;
            const rto = await client.query('SELECT * FROM public."rto" WHERE id = $1', [id]);
            if (rto.rows.length === 0) {
                res.status(404).json({ error: 'RTO no encontrado' });
                return;
            }
            await client.query('DELETE FROM public."rto" WHERE id = $1', [id]);
            res.status(200).json({
                success: 'RTO eliminado exitosamente',
                rtoEliminado: rto.rows[0],
            });
        } catch (error) {
            res.status(500).json({
                error: "Ha ocurrido un error al intentar eliminar el RTO",
                message: error.message,
            });
        }
    });
}

const update = async (req, res) => {
    await withConnection(async (client) => {
        try {
            const id = req.params.id;
            const { fecha_vencimiento, descripcion, id_tipo_rto, img_rto } = req.body;
            
            const rto = await client.query('SELECT * FROM public."rto" WHERE id = $1', [id]);
            if (rto.rows.length === 0) {
                res.status(404).json({ error: 'RTO no encontrado' });
                return;
            }
            
            const rtoActualizado = await client.query(
                'UPDATE public."rto" SET fecha_vencimiento = $1, descripcion = $2, id_tipo_rto = $3, img_rto = $4 WHERE id = $5 RETURNING *', 
                [fecha_vencimiento, descripcion, id_tipo_rto, img_rto, id]
            );
            
            res.status(200).json({
                success: 'RTO actualizado exitosamente',
                rtoActualizado: rtoActualizado.rows[0],
            });
        } catch (error) {
            res.status(500).json({
                error: "Ha ocurrido un error al intentar actualizar el RTO",
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