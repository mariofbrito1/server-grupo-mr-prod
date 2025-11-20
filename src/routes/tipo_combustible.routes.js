const { Router } = require('express');
const router = Router();

const { tipoCombustibleValidator, handleInputErrors } = require('../middlewares/validators');
const { getList, getById, insert, deleteById, update } = require('../controllers/tipo_combustible.controller');

router.get('/tipos_combustible', getList);
router.get('/tipo_combustible/:id', getById);
router.post('/tipo_combustible', tipoCombustibleValidator, handleInputErrors, insert);
router.delete('/tipo_combustible/:id', deleteById);
router.put('/tipo_combustible/:id', tipoCombustibleValidator, handleInputErrors, update);

module.exports = router;