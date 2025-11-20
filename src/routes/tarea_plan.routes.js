const { Router } = require('express');
const router = Router();

const { tareaPlanValidator, handleInputErrors } = require('../middlewares/validators');
const { 
    getList, 
    getByTarea, 
    getByPlan, 
    insert, 
    deleteById 
} = require('../controllers/tarea_plan.controller');

router.get('/tareas_planes', getList);
router.get('/tareas_plan/:id_plan', getByPlan);
router.get('/planes_tarea/:id_tarea', getByTarea);
router.post('/tarea_plan', tareaPlanValidator, handleInputErrors, insert);
router.delete('/tarea_plan/:id_tarea/:id_plan', deleteById);

module.exports = router;