const { Router } = require('express');
const router = Router();

const { estadoNeumaticoValidator, handleInputErrors } = require('../middlewares/validators');
const { getList, getById, insert, deleteById, update } = require('../controllers/estado_neumatico.controller');

router.get('/estados_neumatico', getList);
router.get('/estado_neumatico/:id', getById);
router.post('/estado_neumatico', estadoNeumaticoValidator, handleInputErrors, insert);
router.delete('/estado_neumatico/:id', deleteById);
router.put('/estado_neumatico/:id', estadoNeumaticoValidator, handleInputErrors, update);

module.exports = router;