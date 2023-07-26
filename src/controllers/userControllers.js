const {
  create,
  findUserByEmail,
  findAllUsersCandidato,
  findUserByUsername,
} = require('../models/User');
const { genSaltSync, hashSync, compareSync } = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const { findProvaByUuid } = require('../models/Prova');
const { validationResult } = require('express-validator');

class UserController {
  async createUser(req, res) {
    try {
      const errors = validationResult(req);

      if (!errors.isEmpty()) {
        return res.status(400).json(errors.array());
      }

      const { username, password, email, user_type } = req.body;

      const hasUserWithUsername = await findUserByUsername(username);

      if (hasUserWithUsername) {
        return res.status(403).json({
          errors: {
            msg: 'Já existe um usuário cadastrado com esse nome de usuário',
          },
        });
      }

      const hasUserWithEmail = await findUserByEmail(email);

      if (hasUserWithEmail) {
        return res.status(403).json({
          errors: {
            msg: 'Já existe um usuário cadastrado com esse e-mail',
          },
        });
      }

      const salt = genSaltSync(10);
      const hash = hashSync(password, salt);
      const uuid = uuidv4();
      await create({ username, password: hash, email, uuid, user_type });

      res.status(200).json({
        msg: 'Usuário criado com sucesso',
      });
    } catch (error) {
      console.log(error);
      res.status(500).json({
        errors: {
          msg: 'Ocorreu um erro ao criar usuário',
        },
      });
    }
  }

  async login(req, res) {
    try {
      const { email, password } = req.body;

      const user = await findUserByEmail(email);

      if (!user) {
        return res.status(401).json({
          errors: {
            msg: 'Credenciais inválidas',
          },
        });
      }

      if (!compareSync(password, user.password)) {
        return res.status(401).json({
          errors: {
            msg: 'Credenciais inválidas',
          },
        });
      }

      const accessToken = jwt.sign(
        { uuid: user.uuid, username: user.username, user_type: user.user_type },
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
        errors: {
          msg: 'Ocorreu um erro ao realizar login',
        },
      });
    }
  }

  async getUsersCandidato(req, res) {
    try {
      const { uuidProva } = req.params;

      const { offset, limit, search } = req.query;

      const prova = await findProvaByUuid(uuidProva);

      if (!prova) {
        return res.status(404).json({
          errors: {
            msg: 'Não foram encontradas provas com o identificador informado',
          },
        });
      }

      const users = await findAllUsersCandidato(
        prova.prova_id,
        offset,
        limit,
        search
      );

      const resData = {
        users: users.users,
        total_users: parseInt(users.total_users.total_users),
      };

      res.status(200).json(resData);
    } catch (error) {
      console.log(error);
      res.status(500).json({
        errors: {
          msg: 'Ocorreu um erro ao listar participantes',
        },
      });
    }
  }
}

module.exports = new UserController();
