const { withConnection } = require('../dbHelper'); 

const getList = async (req, res) => {
    await withConnection(async (client) => {
        try {
            const unidades = await client.query(`
                SELECT uv.*,
                       ev.descripcion as estado_vehiculo,
                       tc.descripcion as tipo_combustible,
                       tu.descripcion as tipo_unidad,
                       tcar.descripcion as tipo_carroceria,
                       c.descripcion as centro,
                       p.descripcion as proveedor,
                       pol.descripcion as poliza,
                       car.descripcion as carnet,
                       r.descripcion as rto,
                       g.descripcion as gps,
                       cam.descripcion as camara,
                       eb.descripcion as expendedora_boletos
                FROM public."unidad_vehiculo" uv
                LEFT JOIN public."estado_vehiculo" ev ON uv.id_estado_vehiculo = ev.id
                LEFT JOIN public."tipo_combustible" tc ON uv.id_tipo_conbustible = tc.id
                LEFT JOIN public."tipo_unidad" tu ON uv.id_tipo_unidad = tu.id
                LEFT JOIN public."tipo_carroceria" tcar ON uv.id_tipo_carroceria = tcar.id
                LEFT JOIN public."centro" c ON uv.id_centro = c.id
                LEFT JOIN public."proveedor" p ON uv.id_proveedor = p.id
                LEFT JOIN public."poliza" pol ON uv.id_poliza = pol.id
                LEFT JOIN public."carnet" car ON uv.id_carnet = car.id
                LEFT JOIN public."rto" r ON uv.id_rto = r.id
                LEFT JOIN public."gps" g ON uv.id_gps = g.id
                LEFT JOIN public."camara" cam ON uv.id_camara = cam.id
                LEFT JOIN public."expendedora_boletos" eb ON uv.id_expendedora_boletos = eb.id
                ORDER BY uv.nombre
            `);
            res.status(200).json(unidades.rows);
        } catch (error) {
            res.status(500).json({
                error: "Ha ocurrido un error al intentar obtener las unidades de vehículo",
                message: error.message,
            });
        }
    });
}

const getById = async (req, res) => {
    await withConnection(async (client) => {
        try {
            const id = req.params.id;
            const unidad = await client.query(`
                SELECT uv.*,
                       ev.descripcion as estado_vehiculo,
                       tc.descripcion as tipo_combustible,
                       tu.descripcion as tipo_unidad,
                       tcar.descripcion as tipo_carroceria,
                       c.descripcion as centro,
                       p.descripcion as proveedor,
                       pol.descripcion as poliza,
                       car.descripcion as carnet,
                       r.descripcion as rto,
                       g.descripcion as gps,
                       cam.descripcion as camara,
                       eb.descripcion as expendedora_boletos
                FROM public."unidad_vehiculo" uv
                LEFT JOIN public."estado_vehiculo" ev ON uv.id_estado_vehiculo = ev.id
                LEFT JOIN public."tipo_combustible" tc ON uv.id_tipo_conbustible = tc.id
                LEFT JOIN public."tipo_unidad" tu ON uv.id_tipo_unidad = tu.id
                LEFT JOIN public."tipo_carroceria" tcar ON uv.id_tipo_carroceria = tcar.id
                LEFT JOIN public."centro" c ON uv.id_centro = c.id
                LEFT JOIN public."proveedor" p ON uv.id_proveedor = p.id
                LEFT JOIN public."poliza" pol ON uv.id_poliza = pol.id
                LEFT JOIN public."carnet" car ON uv.id_carnet = car.id
                LEFT JOIN public."rto" r ON uv.id_rto = r.id
                LEFT JOIN public."gps" g ON uv.id_gps = g.id
                LEFT JOIN public."camara" cam ON uv.id_camara = cam.id
                LEFT JOIN public."expendedora_boletos" eb ON uv.id_expendedora_boletos = eb.id
                WHERE uv.id = $1
            `, [id]);
            
            if (unidad.rows.length === 0) {
                res.status(404).json({ error: 'Unidad de vehículo no encontrada' });
                return;
            }
            res.status(200).json(unidad.rows[0]);
        } catch (error) {
            res.status(500).json({
                error: "Ha ocurrido un error al intentar obtener la unidad de vehículo",
                message: error.message,
            });
        }
    });
}

