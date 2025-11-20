const { Router } = require('express');
const router = Router();

const { polizaValidator, handleInputErrors } = require('../middlewares/validators');
const { getList, getById, insert, deleteById, update } = require('../controllers/poliza.controller');

router.get('/polizas', getList);
router.get('/poliza/:id', getById);
router.post('/poliza', polizaValidator, handleInputErrors, insert);
router.delete('/poliza/:id', deleteById);
router.put('/poliza/:id', polizaValidator, handleInputErrors, update);

module.exports = router;