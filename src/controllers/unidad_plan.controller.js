const { withConnection } = require('../dbHelper'); 

const getList = async (req, res) => {
    await withConnection(async (client) => {
        try {
            const unidadesPlan = await client.query(`
                SELECT up.*, 
                       uv.nombre as unidad,
                       p.descripcion as plan
                FROM public."unidad_plan" up
                INNER JOIN public."unidad_vehiculo" uv ON up.id_unidad = uv.id
                INNER JOIN public."plan" p ON up.id_plan = p.id
                ORDER BY uv.nombre, p.descripcion
            `);
            res.status(200).json(unidadesPlan.rows);
        } catch (error) {
            res.status(500).json({
                error: "Ha ocurrido un error al intentar obtener las unidades de plan",
                message: error.message,
            });
        }
    });
}

const getByUnidad = async (req, res) => {
    await withConnection(async (client) => {
        try {
            const id_unidad = req.params.id_unidad;
            const planes = await client.query(`
                SELECT up.*, p.descripcion as plan
                FROM public."unidad_plan" up
                INNER JOIN public."plan" p ON up.id_plan = p.id
                WHERE up.id_unidad = $1
                ORDER BY p.descripcion
            `, [id_unidad]);
            
            res.status(200).json(planes.rows);
        } catch (error) {
            res.status(500).json({
                error: "Ha ocurrido un error al intentar obtener los planes de la unidad",
                message: error.message,
            });
        }
    });
}

const getByPlan = async (req, res) => {
    await withConnection(async (client) => {
        try {
            const id_plan = req.params.id_plan;
            const unidades = await client.query(`
                SELECT up.*, uv.nombre as unidad
                FROM public."unidad_plan" up
                INNER JOIN public."unidad_vehiculo" uv ON up.id_unidad = uv.id
                WHERE up.id_plan = $1
                ORDER BY uv.nombre
            `, [id_plan]);
            
            res.status(200).json(unidades.rows);
        } catch (error) {
            res.status(500).json({
                error: "Ha ocurrido un error al intentar obtener las unidades del plan",
                message: error.message,
            });
        }
    });
}

const insert = async (req, res) => {
    await withConnection(async (client) => {
        try {
            const { id_unidad, id_plan } = req.body;
            
            // Verificar si ya existe la relación
            const existe = await client.query(
                'SELECT * FROM public."unidad_plan" WHERE id_unidad = $1 AND id_plan = $2',
                [id_unidad, id_plan]
            );
            
            if (existe.rows.length > 0) {
                res.status(400).json({ error: 'Esta unidad ya está asignada al plan' });
                return;
            }
            
            const nuevaRelacion = await client.query(
                'INSERT INTO public."unidad_plan" (id_unidad, id_plan) VALUES ($1, $2) RETURNING *', 
                [id_unidad, id_plan]
            );
            
            res.status(201).json({
                success: 'Unidad asignada al plan exitosamente',
                nuevaRelacion: nuevaRelacion.rows[0],
            });
        } catch (error) {
            res.status(500).json({
                error: "Ha ocurrido un error al intentar asignar la unidad al plan",
                message: error.message,
            });
        }
    });
}

const deleteById = async (req, res) => {
    await withConnection(async (client) => {
        try {
            const { id_unidad, id_plan } = req.params;
            
            const relacion = await client.query(
                'SELECT * FROM public."unidad_plan" WHERE id_unidad = $1 AND id_plan = $2',
                [id_unidad, id_plan]
            );
            
            if (relacion.rows.length === 0) {
                res.status(404).json({ error: 'Relación no encontrada' });
                return;
            }
            
            await client.query(
                'DELETE FROM public."unidad_plan" WHERE id_unidad = $1 AND id_plan = $2',
                [id_unidad, id_plan]
            );
            
            res.status(200).json({
                success: 'Unidad removida del plan exitosamente',
                relacionEliminada: relacion.rows[0],
            });
        } catch (error) {
            res.status(500).json({
                error: "Ha ocurrido un error al intentar remover la unidad del plan",
                message: error.message,
            });
        }
    });
}

module.exports = {
    getList,
    getByUnidad,
    getByPlan,
    insert,
    deleteById
}
