const {
  findProvas,
  findProvaByUuid,
  findScore,
  findQuestionByProva,
  createProva,
  createProvaUsers,
  findProvasUser,
  findUsersByProva,
  deleteProvaUsers,
} = require('../models/Prova');
const {
  findQuestionWithOptions,
  findQuestionsWithPeso,
} = require('../models/Question');
const { v4: uuidv4 } = require('uuid');
const { findUserByUuid, findUserById } = require('../models/User');

class ProvaControllers {
  async getProvas(req, res) {
    try {
      const { user_id, user_type } = req.params;
      const done_status = req.query.done || false;
      const provas = await findProvas(user_id, done_status, user_type);
      res.status(200).json({ provas });
    } catch (err) {
      console.log(err);
      res.status(500).json({
        msg: {
          error: 'Ocorreu um erro ao obter provas',
        },
      });
    }
  }

  async getProva(req, res) {
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

      const question = await findQuestionsWithPeso(prova.prova_id);

      if (!question) {
        return res.status(404).json({
          errors: {
            msg: 'Não foram encontrados informações das questões com o identificador da prova informado',
          },
        });
      }

      const userObj = {
        username: '',
        email: '',
      };

      const user = await findUserById(prova.creator);

      if (user) {
        userObj.username = user.username;
        userObj.email = user.email;
      }

      res.status(200).json({
        prova: {
          ...prova,
          total_score: question.total_score,
          total_question: parseInt(question.total_question),
          creator: {
            ...userObj,
          },
        },
      });
    } catch (error) {
      console.log(error);
      res.status(500).json({
        msg: {
          error: 'Ocorreu um erro ao obter informações da prova',
        },
      });
    }
  }

  async getScore(req, res) {
    try {
      const { user_id, uuid } = req.params;

      const prova = await findProvaByUuid(uuid);

      if (!prova) {
        return res.status(404).json({
          errors: {
            msg: 'Não foram encontradas provas com o identificador informado',
          },
        });
      }

      const questions = await findQuestionByProva(prova.prova_id);

      const score = await findScore(prova.prova_id, user_id);

      const questions_answers = await findQuestionWithOptions(
        prova.prova_id
      ).then((query) =>
        query.map((option) => {
          return {
            option_id: option.option_id,
            option_letter: option.option_letter,
          };
        })
      );

      const prova_score = questions.length
        ? questions.reduce((acc, question) => acc + question.peso, 0)
        : 0;

      res.status(200).json({
        prova_title: prova.title,
        prova_score,
        score,
        total_questions: questions.length,
        questions_answers,
      });
    } catch (error) {
      console.log(error);
      res.status(500).json({
        msg: {
          error: 'Ocorreu um erro ao obter dados da prova',
        },
      });
    }
  }

  newProva = async (req, res) => {
    try {
      const { user_id } = req.params;
      const { title, description, initial_date, end_date, questions } =
        req.body;

      const uuid = uuidv4();

      await createProva(
        {
          title,
          description,
          initial_date,
          end_date,
          uuid,
          creator: user_id,
        },
        questions
      );

      res.status(200).json({ msg: 'Prova cadastrada com sucesso!' });
    } catch (error) {
      console.log(error);
      res.status(500).json({
        msg: {
          error: 'Ocorreu um erro ao criar prova',
        },
      });
    }
  };

  async linkProvaUser(req, res) {
    try {
      const { link_users_uuid, link_prova_uuid } = req.body;

      const users = await Promise.all(
        link_users_uuid.map(async (uuidUser) => await findUserByUuid(uuidUser))
      );

      const prova = await findProvaByUuid(link_prova_uuid);

      if (!prova) {
        return res.status(404).json({
          errors: {
            msg: 'Não foram encontradas provas para serem vinculadas a usuários',
          },
        });
      }

      if (!users.length || users.some((user) => user === undefined)) {
        return res.status(404).json({
          errors: {
            msg: 'Um dos usuários informados não foi encontrado',
          },
        });
      }

      if (users.some(({ user_type }) => user_type !== 2)) {
        return res.status(403).json({
          errors: {
            msg: 'Os usuários a serem vinculados devem ser do tipo candidato',
          },
        });
      }

      const hasProvaUsers = await Promise.all(
        users.map(
          async ({ user_id }) => await findProvasUser(prova.prova_id, user_id)
        )
      );

      if (hasProvaUsers.some((user) => user !== undefined)) {
        return res.status(403).json({
          errors: {
            msg: 'A prova já está vinculada a um dos usuários informados',
          },
        });
      }

      const users_to_be_included = users.map(({ user_id }) => ({
        prova_id: prova.prova_id,
        user_id,
        done: false,
      }));

      await createProvaUsers(users_to_be_included);

      res
        .status(200)
        .json({ msg: 'Usuário(s) vinculado(s) a prova com sucesso' });
    } catch (error) {
      console.log(error);
      res.status(500).json({
        msg: {
          error: 'Ocorreu um erro ao vincular usuários a prova',
        },
      });
    }
  }

  async deslinkProvaUser(req, res) {
    try {
      const { uuidProva, uuidDeslinkUser } = req.params;

      const prova = await findProvaByUuid(uuidProva);

      const user = await findUserByUuid(uuidDeslinkUser);

      if (!prova) {
        return res.status(404).json({
          errors: {
            msg: 'Não foram encontradas provas para serem desvinculadas',
          },
        });
      }

      if (!user) {
        return res.status(404).json({
          errors: {
            msg: 'O usuário não foi encontrado',
          },
        });
      }

      await deleteProvaUsers(prova.prova_id, user.user_id);

      res.status(200).json({
        msg: 'Candidato desvinculado da prova com sucesso',
      });
    } catch (error) {
      console.log(error);
      res.status(500).json({
        msg: {
          error: 'Ocorreu um erro ao desvincular usuário da prova',
        },
      });
    }
  }

  async getUsersByProva(req, res) {
    try {
      const { uuid } = req.params;

      const prova = await findProvaByUuid(uuid);

      if (!prova) {
        return res.status(404).json({
          errors: {
            msg: 'Não foram encontradas provas com o identificador informado',
          },
        });
      }

      const users = await findUsersByProva(prova.prova_id);

      if (!users) {
        return res.status(404).json({
          errors: {
            msg: 'Não foram encontrados candidatos vinculados a prova',
          },
        });
      }

      res.status(200).json({ users });
    } catch (error) {
      console.log(error);
      res.status(500).json({
        msg: {
          error: 'Ocorreu um erro ao listar candidatos da prova',
        },
      });
    }
  }
}

module.exports = new ProvaControllers();
