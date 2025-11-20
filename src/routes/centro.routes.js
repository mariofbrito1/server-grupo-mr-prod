const { Router } = require('express');
const router = Router();

const { centrosValidator, handleInputErrors } = require('../middlewares/validators');
const { getList, getById, insert, deleteById, update, getListActive } = require('../controllers/centro.controller');

router.get('/centros', getList);
router.get('/centros_activos', getListActive);
router.get('/centro/:id', getById);
router.post('/centro', centrosValidator, handleInputErrors, insert);
router.delete('/centro/:id', deleteById);
router.put('/centro/:id', centrosValidator, handleInputErrors, update);
// ad
module.exports = router;
