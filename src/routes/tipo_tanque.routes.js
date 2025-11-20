const { Router } = require('express');
const router = Router();

const { tipoTanqueValidator, handleInputErrors } = require('../middlewares/validators');
const { getList, getById, insert, deleteById, update } = require('../controllers/tipo_tanque.controller');

router.get('/tipos_tanque', getList);
router.get('/tipo_tanque/:id', getById);
router.post('/tipo_tanque', tipoTanqueValidator, handleInputErrors, insert);
router.delete('/tipo_tanque/:id', deleteById);
router.put('/tipo_tanque/:id', tipoTanqueValidator, handleInputErrors, update);

module.exports = router;