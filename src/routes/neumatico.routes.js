const { Router } = require('express');
const router = Router();

const { neumaticoValidator, handleInputErrors } = require('../middlewares/validators');
const { getList, getById, insert, deleteById, update } = require('../controllers/neumatico.controller');

router.get('/neumaticos', getList);
router.get('/neumatico/:id', getById);
router.post('/neumatico', neumaticoValidator, handleInputErrors, insert);
router.delete('/neumatico/:id', deleteById);
router.put('/neumatico/:id', neumaticoValidator, handleInputErrors, update);


module.exports = router;