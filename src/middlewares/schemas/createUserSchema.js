const { check } = require('express-validator');

module.exports = [
  check('username')
    .notEmpty()
    .withMessage('Campo obrigatório')
    .trim()
    .isLength({ min: 3, max: 20 })
    .withMessage('Tamanho mínimo deve ser 3 e máximo 20'),
  check('email')
    .notEmpty()
    .withMessage('Campo obrigatório')
    .trim()
    .isEmail()
    .withMessage('E-mail deve ser válido'),
  check('password').notEmpty().withMessage('Campo obrigatório').trim(),
];
