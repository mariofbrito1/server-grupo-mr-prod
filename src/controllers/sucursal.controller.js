const { withConnection } = require('../../database/dbHelper'); // ✅ SOLO esto

const getList = async (req, res) => {
    console.log("get sucursal ");
    await withConnection(async (client) => {
        try {
            const sucursales = await client.query(`
                SELECT s.*, c.descripcion as centro 
                FROM public."sucursal" s
                INNER JOIN public."centro" c ON s.id_centro = c.id
                ORDER BY s.descripcion
            `);
            res.status(200).json(sucursales.rows);
        } catch (error) {
            res.status(500).json({
                error: "Ha ocurrido un error al intentar obtener las sucursales",
                message: error.message,
            });
        }
    });
}

const getListActive = async (req, res) => {
    await withConnection(async (client) => {
        try {
            const sucursales = await client.query(`
                SELECT s.*, c.descripcion as centro 
                FROM public."sucursal" s
                INNER JOIN public."centro" c ON s.id_centro = c.id
                WHERE s.activa = true
                ORDER BY s.descripcion
            `);
            res.status(200).json(sucursales.rows);
        } catch (error) {
            res.status(500).json({
                error: "Ha ocurrido un error al intentar obtener las sucursales activas",
                message: error.message,
            });
        }
    });
}

const getById = async (req, res) => {
    await withConnection(async (client) => {
        try {
            const id = req.params.id;
            const sucursal = await client.query(`
                SELECT s.*, c.descripcion as centro 
                FROM public."sucursal" s
                INNER JOIN public."centro" c ON s.id_centro = c.id
                WHERE s.id = $1
            `, [id]);
            
            if (sucursal.rows.length === 0) {
                res.status(404).json({ error: 'Sucursal no encontrada' });
                return;
            }
            res.status(200).json(sucursal.rows[0]);
        } catch (error) {
            res.status(500).json({
                error: "Ha ocurrido un error al intentar obtener la sucursal",
                message: error.message,
            });
        }
    });
}

const insert = async (req, res) => {
    await withConnection(async (client) => {
        try {
            const { descripcion, id_centro, ubicacion } = req.body;
            const nuevaSucursal = await client.query(
                'INSERT INTO public."sucursal" (descripcion, id_centro, ubicacion) VALUES ($1, $2, $3) RETURNING *', 
                [descripcion, id_centro, ubicacion]
            );
            res.status(201).json({
                success: 'Sucursal creada exitosamente',
                nuevaSucursal: nuevaSucursal.rows[0],
            });
        } catch (error) {
            res.status(500).json({
                error: "Ha ocurrido un error al intentar crear la sucursal",
                message: error.message,
            });
        }
    });
}

const deleteById = async (req, res) => {
    await withConnection(async (client) => {
        try {
            const id = req.params.id;
            const sucursal = await client.query('SELECT * FROM public."sucursal" WHERE id = $1', [id]);
            if (sucursal.rows.length === 0) {
                res.status(404).json({ error: 'Sucursal no encontrada' });
                return;
            }
            await client.query('DELETE FROM public."sucursal" WHERE id = $1', [id]);
            res.status(200).json({
                success: 'Sucursal eliminada exitosamente',
                sucursalEliminada: sucursal.rows[0],
            });
        } catch (error) {
            res.status(500).json({
                error: "Ha ocurrido un error al intentar eliminar la sucursal",
                message: error.message,
            });
        }
    });
}

const update = async (req, res) => {
    await withConnection(async (client) => {
        try {
            const id = req.params.id;
            const { descripcion, activa, id_centro, ubicacion } = req.body;
            
            const sucursal = await client.query('SELECT * FROM public."sucursal" WHERE id = $1', [id]);
            if (sucursal.rows.length === 0) {
                res.status(404).json({ error: 'Sucursal no encontrada' });
                return;
            }
            
            const sucursalActualizada = await client.query(
                'UPDATE public."sucursal" SET descripcion = $1, activa = $2, id_centro = $3, ubicacion = $4 WHERE id = $5 RETURNING *', 
                [descripcion, activa, id_centro, ubicacion, id]
            );
            
            res.status(200).json({
                success: 'Sucursal actualizada exitosamente',
                sucursalActualizada: sucursalActualizada.rows[0],
            });
        } catch (error) {
            res.status(500).json({
                error: "Ha ocurrido un error al intentar actualizar la sucursal",
                message: error.message,
            });
        }
    });
}

module.exports = {
    getList,
    getListActive,
    getById,
    insert,
    update,
    deleteById
}