const { body, validationResult } = require('express-validator');

/**
 * Documentación para express-validator: https://express-validator.github.io/docs
 */

const handleInputErrors = (req, res, next) => {
    const errors = validationResult(req);
    if(!errors.isEmpty()) {
        res.status(400).json({
            error: "Uno o más campos ingresados no son válidos",
            message: errors.array(),
        });
        return;
    }
    next();
};

// =============================================
// VALIDADORES EXISTENTES
// =============================================

const centrosValidator = [
    body("nombre")
        .exists().withMessage("El campo 'nombre' no puede ser nulo")
        .trim()
        .isString().isLength({ min: 3, max: 50 }).withMessage("El nombre del centro debe tener entre 3 y 50 caracteres"),
];

 

const usuariosValidator_datosPersonales = [
    body("nombre")
        .exists().withMessage("El campo 'nombre' no puede ser nulo")
        .trim()
        .isString().isLength({ min: 2, max: 50}).withMessage("El nombre del usuario debe tener entre 2 y 50 caracteres"),
    body("apellido")
        .exists().withMessage("El campo 'apellido' no puede ser nulo")
        .trim()
        .isString().isLength({ min: 2, max: 50}).withMessage("El apellido del usuario debe tener entre 2 y 50 caracteres"),
    body("legajo")
        .exists().withMessage("El campo 'legajo' no puede ser nulo")
        .trim()
        .isString().isLength({ min: 1, max: 10}).withMessage("El legajo del usuario debe tener entre 1 y 10 caracteres"),
    body("id_rol")
        .exists().withMessage("El campo 'id_rol' no puede ser nulo")
        .isInt({ min: 1 }).withMessage("El id_rol debe ser un entero mayor o igual a 1"),
    body("id_centro")
        .exists().withMessage("El campo 'id_centro' no puede ser nulo")
        .isInt({ min: 1 }).withMessage("El id_centro debe ser un entero mayor o igual a 1"),
];

const usuariosValidator_datosAcceso = [
    body("password")
        .exists().withMessage("El campo 'password' no puede ser nulo")
        .trim()
        .isString().isLength({ min: 4, max: 30}).withMessage("El password del usuario debe tener entre 4 y 30 caracteres"),
];

const categoriaUsuarioValidator = [
    body('id_categoria').isInt({ min: 1 }).withMessage('El ID de la categoría debe ser un número válido'),
    body('id_usuario').isInt({ min: 1 }).withMessage('El ID del usuario debe ser un número válido')
];

const neumaticoValidator = [
    body('descripcion').notEmpty().withMessage('La descripción es requerida'),
    body('km_inicial').isNumeric().withMessage('El km inicial debe ser un número'),
    body('km_actual').isNumeric().withMessage('El km actual debe ser un número'),
    body('id_estado_neumatico').isInt({ min: 1 }).withMessage('El ID del estado del neumático debe ser un número válido'),
    body('dimensiones').notEmpty().withMessage('Las dimensiones son requeridas'),
    body('id_modelo_neumatico').isInt({ min: 1 }).withMessage('El ID del modelo de neumático debe ser un número válido'),
    body('marca_numerica').isNumeric().withMessage('La marca numérica debe ser un número'),
    body('id_proveedor').optional().isInt({ min: 1 }).withMessage('El ID del proveedor debe ser un número válido')
];

const gpsValidator = [
    body('descripcion').notEmpty().withMessage('La descripción es requerida'),
    body('id_proveedor').isInt({ min: 1 }).withMessage('El ID del proveedor debe ser un número válido')
];

const modeloNeumaticoValidator = [
    body('descripcion').notEmpty().withMessage('La descripción es requerida')
];

const planValidator = [
    body('descripcion').notEmpty().withMessage('La descripción es requerida'),
    body('id_tipo_plan').isInt({ min: 1 }).withMessage('El ID del tipo de plan debe ser un número válido')
];

const polizaValidator = [
    body('descripcion').notEmpty().withMessage('La descripción es requerida'),
    body('id_proveedor').isInt({ min: 1 }).withMessage('El ID del proveedor debe ser un número válido'),
    body('fecha_vencimiento').isDate().withMessage('La fecha de vencimiento debe ser una fecha válida'),
    body('numero').isNumeric().withMessage('El número debe ser un valor numérico')
];

const proveedorValidator = [
    body('descripcion').notEmpty().withMessage('La descripción es requerida'),
    body('telefono').notEmpty().withMessage('El teléfono es requerido')
];

// =============================================
// NUEVOS VALIDADORES AGREGADOS
// =============================================

const camaraValidator = [
    body('descripcion').notEmpty().withMessage('La descripción es requerida'),
    body('id_proveedor').isInt({ min: 1 }).withMessage('El ID del proveedor debe ser un número válido')
];

const carnetValidator = [
    body('id_tipo_carnet').isInt({ min: 1 }).withMessage('El ID del tipo de carnet debe ser un número válido'),
    body('fecha_vencimiento').isDate().withMessage('La fecha de vencimiento debe ser una fecha válida'),
    body('descripcion').notEmpty().withMessage('La descripción es requerida')
];

