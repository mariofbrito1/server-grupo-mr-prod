const { Router } = require('express');
const router = Router();

const { categoriaUsuarioValidator, handleInputErrors } = require('../middlewares/validators');
const { 
    getList, 
    getByUsuario, 
    getByCategoria, 
    insert, 
    deleteById, 
    deleteByUsuarioAndCategoria 
} = require('../controllers/categoria_usuario.controller');

router.get('/categorias_usuarios', getList);
router.get('/categorias_usuario/:id_usuario', getByUsuario);
router.get('/usuarios_categoria/:id_categoria', getByCategoria);
router.post('/categoria_usuario', categoriaUsuarioValidator, handleInputErrors, insert);
router.delete('/categoria_usuario/:id_categoria/:id_usuario', deleteByUsuarioAndCategoria);
router.delete('/categoria_usuario/:id', deleteById);

module.exports = router;