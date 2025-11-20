const { Router } = require('express');
const router = Router();

const { getList, getById, getAllSeccionesByIdUsuario, insert, deleteById, update } = require('../controllers/rol.controller')

router.get('/roles', getList);
router.get('/rol/:id', getById);
router.get('/rol/secciones/:id', getAllSeccionesByIdUsuario);
router.post('/rol', insert);
router.delete('/rol/:id', deleteById);
router.put('/rol/:id', update);


module.exports = router;

//