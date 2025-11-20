const { Router } = require('express');
const router = Router();

const { expendedoraBoletosValidator, handleInputErrors } = require('../middlewares/validators');
const { getList, getById, insert, deleteById, update } = require('../controllers/expendedora_boletos.controller');

router.get('/expendedoras_boletos', getList);
router.get('/expendedora_boletos/:id', getById);
router.post('/expendedora_boletos', expendedoraBoletosValidator, handleInputErrors, insert);
router.delete('/expendedora_boletos/:id', deleteById);
router.put('/expendedora_boletos/:id', expendedoraBoletosValidator, handleInputErrors, update);

module.exports = router;