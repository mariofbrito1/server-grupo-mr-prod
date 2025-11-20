const { Router } = require('express');
const router = Router();

const { estadoRepuestoValidator, handleInputErrors } = require('../middlewares/validators');
const { getList, getById, insert, deleteById, update } = require('../controllers/estado_repuesto.controller');

router.get('/estados_repuesto', getList);
router.get('/estado_repuesto/:id', getById);
router.post('/estado_repuesto', estadoRepuestoValidator, handleInputErrors, insert);
router.delete('/estado_repuesto/:id', deleteById);
router.put('/estado_repuesto/:id', estadoRepuestoValidator, handleInputErrors, update);

module.exports = router;