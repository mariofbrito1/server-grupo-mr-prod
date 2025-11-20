const { Router } = require('express');
const router = Router();

const { tipoCarnetValidator, handleInputErrors } = require('../middlewares/validators');
const { getList, getById, insert, deleteById, update } = require('../controllers/tipo_carnet.controller');

router.get('/tipos_carnet', getList);
router.get('/tipo_carnet/:id', getById);
router.post('/tipo_carnet', tipoCarnetValidator, handleInputErrors, insert);
router.delete('/tipo_carnet/:id', deleteById);
router.put('/tipo_carnet/:id', tipoCarnetValidator, handleInputErrors, update);

module.exports = router;