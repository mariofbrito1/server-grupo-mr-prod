const { Pool } = require('pg');
const config = require('../config');

const pool = new Pool(config);

const getList = async (req, res) => {
    try {
        const tareas = await pool.query(`
            SELECT t.*, 
                   s.descripcion as sucursal,
                   sec.descripcion as sector
            FROM public."tarea" t
            LEFT JOIN public."sucursal" s ON t.id_sucursal = s.id
            INNER JOIN public."sector" sec ON t.id_sector = sec.id
            ORDER BY t.fecha_creado DESC
        `);
        res.status(200).json(tareas.rows);
    } catch (error) {
        res.status(500).json({
            error: "Ha ocurrido un error al intentar obtener las tareas",
            message: error.message,
        });
    }
}

const getById = async (req, res) => {
    try {
        const id = req.params.id;
        const tarea = await pool.query(`
            SELECT t.*, 
                   s.descripcion as sucursal,
                   sec.descripcion as sector
            FROM public."tarea" t
            LEFT JOIN public."sucursal" s ON t.id_sucursal = s.id
            INNER JOIN public."sector" sec ON t.id_sector = sec.id
            WHERE t.id = $1
        `, [id]);
        
        if (tarea.rows.length === 0) {
            res.status(404).json({ error: 'Tarea no encontrada' });
            return;
        }
        res.status(200).json(tarea.rows[0]);
    } catch (error) {
        res.status(500).json({
            error: "Ha ocurrido un error al intentar obtener la tarea",
            message: error.message,
        });
    }
}

const insert = async (req, res) => {
    try {
        const { 
            descripcion, 
            fecha_inicio, 
            fecha_finalizacion, 
            horas_estmadas_relizacion, 
            id_sucursal, 
            id_sector 
        } = req.body;
        
        const nuevaTarea = await pool.query(
            `INSERT INTO public."tarea" 
            (descripcion, fecha_inicio, fecha_finalizacion, horas_estmadas_relizacion, id_sucursal, id_sector) 
            VALUES ($1, $2, $3, $4, $5, $6) 
            RETURNING *`, 
            [descripcion, fecha_inicio, fecha_finalizacion, horas_estmadas_relizacion, id_sucursal, id_sector]
        );
        
        res.status(201).json({
            success: 'Tarea creada exitosamente',
            nuevaTarea: nuevaTarea.rows[0],
        });
    } catch (error) {
        res.status(500).json({
            error: "Ha ocurrido un error al intentar crear la tarea",
            message: error.message,
        });
    }
}

const deleteById = async (req, res) => {
    try {
        const id = req.params.id;
        const tarea = await pool.query('SELECT * FROM public."tarea" WHERE id = $1', [id]);
        if (tarea.rows.length === 0) {
            res.status(404).json({ error: 'Tarea no encontrada' });
            return;
        }
        await pool.query('DELETE FROM public."tarea" WHERE id = $1', [id]);
        res.status(200).json({
            success: 'Tarea eliminada exitosamente',
            tareaEliminada: tarea.rows[0],
        });
    } catch (error) {
        res.status(500).json({
            error: "Ha ocurrido un error al intentar eliminar la tarea",
            message: error.message,
        });
    }
}

const update = async (req, res) => {
    try {
        const id = req.params.id;
        const { 
            descripcion, 
            fecha_inicio, 
            fecha_finalizacion, 
            horas_estmadas_relizacion, 
            id_sucursal, 
            id_sector 
        } = req.body;
        
        const tarea = await pool.query('SELECT * FROM public."tarea" WHERE id = $1', [id]);
        if (tarea.rows.length === 0) {
            res.status(404).json({ error: 'Tarea no encontrada' });
            return;
        }
        
        const tareaActualizada = await pool.query(
            `UPDATE public."tarea" 
            SET descripcion = $1, fecha_inicio = $2, fecha_finalizacion = $3, 
                horas_estmadas_relizacion = $4, id_sucursal = $5, id_sector = $6
            WHERE id = $7 
            RETURNING *`, 
            [descripcion, fecha_inicio, fecha_finalizacion, horas_estmadas_relizacion, id_sucursal, id_sector, id]
        );
        
        res.status(200).json({
            success: 'Tarea actualizada exitosamente',
            tareaActualizada: tareaActualizada.rows[0],
        });
    } catch (error) {
        res.status(500).json({
            error: "Ha ocurrido un error al intentar actualizar la tarea",
            message: error.message,
        });
    }
}

module.exports = {
    getList,
    getById,
    insert,
    update,
    deleteById
}