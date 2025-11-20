const { Router } = require('express');
const router = Router();

const { proveedorValidator, handleInputErrors } = require('../middlewares/validators');
const { getList, getById, insert, deleteById, update } = require('../controllers/proveedor.controller');

router.get('/proveedores', getList);
router.get('/proveedor/:id', getById);
router.post('/proveedor', proveedorValidator, handleInputErrors, insert);
router.delete('/proveedor/:id', deleteById);
router.put('/proveedor/:id', proveedorValidator, handleInputErrors, update);

module.exports = router;