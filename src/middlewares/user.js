const knex = require('../db/connection');

const user = async (req, res, next) => {
  try {
    const { uuidUser } = req.params;
    const user = await knex
      .select('user_id')
      .from('users')
      .where({ uuid: uuidUser })
      .then((value) => value.shift());

    req.params.user_id = user.user_id;

    next();
  } catch (error) {
    res.status(500).json({
      error: {
        msg: 'Ocorreu um erro ao obter dados do usuario',
      },
    });
  }
};

module.exports = user;
