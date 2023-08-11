const { checkSchema } = require('express-validator');

module.exports = checkSchema({
  'questions.*.question_title': {
    trim: true,
    notEmpty: {
      errorMessage: 'Campo obrigatório',
    },
  },
  'questions.*.peso': {
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
  'questions.*.options.*.option_title': {
    trim: true,
    notEmpty: {
      errorMessage: 'Campo obrigatório',
    },
  },
  'questions.*.options.*.iscorrect': {
    notEmpty: {
      errorMessage: 'Campo obrigatório',
    },
    isBoolean: {
      errorMessage: 'Campo deve ser booleano',
    },
  },
  'questions.*.options.*.option_letter': {
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
