const { Router } = require('express');
const router = Router();

const { tipoPlanValidator, handleInputErrors } = require('../middlewares/validators');
const { getList, getById, insert, deleteById, update } = require('../controllers/tipo_plan.controller');

router.get('/tipos_plan', getList);
router.get('/tipo_plan/:id', getById);
router.post('/tipo_plan', tipoPlanValidator, handleInputErrors, insert);
router.delete('/tipo_plan/:id', deleteById);
router.put('/tipo_plan/:id', tipoPlanValidator, handleInputErrors, update);

module.exports = router;