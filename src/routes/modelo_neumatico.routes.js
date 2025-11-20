const { Router } = require('express');
const router = Router();

const { modeloNeumaticoValidator, handleInputErrors } = require('../middlewares/validators');
const { getList, getById, insert, deleteById, update } = require('../controllers/modelo_neumatico.controller');

router.get('/modelos_neumatico', getList);
router.get('/modelo_neumatico/:id', getById);
router.post('/modelo_neumatico', modeloNeumaticoValidator, handleInputErrors, insert);
router.delete('/modelo_neumatico/:id', deleteById);
router.put('/modelo_neumatico/:id', modeloNeumaticoValidator, handleInputErrors, update);

module.exports = router;