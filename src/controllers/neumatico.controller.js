const { withConnection } = require('../../database/dbHelper'); // ✅ SOLO esto

const getList = async (req, res) => {
    await withConnection(async (client) => {
        try {
            const neumaticos = await client.query(`
                SELECT n.*, 
                       en.descripcion as estado_neumatico,
                       mn.descripcion as modelo_neumatico,
                       s.descripcion as sucursal_deposito,
                       uv.descripcion as vehiculo,
                       p.descripcion as proveedor
                FROM public."neumatico" n
                LEFT JOIN public."estado_neumatico" en ON n.id_estado_neumatico = en.id
                LEFT JOIN public."modelo_neumatico" mn ON n.id_modelo_neumatico = mn.id
                LEFT JOIN public."sucursal" s ON n.id_sucursal_deposito = s.id
                LEFT JOIN public."unidad_vehiculo" uv ON n.id_vehiculo = uv.id
                LEFT JOIN public."proveedor" p ON n.id_proveedor = p.id
                ORDER BY n.descripcion DESC
            `);
            res.status(200).json(neumaticos.rows);
        } catch (error) {
            res.status(500).json({
                error: "Ha ocurrido un error al intentar obtener los neumáticos",
                message: error.message,
            });
        }
    });
}

const getById = async (req, res) => {
    await withConnection(async (client) => {
        try {
            const id = req.params.id;
            const neumatico = await client.query(`
                SELECT n.*, 
                       en.descripcion as estado_neumatico,
                       mn.descripcion as modelo_neumatico,
                       s.descripcion as sucursal_deposito,
                       uv.descripcion as vehiculo,
                       p.descripcion as proveedor
                FROM public."neumatico" n
                LEFT JOIN public."estado_neumatico" en ON n.id_estado_neumatico = en.id
                LEFT JOIN public."modelo_neumatico" mn ON n.id_modelo_neumatico = mn.id
                LEFT JOIN public."sucursal" s ON n.id_sucursal_deposito = s.id
                LEFT JOIN public."unidad_vehiculo" uv ON n.id_vehiculo = uv.id
                LEFT JOIN public."proveedor" p ON n.id_proveedor = p.id
                WHERE n.id = $1
            `, [id]);
            
            if (neumatico.rows.length === 0) {
                res.status(404).json({ error: 'Neumático no encontrado' });
                return;
            }
            res.status(200).json(neumatico.rows[0]);
        } catch (error) {
            res.status(500).json({
                error: "Ha ocurrido un error al intentar obtener el neumático",
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
                km_inicial, 
                km_actual, 
                id_estado_neumatico, 
                dimensiones, 
                id_modelo_neumatico, 
                carga_minima, 
                carga_maxima, 
                marca_numerica, 
                id_sucursal_deposito, 
                id_vehiculo,
                id_proveedor
            } = req.body;
            
            const nuevoNeumatico = await client.query(
                `INSERT INTO public."neumatico" 
                (descripcion, km_inicial, km_actual, id_estado_neumatico, dimensiones, id_modelo_neumatico, 
                 carga_minima, carga_maxima, marca_numerica, id_sucursal_deposito, id_vehiculo, id_proveedor) 
                VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12) 
                RETURNING *`, 
                [descripcion, km_inicial, km_actual, id_estado_neumatico, dimensiones, id_modelo_neumatico, 
                 carga_minima, carga_maxima, marca_numerica, id_sucursal_deposito, id_vehiculo, id_proveedor]
            );
            
            res.status(201).json({
                success: 'Neumático creado exitosamente',
                nuevoNeumatico: nuevoNeumatico.rows[0],
            });
        } catch (error) {
            res.status(500).json({
                error: "Ha ocurrido un error al intentar crear el neumático",
                message: error.message,
            });
        }
    });
}

const deleteById = async (req, res) => {
    await withConnection(async (client) => {
        try {
            const id = req.params.id;
            const neumatico = await client.query('SELECT * FROM public."neumatico" WHERE id = $1', [id]);
            if (neumatico.rows.length === 0) {
                res.status(404).json({ error: 'Neumático no encontrado' });
                return;
            }
            await client.query('DELETE FROM public."neumatico" WHERE id = $1', [id]);
            res.status(200).json({
                success: 'Neumático eliminado exitosamente',
                neumaticoEliminado: neumatico.rows[0],
            });
        } catch (error) {
            res.status(500).json({
                error: "Ha ocurrido un error al intentar eliminar el neumático",
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
                km_inicial, 
                km_actual, 
                id_estado_neumatico, 
                dimensiones, 
                id_modelo_neumatico, 
                carga_minima, 
                carga_maxima, 
                marca_numerica, 
                id_sucursal_deposito, 
                id_vehiculo,
                id_proveedor
            } = req.body;
            
            const neumatico = await client.query('SELECT * FROM public."neumatico" WHERE id = $1', [id]);
            if (neumatico.rows.length === 0) {
                res.status(404).json({ error: 'Neumático no encontrado' });
                return;
            }
            
            const neumaticoActualizado = await client.query(
                `UPDATE public."neumatico" 
                SET descripcion = $1, km_inicial = $2, km_actual = $3, id_estado_neumatico = $4, dimensiones = $5, 
                    id_modelo_neumatico = $6, carga_minima = $7, carga_maxima = $8, marca_numerica = $9, 
                    id_sucursal_deposito = $10, id_vehiculo = $11, id_proveedor = $12
                WHERE id = $13 
                RETURNING *`, 
                [descripcion, km_inicial, km_actual, id_estado_neumatico, dimensiones, id_modelo_neumatico, 
                 carga_minima, carga_maxima, marca_numerica, id_sucursal_deposito, id_vehiculo, id_proveedor, id]
            );
            
            res.status(200).json({
                success: 'Neumático actualizado exitosamente',
                neumaticoActualizado: neumaticoActualizado.rows[0],
            });
        } catch (error) {
            res.status(500).json({
                error: "Ha ocurrido un error al intentar actualizar el neumático",
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