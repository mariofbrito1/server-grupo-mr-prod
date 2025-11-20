const { Router } = require('express');
const router = Router();

const { usuarioSucursalValidator, handleInputErrors } = require('../middlewares/validators');
const { getList, getByUsuario, getBySucursal, insert, deleteById } = require('../controllers/usuario_sucursal.controller');

router.get('/usuarios_sucursal', getList);
router.get('/sucursales_usuario/:id_usuario', getByUsuario);
router.get('/usuarios_sucursal/:id_sucursal', getBySucursal);
router.post('/usuario_sucursal', usuarioSucursalValidator, handleInputErrors, insert);
router.delete('/usuario_sucursal/:id_usuario/:id_sucursal', deleteById);

module.exports = router;