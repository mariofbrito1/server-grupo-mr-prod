const { Router } = require('express');
const router = Router();

const { unidadPlanValidator, handleInputErrors } = require('../middlewares/validators');
const { getList, getByUnidad, getByPlan, insert, deleteById } = require('../controllers/unidad_plan.controller');

router.get('/unidades_plan', getList);
router.get('/planes_unidad/:id_unidad', getByUnidad);
router.get('/unidades_plan/:id_plan', getByPlan);
router.post('/unidad_plan', unidadPlanValidator, handleInputErrors, insert);
router.delete('/unidad_plan/:id_unidad/:id_plan', deleteById);

module.exports = router;