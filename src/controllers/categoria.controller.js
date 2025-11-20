const { withConnection } = require('../../database/dbHelper'); // ✅ AGREGA ESTA LÍNEA

const getList = async (req, res) => {
    await withConnection(async (client) => {
        try {
            const categorias = await client.query('SELECT * FROM public."categoria" ORDER BY descripcion DESC');
            res.status(200).json(categorias.rows);
        } catch (error) {
            res.status(500).json({
                error: "Ha ocurrido un error al intentar obtener las categorías",
                message: error.message,
            });
        }
    });
}

const getListActive = async (req, res) => {
    await withConnection(async (client) => {
        try {
            const categorias = await client.query('SELECT * FROM public."categoria" WHERE activa = true ORDER BY descripcion DESC');
            res.status(200).json(categorias.rows);
        } catch (error) {
            res.status(500).json({
                error: "Ha ocurrido un error al intentar obtener las categorías activas",
                message: error.message,
            });
        }
    });
}

const getById = async (req, res) => {
    await withConnection(async (client) => {
        try {
            const id = req.params.id;
            const categoria = await client.query('SELECT * FROM public."categoria" WHERE id = $1', [id]);
            if (categoria.rows.length === 0) {
                res.status(404).json({ error: 'Categoría no encontrada' });
                return;
            }
            res.status(200).json(categoria.rows[0]);
        } catch (error) {
            res.status(500).json({
                error: "Ha ocurrido un error al intentar obtener la categoría",
                message: error.message,
            });
        }
    });
}

const insert = async (req, res) => {
    await withConnection(async (client) => {
        try {
            const { descripcion } = req.body;
            const nuevaCategoria = await client.query(
                'INSERT INTO public."categoria" (descripcion) VALUES ($1) RETURNING id, descripcion, activa', 
                [descripcion]
            );
            res.status(201).json({
                success: 'Categoría creada exitosamente',
                nuevaCategoria: nuevaCategoria.rows[0],
            });
        } catch (error) {
            res.status(500).json({
                error: "Ha ocurrido un error al intentar crear la categoría",
                message: error.message,
            });
        }
    });
}

const deleteById = async (req, res) => {
    await withConnection(async (client) => {
        try {
            const id = req.params.id;
            const categoria = await client.query('SELECT * FROM public."categoria" WHERE id = $1', [id]);
            if (categoria.rows.length === 0) {
                res.status(404).json({ error: 'Categoría no encontrada' });
                return;
            }
            await client.query('DELETE FROM public."categoria" WHERE id = $1', [id]);
            res.status(200).json({
                success: 'Categoría eliminada exitosamente',
                categoriaEliminada: categoria.rows[0],
            });
        } catch (error) {
            res.status(500).json({
                error: "Ha ocurrido un error al intentar eliminar la categoría",
                message: error.message,
            });
        }
    });
}

const update = async (req, res) => {
    await withConnection(async (client) => {
        try {
            const id = req.params.id;
            const { descripcion, activa } = req.body;
            
            const categoria = await client.query('SELECT * FROM public."categoria" WHERE id = $1', [id]);
            if (categoria.rows.length === 0) {
                res.status(404).json({ error: 'Categoría no encontrada' });
                return;
            }
            
            const categoriaActualizada = await client.query(
                'UPDATE public."categoria" SET descripcion = $1, activa = $2 WHERE id = $3 RETURNING id, descripcion, activa', 
                [descripcion, activa, id]
            );
            
            res.status(200).json({
                success: 'Categoría actualizada exitosamente',
                categoriaActualizada: categoriaActualizada.rows[0],
            });
        } catch (error) {
            res.status(500).json({
                error: "Ha ocurrido un error al intentar actualizar la categoría",
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