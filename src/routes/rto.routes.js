const { Router } = require('express');
const router = Router();

const { rtoValidator, handleInputErrors } = require('../middlewares/validators');
const { getList, getById, insert, deleteById, update } = require('../controllers/rto.controller');

router.get('/rtos', getList);
router.get('/rto/:id', getById);
router.post('/rto', rtoValidator, handleInputErrors, insert);
router.delete('/rto/:id', deleteById);
router.put('/rto/:id', rtoValidator, handleInputErrors, update);

module.exports = router;