const insert = async (req, res) => {
    await withConnection(async (client) => {
        try {
            const { 
                id, nombre, patente, id_marca, id_tipo_conbustible, id_estado_vehiculo, 
                ubicacion, odometro_inicial, odometro_final, id_poliza, id_carnet, 
                vencimiento_matafuego, marca_matafuego, serie_carroceria, img_tarjeta_verde, 
                id_rto, importe, id_proveedor, id_gps, id_camara, id_expendedora_boletos, 
                tiene_gps, tiene_camara, tiene_expendedora_boletos, asientos, factura_numero, 
                id_tipo_unidad, id_tipo_carroceria, id_centro 
            } = req.body;
            
            const nuevaUnidad = await client.query(
                `INSERT INTO public."unidad_vehiculo" 
                (id, nombre, patente, id_marca, id_tipo_conbustible, id_estado_vehiculo, 
                 ubicacion, odometro_inicial, odometro_final, id_poliza, id_carnet, 
                 vencimiento_matafuego, marca_matafuego, serie_carroceria, img_tarjeta_verde, 
                 id_rto, importe, id_proveedor, id_gps, id_camara, id_expendedora_boletos, 
                 tiene_gps, tiene_camara, tiene_expendedora_boletos, asientos, factura_numero, 
                 id_tipo_unidad, id_tipo_carroceria, id_centro) 
                VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, $24, $25, $26, $27, $28, $29) 
                RETURNING *`, 
                [id, nombre, patente, id_marca, id_tipo_conbustible, id_estado_vehiculo, 
                 ubicacion, odometro_inicial, odometro_final, id_poliza, id_carnet, 
                 vencimiento_matafuego, marca_matafuego, serie_carroceria, img_tarjeta_verde, 
                 id_rto, importe, id_proveedor, id_gps, id_camara, id_expendedora_boletos, 
                 tiene_gps, tiene_camara, tiene_expendedora_boletos, asientos, factura_numero, 
                 id_tipo_unidad, id_tipo_carroceria, id_centro]
            );
            
            res.status(201).json({
                success: 'Unidad de vehículo creada exitosamente',
                nuevaUnidad: nuevaUnidad.rows[0],
            });
        } catch (error) {
            res.status(500).json({
                error: "Ha ocurrido un error al intentar crear la unidad de vehículo",
                message: error.message,
            });
        }
    });
}

const deleteById = async (req, res) => {
    await withConnection(async (client) => {
        try {
            const id = req.params.id;
            const unidad = await client.query('SELECT * FROM public."unidad_vehiculo" WHERE id = $1', [id]);
            if (unidad.rows.length === 0) {
                res.status(404).json({ error: 'Unidad de vehículo no encontrada' });
                return;
            }
            await client.query('DELETE FROM public."unidad_vehiculo" WHERE id = $1', [id]);
            res.status(200).json({
                success: 'Unidad de vehículo eliminada exitosamente',
                unidadEliminada: unidad.rows[0],
            });
        } catch (error) {
            res.status(500).json({
                error: "Ha ocurrido un error al intentar eliminar la unidad de vehículo",
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
                nombre, patente, id_marca, id_tipo_conbustible, id_estado_vehiculo, 
                ubicacion, odometro_inicial, odometro_final, id_poliza, id_carnet, 
                vencimiento_matafuego, marca_matafuego, serie_carroceria, img_tarjeta_verde, 
                id_rto, importe, id_proveedor, id_gps, id_camara, id_expendedora_boletos, 
                tiene_gps, tiene_camara, tiene_expendedora_boletos, asientos, factura_numero, 
                id_tipo_unidad, id_tipo_carroceria, id_centro 
            } = req.body;
            
            const unidad = await client.query('SELECT * FROM public."unidad_vehiculo" WHERE id = $1', [id]);
            if (unidad.rows.length === 0) {
                res.status(404).json({ error: 'Unidad de vehículo no encontrada' });
                return;
            }
            
            const unidadActualizada = await client.query(
                `UPDATE public."unidad_vehiculo" 
                SET nombre = $1, patente = $2, id_marca = $3, id_tipo_conbustible = $4, 
                    id_estado_vehiculo = $5, ubicacion = $6, odometro_inicial = $7, 
                    odometro_final = $8, id_poliza = $9, id_carnet = $10, 
                    vencimiento_matafuego = $11, marca_matafuego = $12, serie_carroceria = $13, 
                    img_tarjeta_verde = $14, id_rto = $15, importe = $16, id_proveedor = $17, 
                    id_gps = $18, id_camara = $19, id_expendedora_boletos = $20, 
                    tiene_gps = $21, tiene_camara = $22, tiene_expendedora_boletos = $23, 
                    asientos = $24, factura_numero = $25, id_tipo_unidad = $26, 
                    id_tipo_carroceria = $27, id_centro = $28
                WHERE id = $29 
                RETURNING *`, 
                [nombre, patente, id_marca, id_tipo_conbustible, id_estado_vehiculo, 
                 ubicacion, odometro_inicial, odometro_final, id_poliza, id_carnet, 
                 vencimiento_matafuego, marca_matafuego, serie_carroceria, img_tarjeta_verde, 
                 id_rto, importe, id_proveedor, id_gps, id_camara, id_expendedora_boletos, 
                 tiene_gps, tiene_camara, tiene_expendedora_boletos, asientos, factura_numero, 
                 id_tipo_unidad, id_tipo_carroceria, id_centro, id]
            );
            
            res.status(200).json({
                success: 'Unidad de vehículo actualizada exitosamente',
                unidadActualizada: unidadActualizada.rows[0],
            });
        } catch (error) {
            res.status(500).json({
                error: "Ha ocurrido un error al intentar actualizar la unidad de vehículo",
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
