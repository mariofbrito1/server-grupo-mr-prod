const { withConnection } = require('../dbHelper'); 

const getList = async (req, res) => {
    console.log("tipos carnet")
    await withConnection(async (client) => {
        try {
            const tipos = await client.query('SELECT * FROM public."tipo_carnet" ');
            res.status(200).json(tipos.rows);
              console.log("tipos carnet", tipos.rows);
        } catch (error) {
            console.log("tipos carneterror", error);
            res.status(500).json({
                   
                error: "Ha ocurrido un error al intentar obtener los tipos de carnet",
                message: error.message,
            });
        }
    });
}

const getById = async (req, res) => {
    await withConnection(async (client) => {
        try {
            const id = req.params.id;
            const tipo = await client.query('SELECT * FROM public."tipo_carnet" WHERE id = $1', [id]);
            if (tipo.rows.length === 0) {
                res.status(404).json({ error: 'Tipo de carnet no encontrado' });
                return;
            }
            res.status(200).json(tipo.rows[0]);
        } catch (error) {
            res.status(500).json({
                error: "Ha ocurrido un error al intentar obtener el tipo de carnet",
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
                'INSERT INTO public."tipo_carnet" (descripcion) VALUES ($1) RETURNING *', 
                [descripcion]
            );
            res.status(201).json({
                success: 'Tipo de carnet creado exitosamente',
                nuevoTipo: nuevoTipo.rows[0],
            });
        } catch (error) {
            res.status(500).json({
                error: "Ha ocurrido un error al intentar crear el tipo de carnet",
                message: error.message,
            });
        }
    });
}

const deleteById = async (req, res) => {
    await withConnection(async (client) => {
        try {
            const id = req.params.id;
            const tipo = await client.query('SELECT * FROM public."tipo_carnet" WHERE id = $1', [id]);
            if (tipo.rows.length === 0) {
                res.status(404).json({ error: 'Tipo de carnet no encontrado' });
                return;
            }
            await client.query('DELETE FROM public."tipo_carnet" WHERE id = $1', [id]);
            res.status(200).json({
                success: 'Tipo de carnet eliminado exitosamente',
                tipoEliminado: tipo.rows[0],
            });
        } catch (error) {
            res.status(500).json({
                error: "Ha ocurrido un error al intentar eliminar el tipo de carnet",
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
            
            const tipo = await client.query('SELECT * FROM public."tipo_carnet" WHERE id = $1', [id]);
            if (tipo.rows.length === 0) {
                res.status(404).json({ error: 'Tipo de carnet no encontrado' });
                return;
            }
            
            const tipoActualizado = await client.query(
                'UPDATE public."tipo_carnet" SET descripcion = $1 WHERE id = $2 RETURNING *', 
                [descripcion, id]
            );
            
            res.status(200).json({
                success: 'Tipo de carnet actualizado exitosamente',
                tipoActualizado: tipoActualizado.rows[0],
            });
        } catch (error) {
            res.status(500).json({
                error: "Ha ocurrido un error al intentar actualizar el tipo de carnet",
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
