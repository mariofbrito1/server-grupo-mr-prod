const { withConnection } = require('../../database/dbHelper'); // ✅ SOLO esto

const getList = async (req, res) => {
    await withConnection(async (client) => {
        try {
            const tareasPlanes = await client.query(`
                SELECT tp.*, 
                       t.descripcion as tarea,
                       p.descripcion as plan
                FROM public."tarea_plan" tp
                INNER JOIN public."tarea" t ON tp.id_tarea = t.id
                INNER JOIN public."plan" p ON tp.id_plan = p.id
                ORDER BY t.descripcion, p.descripcion
            `);
            res.status(200).json(tareasPlanes.rows);
        } catch (error) {
            res.status(500).json({
                error: "Ha ocurrido un error al intentar obtener las tareas de planes",
                message: error.message,
            });
        }
    });
}

const getByTarea = async (req, res) => {
    await withConnection(async (client) => {
        try {
            const id_tarea = req.params.id_tarea;
            const planes = await client.query(`
                SELECT tp.*, p.descripcion as plan
                FROM public."tarea_plan" tp
                INNER JOIN public."plan" p ON tp.id_plan = p.id
                WHERE tp.id_tarea = $1
                ORDER BY p.descripcion
            `, [id_tarea]);
            
            res.status(200).json(planes.rows);
        } catch (error) {
            res.status(500).json({
                error: "Ha ocurrido un error al intentar obtener los planes de la tarea",
                message: error.message,
            });
        }
    });
}

const getByPlan = async (req, res) => {
    await withConnection(async (client) => {
        try {
            const id_plan = req.params.id_plan;
            const tareas = await client.query(`
                SELECT tp.*, t.descripcion as tarea
                FROM public."tarea_plan" tp
                INNER JOIN public."tarea" t ON tp.id_tarea = t.id
                WHERE tp.id_plan = $1
                ORDER BY t.descripcion
            `, [id_plan]);
            
            res.status(200).json(tareas.rows);
        } catch (error) {
            res.status(500).json({
                error: "Ha ocurrido un error al intentar obtener las tareas del plan",
                message: error.message,
            });
        }
    });
}

const insert = async (req, res) => {
    await withConnection(async (client) => {
        try {
            const { id_tarea, id_plan } = req.body;
            
            // Verificar si ya existe la relación
            const existe = await client.query(
                'SELECT * FROM public."tarea_plan" WHERE id_tarea = $1 AND id_plan = $2',
                [id_tarea, id_plan]
            );
            
            if (existe.rows.length > 0) {
                res.status(400).json({ error: 'Esta tarea ya está asignada al plan' });
                return;
            }
            
            const nuevaRelacion = await client.query(
                'INSERT INTO public."tarea_plan" (id_tarea, id_plan) VALUES ($1, $2) RETURNING *', 
                [id_tarea, id_plan]
            );
            
            res.status(201).json({
                success: 'Tarea asignada al plan exitosamente',
                nuevaRelacion: nuevaRelacion.rows[0],
            });
        } catch (error) {
            res.status(500).json({
                error: "Ha ocurrido un error al intentar asignar la tarea al plan",
                message: error.message,
            });
        }
    });
}

const deleteById = async (req, res) => {
    await withConnection(async (client) => {
        try {
            const { id_tarea, id_plan } = req.params;
            
            const relacion = await client.query(
                'SELECT * FROM public."tarea_plan" WHERE id_tarea = $1 AND id_plan = $2',
                [id_tarea, id_plan]
            );
            
            if (relacion.rows.length === 0) {
                res.status(404).json({ error: 'Relación no encontrada' });
                return;
            }
            
            await client.query(
                'DELETE FROM public."tarea_plan" WHERE id_tarea = $1 AND id_plan = $2',
                [id_tarea, id_plan]
            );
            
            res.status(200).json({
                success: 'Tarea removida del plan exitosamente',
                relacionEliminada: relacion.rows[0],
            });
        } catch (error) {
            res.status(500).json({
                error: "Ha ocurrido un error al intentar remover la tarea del plan",
                message: error.message,
            });
        }
    });
}

module.exports = {
    getList,
    getByTarea,
    getByPlan,
    insert,
    deleteById
}