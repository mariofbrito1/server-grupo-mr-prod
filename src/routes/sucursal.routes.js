const { Router } = require('express');
const router = Router();

const { sucursalValidator, handleInputErrors } = require('../middlewares/validators');
const { getList, getById, insert, deleteById, update, getListActive } = require('../controllers/sucursal.controller');

router.get('/sucursales', getList);
router.get('/sucursales_activas', getListActive);
router.get('/sucursal/:id', getById);
router.post('/sucursal', sucursalValidator, handleInputErrors, insert);
router.delete('/sucursal/:id', deleteById);
router.put('/sucursal/:id', sucursalValidator, handleInputErrors, update);

module.exports = router;