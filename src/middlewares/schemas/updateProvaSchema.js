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
});
