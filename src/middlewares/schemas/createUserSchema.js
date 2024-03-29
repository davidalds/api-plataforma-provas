const { checkSchema } = require('express-validator');

module.exports = checkSchema({
  username: {
    trim: true,
    notEmpty: {
      errorMessage: 'Campo obrigatório',
    },
    isLength: {
      options: {
        min: 3,
        max: 20,
      },
      errorMessage: 'Tamanho mínimo deve ser 3 e máximo 20',
    },
  },
  email: {
    trim: true,
    notEmpty: {
      errorMessage: 'Campo obrigatório',
    },
    isEmail: {
      errorMessage: 'E-mail deve ser válido',
    },
  },
  password: {
    trim: true,
    notEmpty: {
      errorMessage: 'Campo obrigatório',
    },
  },
  user_type: {
    notEmpty: {
      errorMessage: 'Campo obrigatório',
    },
    isFloat: {
      options: {
        max: 2,
        min: 1,
      },
      errorMessage: 'Valor deve ser entre 1 e 2',
    },
  },
});
