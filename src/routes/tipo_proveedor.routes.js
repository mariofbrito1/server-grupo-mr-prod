const { Router } = require('express');
const router = Router();

const { tipoProveedorValidator, handleInputErrors } = require('../middlewares/validators');
const { getList, getById, insert, deleteById, update } = require('../controllers/tipo_proveedor.controller');

router.get('/tipos_proveedor', getList);
router.get('/tipo_proveedor/:id', getById);
router.post('/tipo_proveedor', tipoProveedorValidator, handleInputErrors, insert);
router.delete('/tipo_proveedor/:id', deleteById);
router.put('/tipo_proveedor/:id', tipoProveedorValidator, handleInputErrors, update);

module.exports = router;