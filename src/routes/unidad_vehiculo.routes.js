const { Router } = require('express');
const router = Router();

const { unidadVehiculoValidator, handleInputErrors } = require('../middlewares/validators');
const { getList, getById, insert, deleteById, update } = require('../controllers/unidad_vehiculo.controller');

router.get('/unidades_vehiculo', getList);
router.get('/unidad_vehiculo/:id', getById);
router.post('/unidad_vehiculo', unidadVehiculoValidator, handleInputErrors, insert);
router.delete('/unidad_vehiculo/:id', deleteById);
router.put('/unidad_vehiculo/:id', unidadVehiculoValidator, handleInputErrors, update);

module.exports = router;