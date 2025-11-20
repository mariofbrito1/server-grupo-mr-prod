const { Router } = require('express');
const router = Router();

const { carnetValidator, handleInputErrors } = require('../middlewares/validators');
const { getList, getById, insert, deleteById, update } = require('../controllers/carnet.controller');

router.get('/carnets', getList);
router.get('/carnet/:id', getById);
router.post('/carnet', carnetValidator, handleInputErrors, insert);
router.delete('/carnet/:id', deleteById);
router.put('/carnet/:id', carnetValidator, handleInputErrors, update);

module.exports = router;