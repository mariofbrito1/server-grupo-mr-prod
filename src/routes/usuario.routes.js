const { Router } = require('express');
const router = Router(); 
 

const {  
  handleInputErrors, 
  usuariosValidator_datosPersonales, 
  usuariosValidator_datosAcceso 
} = require('../middlewares/validators');

const { 
  getList, 
  getListNac,
  getById, 
  insert, 
  deleteById, 
  update, 
  login, 
  renew, 
  resetPassword, 
  changePassword,  
} = require('../controllers/usuario.controller');

// CRUD
router.get('/user', getList);
router.get('/nacionalidades', getListNac);
router.get('/user/:id', getById);
router.post('/user', usuariosValidator_datosPersonales, usuariosValidator_datosAcceso, handleInputErrors, insert);
router.delete('/user/:id', deleteById);
router.put('/user/:id', update);

 

// Auth
router.post('/login', login);
router.post('/renew', renew);
router.post('/reset', resetPassword);
router.post('/change', changePassword);

module.exports = router;