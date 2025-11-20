const { Router } = require('express');
const router = Router();

const { repuestoValidator, handleInputErrors } = require('../middlewares/validators');
const { getList, getById, insert, deleteById, update } = require('../controllers/repuesto.controller');

router.get('/repuestos', getList);
router.get('/repuesto/:id', getById);
router.post('/repuesto', repuestoValidator, handleInputErrors, insert);
router.delete('/repuesto/:id', deleteById);
router.put('/repuesto/:id', repuestoValidator, handleInputErrors, update);

module.exports = router;