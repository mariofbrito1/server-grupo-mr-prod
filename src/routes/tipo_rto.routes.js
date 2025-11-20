const { Router } = require('express');
const router = Router();

//const { tipoRtoValidator, handleInputErrors } = require('../middlewares/validators');
const { getList, getById, insert, deleteById, update } = require('../controllers/tipo_rto.controller');

router.get('/tipos_rto', getList);
router.get('/tipo_rto/:id', getById);
router.post('/tipo_rto', insert);
router.delete('/tipo_rto/:id', deleteById);
router.put('/tipo_rto/:id',  update);

module.exports = router;