const categoriaValidator = [
    body('descripcion').notEmpty().withMessage('La descripción es requerida')
];

const estadoNeumaticoValidator = [
    body('descripcion').notEmpty().withMessage('La descripción es requerida')
];

const estadoRepuestoValidator = [
    body('descripcion').notEmpty().withMessage('La descripción es requerida')
];

const estadoTanqueValidator = [
    body('descripcion').notEmpty().withMessage('La descripción es requerida')
];

const estadoVehiculoValidator = [
    body('descripcion').notEmpty().withMessage('La descripción es requerida')
];

const estadoMovimientoRepuestoValidator = [
    body('descripcion').notEmpty().withMessage('La descripción es requerida')
];

const expendedoraBoletosValidator = [
    body('descripcion').notEmpty().withMessage('La descripción es requerida'),
    body('id_proveedor').isInt({ min: 1 }).withMessage('El ID del proveedor debe ser un número válido')
];

const repuestoValidator = [
    body('descripcion').notEmpty().withMessage('La descripción es requerida'),
    body('id_sucursal').isInt({ min: 1 }).withMessage('El ID de la sucursal debe ser un número válido'),
    body('id_estado').isInt({ min: 1 }).withMessage('El ID del estado debe ser un número válido'),
    body('id_estado_movimiento').isInt({ min: 1 }).withMessage('El ID del estado de movimiento debe ser un número válido'),
    body('stock_critico').isNumeric().withMessage('El stock crítico debe ser un número'),
    body('stock').isNumeric().withMessage('El stock debe ser un número'),
    body('precio').isNumeric().withMessage('El precio debe ser un número'),
    body('codigo').notEmpty().withMessage('El código es requerido'),
    body('id_centro').isInt({ min: 1 }).withMessage('El ID del centro debe ser un número válido')
];

const rtoValidator = [
    body('fecha_vencimiento').isDate().withMessage('La fecha de vencimiento debe ser una fecha válida'),
    body('descripcion').notEmpty().withMessage('La descripción es requerida'),
    body('id_tipo_rto').isInt({ min: 1 }).withMessage('El ID del tipo de RTO debe ser un número válido')
];

const sectorValidator = [
    body('descripcion').notEmpty().withMessage('La descripción es requerida')
];

const sucursalValidator = [
    body('descripcion').notEmpty().withMessage('La descripción es requerida'),
    body('id_centro').isInt({ min: 1 }).withMessage('El ID del centro debe ser un número válido'),
    body('ubicacion').notEmpty().withMessage('La ubicación es requerida')
];

const tanqueValidator = [
    body('descripcion').notEmpty().withMessage('La descripción es requerida'),
    body('id_tipo_tanque').isInt({ min: 1 }).withMessage('El ID del tipo de tanque debe ser un número válido'),
    body('id_sucursal').isInt({ min: 1 }).withMessage('El ID de la sucursal debe ser un número válido'),
    body('cantidad').isNumeric().withMessage('La cantidad debe ser un número'),
    body('unidad').notEmpty().withMessage('La unidad es requerida'),
    body('id_estado').isInt({ min: 1 }).withMessage('El ID del estado debe ser un número válido')
];

const tareaPlanValidator = [
    body('id_tarea').isInt({ min: 1 }).withMessage('El ID de la tarea debe ser un número válido'),
    body('id_plan').isInt({ min: 1 }).withMessage('El ID del plan debe ser un número válido')
];

const tipoCarnetValidator = [
    body('descripcion').notEmpty().withMessage('La descripción es requerida')
];

const tipoCarroceriaValidator = [
    body('descripcion').notEmpty().withMessage('La descripción es requerida')
];

const tipoCombustibleValidator = [
    body('descripcion').notEmpty().withMessage('La descripción es requerida')
];

const tipoPlanValidator = [
    body('descripcion').notEmpty().withMessage('La descripción es requerida')
];

const tipoProveedorValidator = [
    body('tipo').notEmpty().withMessage('El tipo es requerido')
];

const tipoRtoValidator = [
    body('descipcion').notEmpty().withMessage('La descripción es requerida')
];

const tipoTanqueValidator = [
    body('descripcion').notEmpty().withMessage('La descripción es requerida')
];

const tareaValidator = [
    body('descripcion').notEmpty().withMessage('La descripción es requerida'),
    body('horas_estmadas_relizacion').isNumeric().withMessage('Las horas estimadas deben ser un número'),
    body('id_sector').isInt({ min: 1 }).withMessage('El ID del sector debe ser un número válido'),
    body('id_sucursal').optional().isInt({ min: 1 }).withMessage('El ID de la sucursal debe ser un número válido'),
    body('fecha_inicio').optional().isDate().withMessage('La fecha de inicio debe ser una fecha válida'),
    body('fecha_finalizacion').optional().isDate().withMessage('La fecha de finalización debe ser una fecha válida')
];

