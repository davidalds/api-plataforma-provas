const jwt = require('jsonwebtoken');

const auth = (req, res, next) => {
  const token = req.headers.authorization;

  if (!token) {
    return res.status(400).json({
      error: {
        msg: 'Token não informado',
      },
    });
  }

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
