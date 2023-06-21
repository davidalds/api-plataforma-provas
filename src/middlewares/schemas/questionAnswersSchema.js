const { check } = require('express-validator');

module.exports = [
  check('prova_id').notEmpty().withMessage('Campo obrigatório'),
  check('options')
    .isArray({ min: 1 })
    .withMessage('Valor deve ser um array com um item ou mais')
    .notEmpty()
    .withMessage('Campo obrigatório'),
];
