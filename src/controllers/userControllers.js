const { create, getUserByEmail } = require('../models/User');
const { genSaltSync, hashSync, compareSync } = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');

class UserController {
  async createUser(req, res) {
    try {
      const { username, password, email } = req.body;
      const salt = genSaltSync(10);
      const hash = hashSync(password, salt);
      const uuid = uuidv4();
      await create({ username, password: hash, email, uuid });

      res.status(200).json({
        msg: 'Usuário criado com sucesso',
      });
    } catch (error) {
      console.log(error);
      res.status(500).json({
        error: {
          msg: 'Ocorreu um erro ao criar usuário',
        },
      });
    }
  }

  async login(req, res) {
    try {
      const { email, password } = req.body;

      const user = await getUserByEmail(email);

      if (!user) {
        return res.status(400).json({
          error: {
            msg: 'Credenciais inválidas',
          },
        });
      }

      if (!compareSync(password, user.password)) {
        return res.status(400).json({
          error: {
            msg: 'Credenciais inválidas',
          },
        });
      }

      const accessToken = jwt.sign(
        { uuid: user.uuid, username: user.username },
        process.env.JWTKEY,
        { expiresIn: '24h' }
      );

      res.status(200).json({
        user: {
          accessToken,
        },
      });
    } catch (error) {
      console.log(error);
      res.status(500).json({
        error: {
          msg: 'Ocorreu um erro ao realizar login',
        },
      });
    }
  }
}

module.exports = new UserController();
