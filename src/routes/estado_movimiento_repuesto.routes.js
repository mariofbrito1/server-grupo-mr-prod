const { Router } = require('express');
const router = Router();

const { estadoMovimientoRepuestoValidator, handleInputErrors } = require('../middlewares/validators');
const { getList, getById, insert, deleteById, update } = require('../controllers/estado_movimiento_repuesto.controller');

router.get('/estados_movimiento_repuesto', getList);
router.get('/estado_movimiento_repuesto/:id', getById);
router.post('/estado_movimiento_repuesto', estadoMovimientoRepuestoValidator, handleInputErrors, insert);
router.delete('/estado_movimiento_repuesto/:id', deleteById);
router.put('/estado_movimiento_repuesto/:id', estadoMovimientoRepuestoValidator, handleInputErrors, update);

module.exports = router;