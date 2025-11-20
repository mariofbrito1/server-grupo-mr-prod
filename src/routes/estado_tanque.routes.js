const { Router } = require('express');
const router = Router();

const { estadoTanqueValidator, handleInputErrors } = require('../middlewares/validators');
const { getList, getById, insert, deleteById, update } = require('../controllers/estado_tanque.controller');

router.get('/estados_tanque', getList);
router.get('/estado_tanque/:id', getById);
router.post('/estado_tanque', estadoTanqueValidator, handleInputErrors, insert);
router.delete('/estado_tanque/:id', deleteById);
router.put('/estado_tanque/:id', estadoTanqueValidator, handleInputErrors, update);

module.exports = router;