const creator = (req, res, next) => {
  const { user_type } = req.params;

  if (user_type !== 1) {
    return res.status(401).json({
      error: {
        msg: 'Usuário não possui permissão de criador',
      },
    });
  }

  next();
};

module.exports = creator;
