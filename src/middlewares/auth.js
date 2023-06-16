const jwt = require('jsonwebtoken');

const auth = (req, res, next) => {
  let token = req.headers.authorization;

  if (!token) {
    return res.status(400).json({
      error: {
        msg: 'Token não informado',
      },
    });
  }

  const token_arr = token.split(' ');

  if (token_arr.includes('Bearer')) {
    if (token_arr.length === 2) {
      token = token_arr[1];
    } else {
      return res.status(400).json({
        error: {
          msg: 'Token mal formatado',
        },
      });
    }
  }

  req.params.user_token = token;

  jwt.verify(token, process.env.JWTKEY, (err) => {
    if (err) {
      return res.status(403).json({
        error: {
          msg: 'Token inválido',
        },
      });
    }
    next();
  });
};

module.exports = auth;
