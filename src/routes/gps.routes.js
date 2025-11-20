const { Router } = require('express');
const router = Router();

const { gpsValidator, handleInputErrors } = require('../middlewares/validators');
const { getList, getById, insert, deleteById, update } = require('../controllers/gps.controller');

router.get('/gps', getList);
router.get('/gps/:id', getById);
router.post('/gps', gpsValidator, handleInputErrors, insert);
router.delete('/gps/:id', deleteById);
router.put('/gps/:id', gpsValidator, handleInputErrors, update);

module.exports = router;