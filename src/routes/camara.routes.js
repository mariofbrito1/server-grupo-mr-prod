const { Router } = require('express');
const router = Router(); 

const { camaraValidator, handleInputErrors } = require('../middlewares/validators');
const { getList, getById, insert, deleteById, update } = require('../controllers/camara.controller');

router.get('/camaras', getList); 
router.get('/camara/:id', getById);
router.post('/camara', camaraValidator, handleInputErrors, insert);
router.delete('/camara/:id', deleteById);
router.put('/camara/:id', camaraValidator, handleInputErrors, update);

module.exports = router;