const tipoUnidadValidator = [
    body('descripcion').notEmpty().withMessage('La descripción es requerida')
];

const turnoValidator = [
    body('descripcion').notEmpty().withMessage('La descripción es requerida'),
    body('fecha_nicial').isDate().withMessage('La fecha inicial debe ser una fecha válida'),
    body('fecha_fin').isDate().withMessage('La fecha final debe ser una fecha válida')
];

const unidadVehiculoValidator = [
    body('id').isInt({ min: 1 }).withMessage('El ID debe ser un número válido'),
    body('nombre').notEmpty().withMessage('El nombre es requerido'),
    body('patente').notEmpty().withMessage('La patente es requerida'),
    body('id_marca').isInt({ min: 1 }).withMessage('El ID de la marca debe ser un número válido'),
    body('id_tipo_conbustible').isInt({ min: 1 }).withMessage('El ID del tipo de combustible debe ser un número válido'),
    body('id_estado_vehiculo').isInt({ min: 1 }).withMessage('El ID del estado del vehículo debe ser un número válido'),
    body('odometro_inicial').isNumeric().withMessage('El odómetro inicial debe ser un número'),
    body('odometro_final').isNumeric().withMessage('El odómetro final debe ser un número'),
    body('serie_carroceria').notEmpty().withMessage('La serie de carrocería es requerida'),
    body('importe').isNumeric().withMessage('El importe debe ser un número'),
    body('id_proveedor').isInt({ min: 1 }).withMessage('El ID del proveedor debe ser un número válido'),
    body('asientos').isNumeric().withMessage('Los asientos deben ser un número'),
    body('factura_numero').notEmpty().withMessage('El número de factura es requerido'),
    body('id_tipo_unidad').isInt({ min: 1 }).withMessage('El ID del tipo de unidad debe ser un número válido'),
    body('id_tipo_carroceria').isInt({ min: 1 }).withMessage('El ID del tipo de carrocería debe ser un número válido'),
    body('id_carnet').isInt({ min: 1 }).withMessage('El ID del carnet debe ser un número válido')
];

const unidadPlanValidator = [
    body('id_unidad').isInt({ min: 1 }).withMessage('El ID de la unidad debe ser un número válido'),
    body('id_plan').isInt({ min: 1 }).withMessage('El ID del plan debe ser un número válido')
];

const usuarioRolValidator = [
    body('id_usuario').isInt({ min: 1 }).withMessage('El ID del usuario debe ser un número válido'),
    body('id_rol').isInt({ min: 1 }).withMessage('El ID del rol debe ser un número válido')
];

const usuarioSucursalValidator = [
    body('id_usuario').isInt({ min: 1 }).withMessage('El ID del usuario debe ser un número válido'),
    body('id_sucursal').isInt({ min: 1 }).withMessage('El ID de la sucursal debe ser un número válido')
];

const usuarioUnidadValidator = [
    body('id_usuario').isInt({ min: 1 }).withMessage('El ID del usuario debe ser un número válido'),
    body('id_unidad').isInt({ min: 1 }).withMessage('El ID de la unidad debe ser un número válido')
];

const usuarioCarnetValidator = [
    body('id_usuario')
        .isInt({ min: 1 })
        .withMessage('El id_usuario debe ser un número entero positivo'),
    body('carnets')
        .isArray()
        .withMessage('carnets debe ser un array'),
    body('carnets.*')
        .isInt({ min: 1 })
        .withMessage('Cada elemento de carnets debe ser un número entero positivo')
];





// =============================================
// EXPORTACIÓN DE TODOS LOS VALIDADORES
// =============================================

module.exports = {
    handleInputErrors, 
    centrosValidator, 
    usuariosValidator_datosPersonales,
    usuariosValidator_datosAcceso,
    categoriaUsuarioValidator,
    neumaticoValidator,
    gpsValidator,
    modeloNeumaticoValidator,
    planValidator,
    polizaValidator,
    proveedorValidator, 
    camaraValidator,
    carnetValidator,
    categoriaValidator,
    estadoNeumaticoValidator,
    estadoRepuestoValidator,
    estadoTanqueValidator,
    estadoVehiculoValidator,
    estadoMovimientoRepuestoValidator,
    expendedoraBoletosValidator,
    repuestoValidator,
    rtoValidator,
    sectorValidator,
    sucursalValidator,
    tanqueValidator,
    tareaPlanValidator,
    tipoCarnetValidator,
    tipoCarroceriaValidator,
    tipoCombustibleValidator,
    tipoPlanValidator,
    tipoProveedorValidator,
    tipoRtoValidator,
    tipoTanqueValidator,
    tareaValidator,
    tipoUnidadValidator,
    turnoValidator,
    unidadVehiculoValidator,
    unidadPlanValidator,
    usuarioRolValidator,
    usuarioSucursalValidator,
    usuarioUnidadValidator,
    usuarioCarnetValidator,
};