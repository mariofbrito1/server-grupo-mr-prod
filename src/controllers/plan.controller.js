const { withConnection } = require('../../database/dbHelper'); // ✅ SOLO esto

const getList = async (req, res) => {
    await withConnection(async (client) => {
        try {
            const planes = await client.query(`
                SELECT p.*, tp.descripcion as tipo_plan 
                FROM public."plan" p
                INNER JOIN public."tipo_plan" tp ON p.id_tipo_plan = tp.id
                ORDER BY p.descripcion
            `);
            res.status(200).json(planes.rows);
        } catch (error) {
            res.status(500).json({
                error: "Ha ocurrido un error al intentar obtener los planes",
                message: error.message,
            });
        }
    });
}

const getById = async (req, res) => {
    await withConnection(async (client) => {
        try {
            const id = req.params.id;
            const plan = await client.query(`
                SELECT p.*, tp.descripcion as tipo_plan 
                FROM public."plan" p
                INNER JOIN public."tipo_plan" tp ON p.id_tipo_plan = tp.id
                WHERE p.id = $1
            `, [id]);
            
            if (plan.rows.length === 0) {
                res.status(404).json({ error: 'Plan no encontrado' });
                return;
            }
            res.status(200).json(plan.rows[0]);
        } catch (error) {
            res.status(500).json({
                error: "Ha ocurrido un error al intentar obtener el plan",
                message: error.message,
            });
        }
    });
}

const insert = async (req, res) => {
    await withConnection(async (client) => {
        try {
            const { descripcion, id_tipo_plan } = req.body;
            const nuevoPlan = await client.query(
                'INSERT INTO public."plan" (descripcion, id_tipo_plan) VALUES ($1, $2) RETURNING *', 
                [descripcion, id_tipo_plan]
            );
            res.status(201).json({
                success: 'Plan creado exitosamente',
                nuevoPlan: nuevoPlan.rows[0],
            });
        } catch (error) {
            res.status(500).json({
                error: "Ha ocurrido un error al intentar crear el plan",
                message: error.message,
            });
        }
    });
}

const deleteById = async (req, res) => {
    await withConnection(async (client) => {
        try {
            const id = req.params.id;
            const plan = await client.query('SELECT * FROM public."plan" WHERE id = $1', [id]);
            if (plan.rows.length === 0) {
                res.status(404).json({ error: 'Plan no encontrado' });
                return;
            }
            await client.query('DELETE FROM public."plan" WHERE id = $1', [id]);
            res.status(200).json({
                success: 'Plan eliminado exitosamente',
                planEliminado: plan.rows[0],
            });
        } catch (error) {
            res.status(500).json({
                error: "Ha ocurrido un error al intentar eliminar el plan",
                message: error.message,
            });
        }
    });
}

const update = async (req, res) => {
    await withConnection(async (client) => {
        try {
            const id = req.params.id;
            const { descripcion, id_tipo_plan } = req.body;
            
            const plan = await client.query('SELECT * FROM public."plan" WHERE id = $1', [id]);
            if (plan.rows.length === 0) {
                res.status(404).json({ error: 'Plan no encontrado' });
                return;
            }
            
            const planActualizado = await client.query(
                'UPDATE public."plan" SET descripcion = $1, id_tipo_plan = $2 WHERE id = $3 RETURNING *', 
                [descripcion, id_tipo_plan, id]
            );
            
            res.status(200).json({
                success: 'Plan actualizado exitosamente',
                planActualizado: planActualizado.rows[0],
            });
        } catch (error) {
            res.status(500).json({
                error: "Ha ocurrido un error al intentar actualizar el plan",
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