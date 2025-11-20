const { Router } = require('express');
const router = Router();

const { turnoValidator, handleInputErrors } = require('../middlewares/validators');
const { getList, getById, insert, deleteById, update } = require('../controllers/turno.controller');

router.get('/turnos', getList);
router.get('/turno/:id', getById);
router.post('/turno', turnoValidator, handleInputErrors, insert);
router.delete('/turno/:id', deleteById);
router.put('/turno/:id', turnoValidator, handleInputErrors, update);

module.exports = router;