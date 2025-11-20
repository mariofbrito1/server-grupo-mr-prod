const { withConnection } = require('../../database/dbHelper'); // ✅ SOLO esto

const getList = async (req, res) => {
    await withConnection(async (client) => {
        try {
            const modelos = await client.query('SELECT * FROM public."modelo_neumatico" ORDER BY descripcion');
            res.status(200).json(modelos.rows);
        } catch (error) {
            res.status(500).json({
                error: "Ha ocurrido un error al intentar obtener los modelos de neumático",
                message: error.message,
            });
        }
    });
}

const getById = async (req, res) => {
    await withConnection(async (client) => {
        try {
            const id = req.params.id;
            const modelo = await client.query('SELECT * FROM public."modelo_neumatico" WHERE id = $1', [id]);
            if (modelo.rows.length === 0) {
                res.status(404).json({ error: 'Modelo de neumático no encontrado' });
                return;
            }
            res.status(200).json(modelo.rows[0]);
        } catch (error) {
            res.status(500).json({
                error: "Ha ocurrido un error al intentar obtener el modelo de neumático",
                message: error.message,
            });
        }
    });
}

const insert = async (req, res) => {
    await withConnection(async (client) => {
        try {
            const { descripcion } = req.body;
            const nuevoModelo = await client.query(
                'INSERT INTO public."modelo_neumatico" (descripcion) VALUES ($1) RETURNING *', 
                [descripcion]
            );
            res.status(201).json({
                success: 'Modelo de neumático creado exitosamente',
                nuevoModelo: nuevoModelo.rows[0],
            });
        } catch (error) {
            res.status(500).json({
                error: "Ha ocurrido un error al intentar crear el modelo de neumático",
                message: error.message,
            });
        }
    });
}

const deleteById = async (req, res) => {
    await withConnection(async (client) => {
        try {
            const id = req.params.id;
            const modelo = await client.query('SELECT * FROM public."modelo_neumatico" WHERE id = $1', [id]);
            if (modelo.rows.length === 0) {
                res.status(404).json({ error: 'Modelo de neumático no encontrado' });
                return;
            }
            await client.query('DELETE FROM public."modelo_neumatico" WHERE id = $1', [id]);
            res.status(200).json({
                success: 'Modelo de neumático eliminado exitosamente',
                modeloEliminado: modelo.rows[0],
            });
        } catch (error) {
            res.status(500).json({
                error: "Ha ocurrido un error al intentar eliminar el modelo de neumático",
                message: error.message,
            });
        }
    });
}

const update = async (req, res) => {
    await withConnection(async (client) => {
        try {
            const id = req.params.id;
            const { descripcion } = req.body;
            
            const modelo = await client.query('SELECT * FROM public."modelo_neumatico" WHERE id = $1', [id]);
            if (modelo.rows.length === 0) {
                res.status(404).json({ error: 'Modelo de neumático no encontrado' });
                return;
            }
            
            const modeloActualizado = await client.query(
                'UPDATE public."modelo_neumatico" SET descripcion = $1 WHERE id = $2 RETURNING *', 
                [descripcion, id]
            );
            
            res.status(200).json({
                success: 'Modelo de neumático actualizado exitosamente',
                modeloActualizado: modeloActualizado.rows[0],
            });
        } catch (error) {
            res.status(500).json({
                error: "Ha ocurrido un error al intentar actualizar el modelo de neumático",
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