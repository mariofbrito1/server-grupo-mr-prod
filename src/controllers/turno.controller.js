const { withConnection } = require('../../database/dbHelper'); // ✅ SOLO esto

const getList = async (req, res) => {
    console.log("get turnos");
    await withConnection(async (client) => {
        try {
            const turnos = await client.query('SELECT * FROM public."turno" ');
             console.log("turnos", turnos.rows);
            res.status(200).json(turnos.rows);
        } catch (error) {
             console.log("turnos error", error);
            res.status(500).json({
                error: "Ha ocurrido un error al intentar obtener los turnos",
                message: error.message,
            });
        }
    });
}

const getById = async (req, res) => {
    await withConnection(async (client) => {
        try {
            const id = req.params.id;
            const turno = await client.query('SELECT * FROM public."turno" WHERE id = $1', [id]);
            if (turno.rows.length === 0) {
                res.status(404).json({ error: 'Turno no encontrado' });
                return;
            }
            res.status(200).json(turno.rows[0]);
        } catch (error) {
            res.status(500).json({
                error: "Ha ocurrido un error al intentar obtener el turno",
                message: error.message,
            });
        }
    });
}

const insert = async (req, res) => {
    await withConnection(async (client) => {
        try {
            const { descripcion, fecha_nicial, fecha_fin } = req.body;
            const nuevoTurno = await client.query(
                'INSERT INTO public."turno" (descripcion, fecha_nicial, fecha_fin) VALUES ($1, $2, $3) RETURNING *', 
                [descripcion, fecha_nicial, fecha_fin]
            );
            res.status(201).json({
                success: 'Turno creado exitosamente',
                nuevoTurno: nuevoTurno.rows[0],
            });
        } catch (error) {
            res.status(500).json({
                error: "Ha ocurrido un error al intentar crear el turno",
                message: error.message,
            });
        }
    });
}

const deleteById = async (req, res) => {
    await withConnection(async (client) => {
        try {
            const id = req.params.id;
            const turno = await client.query('SELECT * FROM public."turno" WHERE id = $1', [id]);
            if (turno.rows.length === 0) {
                res.status(404).json({ error: 'Turno no encontrado' });
                return;
            }
            await client.query('DELETE FROM public."turno" WHERE id = $1', [id]);
            res.status(200).json({
                success: 'Turno eliminado exitosamente',
                turnoEliminado: turno.rows[0],
            });
        } catch (error) {
            res.status(500).json({
                error: "Ha ocurrido un error al intentar eliminar el turno",
                message: error.message,
            });
        }
    });
}

const update = async (req, res) => {
    await withConnection(async (client) => {
        try {
            const id = req.params.id;
            const { descripcion, fecha_nicial, fecha_fin } = req.body;
            
            const turno = await client.query('SELECT * FROM public."turno" WHERE id = $1', [id]);
            if (turno.rows.length === 0) {
                res.status(404).json({ error: 'Turno no encontrado' });
                return;
            }
            
            const turnoActualizado = await client.query(
                'UPDATE public."turno" SET descripcion = $1, fecha_nicial = $2, fecha_fin = $3 WHERE id = $4 RETURNING *', 
                [descripcion, fecha_nicial, fecha_fin, id]
            );
            
            res.status(200).json({
                success: 'Turno actualizado exitosamente',
                turnoActualizado: turnoActualizado.rows[0],
            });
        } catch (error) {
            res.status(500).json({
                error: "Ha ocurrido un error al intentar actualizar el turno",
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