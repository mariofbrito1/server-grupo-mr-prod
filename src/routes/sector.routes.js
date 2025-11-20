const { Router } = require('express');
const router = Router();

const { sectorValidator, handleInputErrors } = require('../middlewares/validators');
const { getList, getById, insert, deleteById, update } = require('../controllers/sector.controller');

router.get('/sectores', getList);
router.get('/sector/:id', getById);
router.post('/sector', sectorValidator, handleInputErrors, insert);
router.delete('/sector/:id', deleteById);
router.put('/sector/:id', sectorValidator, handleInputErrors, update);

module.exports = router;