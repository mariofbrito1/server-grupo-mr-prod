const { Router } = require('express');
const router = Router(); 

const { 
    usuarioCarnetValidator, 
    handleInputErrors 
} = require('../middlewares/validators');

const { 
    getList, 
    getById, 
    getByUsuarioId, 
    getByCarnetId,
    insert, 
    update,
    deleteById, 
    deleteByUsuario
} = require('../controllers/usuario_carnet.controller');

router.get('/usuario-carnet', getList); 
router.get('/usuario-carnet/:id_usuario/:id_carnet', getById);
router.get('/usuario-carnet/usuario/:id_usuario', getByUsuarioId);
router.get('/usuario-carnet/carnet/:id_carnet', getByCarnetId);
router.post('/usuario-carnet', usuarioCarnetValidator, handleInputErrors, insert);
router.put('/usuario-carnet/:id_usuario', usuarioCarnetValidator, handleInputErrors, update); // PUT usa misma lógica
router.delete('/usuario-carnet/:id_usuario/:id_carnet', deleteById);
router.delete('/usuario-carnet/usuario/:id_usuario', deleteByUsuario); // Eliminar todas las relaciones de un usuario

module.exports = router;