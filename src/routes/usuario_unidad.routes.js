const { Router } = require('express');
const router = Router();

const { usuarioUnidadValidator, handleInputErrors } = require('../middlewares/validators');
const { getList, getByUsuario, getByUnidad, insert, deleteById } = require('../controllers/usuario_unidad.controller');

router.get('/usuarios_unidad', getList);
router.get('/unidades_usuario/:id_usuario', getByUsuario);
router.get('/usuarios_unidad/:id_unidad', getByUnidad);
router.post('/usuario_unidad', usuarioUnidadValidator, handleInputErrors, insert);
router.delete('/usuario_unidad/:id_usuario/:id_unidad', deleteById);

module.exports = router;