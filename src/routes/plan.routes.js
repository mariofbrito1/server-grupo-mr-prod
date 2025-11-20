const { Router } = require('express');
const router = Router();

const { planValidator, handleInputErrors } = require('../middlewares/validators');
const { getList, getById, insert, deleteById, update } = require('../controllers/plan.controller');

router.get('/planes', getList);
router.get('/plan/:id', getById);
router.post('/plan', planValidator, handleInputErrors, insert);
router.delete('/plan/:id', deleteById);
router.put('/plan/:id', planValidator, handleInputErrors, update);

module.exports = router;