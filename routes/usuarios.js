
const { Router } = require('express');
const { check } = require('express-validator');


const { validarCampos } = require('../middlewares/validar-campos');
const { nombreExiste, existeUsuarioPorId } = require('../helpers/db-validators');

const { usuariosObtener,
        usuariosPut,
        usuariosPost,
        usuariosDelete
} = require('../controllers/usuarios');

const router = Router();


router.get('/', usuariosObtener );

router.put('/:id',[
    check('id', 'No es un ID válido').isMongoId(),
    check('id').custom( existeUsuarioPorId ),    
    validarCampos
],usuariosPut );

router.post('/',[
    check('nombre', 'El nombre es obligatorio').not().isEmpty(),
    check('password', 'El password debe de ser más de 6 letras').isLength({ min: 6 }),    
    check('nombre').custom( nombreExiste ),
    validarCampos
], usuariosPost );

router.delete('/:id',[
    check('id', 'No es un ID válido').isMongoId(),
    check('id').custom( existeUsuarioPorId ),
    validarCampos
],usuariosDelete );

module.exports = router;