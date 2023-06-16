const { findUserByUuid } = require('../models/User');
const jwt = require('jsonwebtoken');

const user = async (req, res, next) => {
  try {
    const { uuidUser, user_token } = req.params;

    const user = await findUserByUuid(uuidUser);

    if (!user) {
      return res.status(404).json({
        error: {
          msg: 'O usuário não existe',
        },
      });
    }

    jwt.verify(user_token, process.env.JWTKEY, (err, decoded) => {
      if (
        !(decoded.uuid === uuidUser && decoded.user_type === user.user_type)
      ) {
        return res.status(401).json({
          error: {
            msg: 'Token de acesso inválido para o tipo de usuário',
          },
        });
      }

      if (err) {
        return res.status(403).json({
          error: {
            msg: 'Ocorreu um erro ao checar token de acesso',
          },
        });
      }

      req.params.user_id = user.user_id;
      req.params.user_type = user.user_type;
      next();
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      error: {
        msg: 'Ocorreu um erro ao obter dados do usuario',
      },
    });
  }
};

module.exports = user;
