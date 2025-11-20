const { withConnection } = require('../dbHelper'); 

const getList = async (req, res) => {
    await withConnection(async (client) => {
        try {
            const tanques = await client.query(`
                SELECT t.*, 
                       tt.descripcion as tipo_tanque,
                       s.descripcion as sucursal,
                       et.descripcion as estado_tanque
                FROM public."tanque" t
                INNER JOIN public."tipo_tanque" tt ON t.id_tipo_tanque = tt.id
                INNER JOIN public."sucursal" s ON t.id_sucursal = s.id
                INNER JOIN public."estado_tanque" et ON t.id_estado = et.id
                ORDER BY t.descripcion
            `);
            res.status(200).json(tanques.rows);
        } catch (error) {
            res.status(500).json({
                error: "Ha ocurrido un error al intentar obtener los tanques",
                message: error.message,
            });
        }
    });
}

const getById = async (req, res) => {
    await withConnection(async (client) => {
        try {
            const id = req.params.id;
            const tanque = await client.query(`
                SELECT t.*, 
                       tt.descripcion as tipo_tanque,
                       s.descripcion as sucursal,
                       et.descripcion as estado_tanque
                FROM public."tanque" t
                INNER JOIN public."tipo_tanque" tt ON t.id_tipo_tanque = tt.id
                INNER JOIN public."sucursal" s ON t.id_sucursal = s.id
                INNER JOIN public."estado_tanque" et ON t.id_estado = et.id
                WHERE t.id = $1
            `, [id]);
            
            if (tanque.rows.length === 0) {
                res.status(404).json({ error: 'Tanque no encontrado' });
                return;
            }
            res.status(200).json(tanque.rows[0]);
        } catch (error) {
            res.status(500).json({
                error: "Ha ocurrido un error al intentar obtener el tanque",
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
                id_tipo_tanque, 
                id_sucursal, 
                cantidad, 
                unidad, 
                id_estado 
            } = req.body;
            
            const nuevoTanque = await client.query(
                `INSERT INTO public."tanque" 
                (descripcion, id_tipo_tanque, id_sucursal, cantidad, unidad, id_estado) 
                VALUES ($1, $2, $3, $4, $5, $6) 
                RETURNING *`, 
                [descripcion, id_tipo_tanque, id_sucursal, cantidad, unidad, id_estado]
            );
            
            res.status(201).json({
                success: 'Tanque creado exitosamente',
                nuevoTanque: nuevoTanque.rows[0],
            });
        } catch (error) {
            res.status(500).json({
                error: "Ha ocurrido un error al intentar crear el tanque",
                message: error.message,
            });
        }
    });
}

const deleteById = async (req, res) => {
    await withConnection(async (client) => {
        try {
            const id = req.params.id;
            const tanque = await client.query('SELECT * FROM public."tanque" WHERE id = $1', [id]);
            if (tanque.rows.length === 0) {
                res.status(404).json({ error: 'Tanque no encontrado' });
                return;
            }
            await client.query('DELETE FROM public."tanque" WHERE id = $1', [id]);
            res.status(200).json({
                success: 'Tanque eliminado exitosamente',
                tanqueEliminado: tanque.rows[0],
            });
        } catch (error) {
            res.status(500).json({
                error: "Ha ocurrido un error al intentar eliminar el tanque",
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
                id_tipo_tanque, 
                id_sucursal, 
                cantidad, 
                unidad, 
                id_estado 
            } = req.body;
            
            const tanque = await client.query('SELECT * FROM public."tanque" WHERE id = $1', [id]);
            if (tanque.rows.length === 0) {
                res.status(404).json({ error: 'Tanque no encontrado' });
                return;
            }
            
            const tanqueActualizado = await client.query(
                `UPDATE public."tanque" 
                SET descripcion = $1, id_tipo_tanque = $2, id_sucursal = $3, 
                    cantidad = $4, unidad = $5, id_estado = $6
                WHERE id = $7 
                RETURNING *`, 
                [descripcion, id_tipo_tanque, id_sucursal, cantidad, unidad, id_estado, id]
            );
            
            res.status(200).json({
                success: 'Tanque actualizado exitosamente',
                tanqueActualizado: tanqueActualizado.rows[0],
            });
        } catch (error) {
            res.status(500).json({
                error: "Ha ocurrido un error al intentar actualizar el tanque",
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
