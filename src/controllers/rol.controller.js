const { withConnection } = require('../../database/dbHelper'); // ✅ SOLO esto

const getList = async (req, res) => {
    console.log("roles")
    await withConnection(async (client) => {
        try {
            //console.log(req);
            const response = await client.query('SELECT r.*, r.nombre as descripcion FROM public."roles" as r');
            console.log("roles res", response.rows); 
            res.status(200).json(response.rows);
        } catch (error) {
             console.log("roles error", error); 
            res.status(500).json({
                error: "Ha ocurrido un error al intentar obtener los roles",
                message: error.message,
            });
        }
    });
}

const getById = async (req, res) => {
    await withConnection(async (client) => {
        try {
            const id = req.params.id;
            const response = await client.query('SELECT * FROM public."roles" WHERE id = $1', [id]);
            res.status(200).json(response.rows);
        } catch (error) {
            res.status(500).json({
                error: "Ha ocurrido un error al intentar obtener el rol",
                message: error.message,
            });
        }
    });
}

const getAllSeccionesByIdUsuario = async (req, res) => {
    await withConnection(async (client) => {
        try {
            const id = req.params.id;
            const response = await client.query('SELECT id_seccion, alta ,baja, modificacion FROM public."usuario_rol" usro LEFT JOIN rol_seccion rose on (usro.id_rol = rose.id_rol) WHERE id_usuario = $1', [id]);
            res.status(200).json(response.rows);
        } catch (error) {
            res.status(500).json({
                error: "Ha ocurrido un error al intentar obtener las secciones del usuario",
                message: error.message,
            });
        }
    });
}

const insert = async (req, res) => {
    await withConnection(async (client) => {
        try {
            const { nombre } = req.body;
            const response = await client.query('INSERT INTO public."roles" ( nombre ) VALUES ($1) RETURNING id', [nombre]);
            //console.log('resp: ', response.rows[0]);
            res.status(200).json({
                message: 'added successful cap',
                body: response.rows[0]
            });
        } catch (error) {
            res.status(500).json({
                error: "Ha ocurrido un error al intentar crear el rol",
                message: error.message,
            });
        }
    });
}

const deleteById = async (req, res) => {
    await withConnection(async (client) => {
        try {
            console.log('deleteById');
            const id = req.params.id;
            const response = await client.query('DELETE FROM public."roles" WHERE id = $1', [id]);
            res.status(200).json(`Rol eliminado ${id}`);
        } catch (error) {
            res.status(500).json({
                error: "Ha ocurrido un error al intentar eliminar el rol",
                message: error.message,
            });
        }
    });
}

const update = async (req, res) => {
    await withConnection(async (client) => {
        try {
            const id = req.params.id;
            const { nombre } = req.body;
            const response = await client.query('UPDATE public."roles" SET nombre= $1 WHERE id = $2', [nombre, id]);
            res.json('update successful');
        } catch (error) {
            res.status(500).json({
                error: "Ha ocurrido un error al intentar actualizar el rol",
                message: error.message,
            });
        }
    });
}

module.exports = {
    getList,
    getById,
    getAllSeccionesByIdUsuario,
    insert,
    update,
    deleteById,
}