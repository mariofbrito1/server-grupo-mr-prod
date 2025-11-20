const { Router } = require('express');
const router = Router();

const { tareaValidator, handleInputErrors } = require('../middlewares/validators');
const { getList, getById, insert, deleteById, update } = require('../controllers/tarea.controller');

router.get('/tareas', getList);
router.get('/tarea/:id', getById);
router.post('/tarea', tareaValidator, handleInputErrors, insert);
router.delete('/tarea/:id', deleteById);
router.put('/tarea/:id', tareaValidator, handleInputErrors, update);

module.exports = router;