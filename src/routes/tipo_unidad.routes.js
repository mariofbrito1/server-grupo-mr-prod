const { Router } = require('express');
const router = Router();

const { tipoUnidadValidator, handleInputErrors } = require('../middlewares/validators');
const { getList, getById, insert, deleteById, update } = require('../controllers/tipo_unidad.controller');

router.get('/tipos_unidad', getList);
router.get('/tipo_unidad/:id', getById);
router.post('/tipo_unidad', tipoUnidadValidator, handleInputErrors, insert);
router.delete('/tipo_unidad/:id', deleteById);
router.put('/tipo_unidad/:id', tipoUnidadValidator, handleInputErrors, update);

module.exports = router;