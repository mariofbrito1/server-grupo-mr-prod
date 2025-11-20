const { Router } = require('express');
const router = Router();

const { categoriaValidator, handleInputErrors } = require('../middlewares/validators');
const { getList, getById, insert, deleteById, update, getListActive } = require('../controllers/categoria.controller');

router.get('/categorias', getList);
router.get('/categorias_activas', getListActive);
router.get('/categoria/:id', getById);
router.post('/categoria', categoriaValidator, handleInputErrors, insert);
router.delete('/categoria/:id', deleteById);
router.put('/categoria/:id', categoriaValidator, handleInputErrors, update);

module.exports = router;