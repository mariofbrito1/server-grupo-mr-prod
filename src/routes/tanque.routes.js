const { Router } = require('express');
const router = Router();

const { tanqueValidator, handleInputErrors } = require('../middlewares/validators');
const { getList, getById, insert, deleteById, update } = require('../controllers/tanque.controller');

router.get('/tanques', getList);
router.get('/tanque/:id', getById);
router.post('/tanque', tanqueValidator, handleInputErrors, insert);
router.delete('/tanque/:id', deleteById);
router.put('/tanque/:id', tanqueValidator, handleInputErrors, update);

module.exports = router;