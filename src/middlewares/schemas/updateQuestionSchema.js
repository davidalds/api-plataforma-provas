const { checkSchema } = require('express-validator');

module.exports = checkSchema({
  question_title: {
    trim: true,
    notEmpty: {
      errorMessage: 'Campo obrigatório',
    },
  },
  peso: {
    notEmpty: {
      errorMessage: 'Campo obrigatório',
    },
    isNumeric: {
      errorMessage: 'Campo deve ser númerico',
    },
    isFloat: {
      options: {
        min: 1,
        max: 10,
      },
      errorMessage: 'Valor deve ser entre 1 e 10',
    },
  },
  'options.*.title': {
    trim: true,
    notEmpty: {
      errorMessage: 'Campo obrigatório',
    },
  },
  'options.*.iscorrect': {
    notEmpty: {
      errorMessage: 'Campo obrigatório',
    },
    isBoolean: {
      errorMessage: 'Campo deve ser booleano',
    },
  },
  'options.*.option_letter': {
    notEmpty: {
      errorMessage: 'Campo obrigatório',
    },
    isLength: {
      options: {
        max: 1,
      },
      errorMessage: 'Campo deve conter tamanho 1',
    },
  },
});
