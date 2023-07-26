const { checkSchema } = require('express-validator');

module.exports = checkSchema({
  prova_id: {
    notEmpty: {
      errorMessage: 'Campo obrigatório',
    },
    isNumeric: {
      errorMessage: 'Campo deve ser númerico',
    },
  },
  options: {
    notEmpty: {
      errorMessage: 'Campo obrigatório',
    },
    isArray: {
      errorMessage: 'Campo deve ser um array',
    },
    isLength: {
      min: 1,
      errorMessage: 'Tamanho mínimo do array deve ser 1',
    },
  },
});
