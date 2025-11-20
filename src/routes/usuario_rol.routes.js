const { Router } = require('express');
const router = Router();

const { usuarioRolValidator, handleInputErrors } = require('../middlewares/validators');
const { getList, getByUsuario, getByRol, insert, deleteById } = require('../controllers/usuario_rol.controller');

router.get('/usuarios_rol', getList);
router.get('/roles_usuario/:id_usuario', getByUsuario);
router.get('/usuarios_rol/:id_rol', getByRol);
router.post('/usuario_rol', usuarioRolValidator, handleInputErrors, insert);
router.delete('/usuario_rol/:id_usuario/:id_rol', deleteById);

module.exports = router;