const { withConnection } = require('../dbHelper');  

const getList = async (req, res) => {
    await withConnection(async (client) => {
        try {
            const categoriasUsuarios = await client.query(`
                SELECT cu.*, 
                       c.descripcion as categoria,
                       u.nombre as usuario
                FROM public."categoria_usuario" cu
                INNER JOIN public."categoria" c ON cu.id_categoria = c.id
                INNER JOIN public."usuario" u ON cu.id_usuario = u.id
                ORDER BY c.descripcion, u.nombre
            `);
            res.status(200).json(categoriasUsuarios.rows);
        } catch (error) {
            res.status(500).json({
                error: "Ha ocurrido un error al intentar obtener las categorías de usuarios",
                message: error.message,
            });
        }
    });
}

const getByUsuario = async (req, res) => {
    await withConnection(async (client) => {
        try {
            const id_usuario = req.params.id_usuario;
            const categorias = await client.query(`
                SELECT cu.*, c.descripcion as categoria
                FROM public."categoria_usuario" cu
                INNER JOIN public."categoria" c ON cu.id_categoria = c.id
                WHERE cu.id_usuario = $1
                ORDER BY c.descripcion
            `, [id_usuario]);
            
            res.status(200).json(categorias.rows);
        } catch (error) {
            res.status(500).json({
                error: "Ha ocurrido un error al intentar obtener las categorías del usuario",
                message: error.message,
            });
        }
    });
}

const getByCategoria = async (req, res) => {
    await withConnection(async (client) => {
        try {
            const id_categoria = req.params.id_categoria;
            const usuarios = await client.query(`
                SELECT cu.*, u.nombre as usuario
                FROM public."categoria_usuario" cu
                INNER JOIN public."usuario" u ON cu.id_usuario = u.id
                WHERE cu.id_categoria = $1
                ORDER BY u.nombre
            `, [id_categoria]);
            
            res.status(200).json(usuarios.rows);
        } catch (error) {
            res.status(500).json({
                error: "Ha ocurrido un error al intentar obtener los usuarios de la categoría",
                message: error.message,
            });
        }
    });
}

const insert = async (req, res) => {
    await withConnection(async (client) => {
        try {
            const { id_categoria, id_usuario } = req.body;
            
            // Verificar si ya existe la relación
            const existe = await client.query(
                'SELECT * FROM public."categoria_usuario" WHERE id_categoria = $1 AND id_usuario = $2',
                [id_categoria, id_usuario]
            );
            
            if (existe.rows.length > 0) {
                res.status(400).json({ error: 'Esta categoría ya está asignada al usuario' });
                return;
            }
            
            const nuevaRelacion = await client.query(
                'INSERT INTO public."categoria_usuario" (id_categoria, id_usuario) VALUES ($1, $2) RETURNING *', 
                [id_categoria, id_usuario]
            );
            
            res.status(201).json({
                success: 'Categoría asignada al usuario exitosamente',
                nuevaRelacion: nuevaRelacion.rows[0],
            });
        } catch (error) {
            res.status(500).json({
                error: "Ha ocurrido un error al intentar asignar la categoría al usuario",
                message: error.message,
            });
        }
    });
}

const deleteById = async (req, res) => {
    await withConnection(async (client) => {
        try {
            const id = req.params.id;
            // En este caso, como es tabla intermedia sin ID único, podrías necesitar un ID específico
            // Esta función sería útil si agregas un ID serial a la tabla
            const relacion = await client.query('SELECT * FROM public."categoria_usuario" WHERE id = $1', [id]);
            if (relacion.rows.length === 0) {
                res.status(404).json({ error: 'Relación no encontrada' });
                return;
            }
            await client.query('DELETE FROM public."categoria_usuario" WHERE id = $1', [id]);
            res.status(200).json({
                success: 'Relación eliminada exitosamente',
                relacionEliminada: relacion.rows[0],
            });
        } catch (error) {
            res.status(500).json({
                error: "Ha ocurrido un error al intentar eliminar la relación",
                message: error.message,
            });
        }
    });
}

const deleteByUsuarioAndCategoria = async (req, res) => {
    await withConnection(async (client) => {
        try {
            const { id_categoria, id_usuario } = req.params;
            
            const relacion = await client.query(
                'SELECT * FROM public."categoria_usuario" WHERE id_categoria = $1 AND id_usuario = $2',
                [id_categoria, id_usuario]
            );
            
            if (relacion.rows.length === 0) {
                res.status(404).json({ error: 'Relación no encontrada' });
                return;
            }
            
            await client.query(
                'DELETE FROM public."categoria_usuario" WHERE id_categoria = $1 AND id_usuario = $2',
                [id_categoria, id_usuario]
            );
            
            res.status(200).json({
                success: 'Categoría removida del usuario exitosamente',
                relacionEliminada: relacion.rows[0],
            });
        } catch (error) {
            res.status(500).json({
                error: "Ha ocurrido un error al intentar remover la categoría del usuario",
                message: error.message,
            });
        }
    });
}

module.exports = {
    getList,
    getByUsuario,
    getByCategoria,
    insert,
    deleteById,
    deleteByUsuarioAndCategoria
}
