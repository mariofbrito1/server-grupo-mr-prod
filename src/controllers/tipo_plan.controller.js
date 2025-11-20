const { withConnection } = require('../dbHelper'); 

const getList = async (req, res) => {
    await withConnection(async (client) => {
        try {
            const tipos = await client.query('SELECT * FROM public."tipo_plan" ORDER BY descripcion');
            res.status(200).json(tipos.rows);
        } catch (error) {
            res.status(500).json({
                error: "Ha ocurrido un error al intentar obtener los tipos de plan",
                message: error.message,
            });
        }
    });
}

const getById = async (req, res) => {
    await withConnection(async (client) => {
        try {
            const id = req.params.id;
            const tipo = await client.query('SELECT * FROM public."tipo_plan" WHERE id = $1', [id]);
            if (tipo.rows.length === 0) {
                res.status(404).json({ error: 'Tipo de plan no encontrado' });
                return;
            }
            res.status(200).json(tipo.rows[0]);
        } catch (error) {
            res.status(500).json({
                error: "Ha ocurrido un error al intentar obtener el tipo de plan",
                message: error.message,
            });
        }
    });
}

const insert = async (req, res) => {
    await withConnection(async (client) => {
        try {
            const { descripcion } = req.body;
            const nuevoTipo = await client.query(
                'INSERT INTO public."tipo_plan" (descripcion) VALUES ($1) RETURNING *', 
                [descripcion]
            );
            res.status(201).json({
                success: 'Tipo de plan creado exitosamente',
                nuevoTipo: nuevoTipo.rows[0],
            });
        } catch (error) {
            res.status(500).json({
                error: "Ha ocurrido un error al intentar crear el tipo de plan",
                message: error.message,
            });
        }
    });
}

const deleteById = async (req, res) => {
    await withConnection(async (client) => {
        try {
            const id = req.params.id;
            const tipo = await client.query('SELECT * FROM public."tipo_plan" WHERE id = $1', [id]);
            if (tipo.rows.length === 0) {
                res.status(404).json({ error: 'Tipo de plan no encontrado' });
                return;
            }
            await client.query('DELETE FROM public."tipo_plan" WHERE id = $1', [id]);
            res.status(200).json({
                success: 'Tipo de plan eliminado exitosamente',
                tipoEliminado: tipo.rows[0],
            });
        } catch (error) {
            res.status(500).json({
                error: "Ha ocurrido un error al intentar eliminar el tipo de plan",
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
            
            const tipo = await client.query('SELECT * FROM public."tipo_plan" WHERE id = $1', [id]);
            if (tipo.rows.length === 0) {
                res.status(404).json({ error: 'Tipo de plan no encontrado' });
                return;
            }
            
            const tipoActualizado = await client.query(
                'UPDATE public."tipo_plan" SET descripcion = $1 WHERE id = $2 RETURNING *', 
                [descripcion, id]
            );
            
            res.status(200).json({
                success: 'Tipo de plan actualizado exitosamente',
                tipoActualizado: tipoActualizado.rows[0],
            });
        } catch (error) {
            res.status(500).json({
                error: "Ha ocurrido un error al intentar actualizar el tipo de plan",
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
