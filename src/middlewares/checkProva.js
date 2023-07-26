const { findProvaByUuid } = require('../models/Prova');

const checkProva = async (req, res, next) => {
  try {
    const { uuidProva } = req.params;

    const prova = await findProvaByUuid(uuidProva);

    if (!prova) {
      return res.status(404).json({
        errors: {
          msg: 'Não foram encontradas provas com o identificador informado',
        },
      });
    }

    req.params.prova = prova;
    next();
  } catch (error) {
    res.status(500).json({
      errors: {
        msg: 'Ocorreu um erro ao buscar prova',
      },
    });
  }
};

module.exports = checkProva;
