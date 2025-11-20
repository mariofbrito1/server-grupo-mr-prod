const { Router } = require('express');
const router = Router();

const { tipoCarroceriaValidator, handleInputErrors } = require('../middlewares/validators');
const { getList, getById, insert, deleteById, update } = require('../controllers/tipo_carroceria.controller');

router.get('/tipos_carroceria', getList);
router.get('/tipo_carroceria/:id', getById);
router.post('/tipo_carroceria', tipoCarroceriaValidator, handleInputErrors, insert);
router.delete('/tipo_carroceria/:id', deleteById);
router.put('/tipo_carroceria/:id', tipoCarroceriaValidator, handleInputErrors, update);

module.exports = router;