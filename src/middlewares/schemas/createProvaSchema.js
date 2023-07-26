const { checkSchema } = require('express-validator');

module.exports = checkSchema({
  title: {
    trim: true,
    notEmpty: {
      errorMessage: 'Campo obrigatório',
    },
  },
  description: {
    trim: true,
    notEmpty: {
      errorMessage: 'Campo obrigatório',
    },
  },
  initial_date: {
    notEmpty: {
      errorMessage: 'Campo obrigatório',
    },
    isISO8601: {
      errorMessage: 'Campo deve ser em formato de data',
    },
  },
  end_date: {
    notEmpty: {
      errorMessage: 'Campo obrigatório',
    },
    isISO8601: {
      errorMessage: 'Campo deve ser em formato de data',
    },
  },
  timer: {
    notEmpty: {
      errorMessage: 'Campo obrigatório',
    },
    isNumeric: {
      errorMessage: 'Campo deve ser númerico',
    },
  },
  'questions.*.title': {
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
});
