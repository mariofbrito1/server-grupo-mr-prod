const { Router } = require('express');
const router = Router();

const { estadoVehiculoValidator, handleInputErrors } = require('../middlewares/validators');
const { getList, getById, insert, deleteById, update } = require('../controllers/estado_vehiculo.controller');

router.get('/estados_vehiculo', getList);
router.get('/estado_vehiculo/:id', getById);
router.post('/estado_vehiculo', estadoVehiculoValidator, handleInputErrors, insert);
router.delete('/estado_vehiculo/:id', deleteById);
router.put('/estado_vehiculo/:id', estadoVehiculoValidator, handleInputErrors, update);

module.exports = router;