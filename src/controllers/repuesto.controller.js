const { withConnection } = require('../../database/dbHelper'); // ✅ SOLO esto

const getList = async (req, res) => {
    await withConnection(async (client) => {
        try {
            const repuestos = await client.query(`
                SELECT r.*, 
                       s.descripcion as sucursal,
                       er.descripcion as estado_repuesto,
                       emr.descripcion as estado_movimiento,
                       c.descripcion as centro
                FROM public."repuesto" r
                INNER JOIN public."sucursal" s ON r.id_sucursal = s.id
                INNER JOIN public."estado_repuesto" er ON r.id_estado = er.id
                INNER JOIN public."estado_movimiento_repuesto" emr ON r.id_estado_movimiento = emr.id
                INNER JOIN public."centro" c ON r.id_centro = c.id
                ORDER BY r.descripcion
            `);
            res.status(200).json(repuestos.rows);
        } catch (error) {
            res.status(500).json({
                error: "Ha ocurrido un error al intentar obtener los repuestos",
                message: error.message,
            });
        }
    });
}

const getById = async (req, res) => {
    await withConnection(async (client) => {
        try {
            const id = req.params.id;
            const repuesto = await client.query(`
                SELECT r.*, 
                       s.descripcion as sucursal,
                       er.descripcion as estado_repuesto,
                       emr.descripcion as estado_movimiento,
                       c.descripcion as centro
                FROM public."repuesto" r
                INNER JOIN public."sucursal" s ON r.id_sucursal = s.id
                INNER JOIN public."estado_repuesto" er ON r.id_estado = er.id
                INNER JOIN public."estado_movimiento_repuesto" emr ON r.id_estado_movimiento = emr.id
                INNER JOIN public."centro" c ON r.id_centro = c.id
                WHERE r.id = $1
            `, [id]);
            
            if (repuesto.rows.length === 0) {
                res.status(404).json({ error: 'Repuesto no encontrado' });
                return;
            }
            res.status(200).json(repuesto.rows[0]);
        } catch (error) {
            res.status(500).json({
                error: "Ha ocurrido un error al intentar obtener el repuesto",
                message: error.message,
            });
        }
    });
}

const insert = async (req, res) => {
    await withConnection(async (client) => {
        try {
            const { 
                descripcion, 
                id_sucursal, 
                id_estado, 
                id_estado_movimiento, 
                stock_critico, 
                stock, 
                precio, 
                codigo, 
                id_centro 
            } = req.body;
            
            const nuevoRepuesto = await client.query(
                `INSERT INTO public."repuesto" 
                (descripcion, id_sucursal, id_estado, id_estado_movimiento, stock_critico, stock, precio, codigo, id_centro) 
                VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) 
                RETURNING *`, 
                [descripcion, id_sucursal, id_estado, id_estado_movimiento, stock_critico, stock, precio, codigo, id_centro]
            );
            
            res.status(201).json({
                success: 'Repuesto creado exitosamente',
                nuevoRepuesto: nuevoRepuesto.rows[0],
            });
        } catch (error) {
            res.status(500).json({
                error: "Ha ocurrido un error al intentar crear el repuesto",
                message: error.message,
            });
        }
    });
}

const deleteById = async (req, res) => {
    await withConnection(async (client) => {
        try {
            const id = req.params.id;
            const repuesto = await client.query('SELECT * FROM public."repuesto" WHERE id = $1', [id]);
            if (repuesto.rows.length === 0) {
                res.status(404).json({ error: 'Repuesto no encontrado' });
                return;
            }
            await client.query('DELETE FROM public."repuesto" WHERE id = $1', [id]);
            res.status(200).json({
                success: 'Repuesto eliminado exitosamente',
                repuestoEliminado: repuesto.rows[0],
            });
        } catch (error) {
            res.status(500).json({
                error: "Ha ocurrido un error al intentar eliminar el repuesto",
                message: error.message,
            });
        }
    });
}

const update = async (req, res) => {
    await withConnection(async (client) => {
        try {
            const id = req.params.id;
            const { 
                descripcion, 
                id_sucursal, 
                id_estado, 
                id_estado_movimiento, 
                stock_critico, 
                stock, 
                precio, 
                codigo, 
                id_centro 
            } = req.body;
            
            const repuesto = await client.query('SELECT * FROM public."repuesto" WHERE id = $1', [id]);
            if (repuesto.rows.length === 0) {
                res.status(404).json({ error: 'Repuesto no encontrado' });
                return;
            }
            
            const repuestoActualizado = await client.query(
                `UPDATE public."repuesto" 
                SET descripcion = $1, id_sucursal = $2, id_estado = $3, id_estado_movimiento = $4, 
                    stock_critico = $5, stock = $6, precio = $7, codigo = $8, id_centro = $9
                WHERE id = $10 
                RETURNING *`, 
                [descripcion, id_sucursal, id_estado, id_estado_movimiento, stock_critico, stock, precio, codigo, id_centro, id]
            );
            
            res.status(200).json({
                success: 'Repuesto actualizado exitosamente',
                repuestoActualizado: repuestoActualizado.rows[0],
            });
        } catch (error) {
            res.status(500).json({
                error: "Ha ocurrido un error al intentar actualizar el repuesto",
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