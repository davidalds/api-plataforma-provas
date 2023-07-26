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
  putProva,
  updatePublishedStatus,
  updateProvaDone,
} = require('../models/Prova');
const {
  findQuestionWithOptions,
  findQuestionsWithPeso,
} = require('../models/Question');
const { v4: uuidv4 } = require('uuid');
const { findUserByUuid, findUserById } = require('../models/User');
const compareIfProvaDateIsBigger = require('../utils/compareDates');
const { validationResult } = require('express-validator');

class ProvaControllers {
  async getProvas(req, res) {
    try {
      const { user_id, user_type } = req.params;
      const done_status = req.query.done || false;
      const isPublished = req.query.published || false;

      const resProvas = await findProvas(
        user_id,
        done_status,
        user_type,
        isPublished
      );

      let provas = resProvas;

      if (user_type === 2) {
        if (done_status === false) {
          //Local suas provas: somente mostra provas que estão em data de aplicação
          provas = provas.filter(
            ({ end_date, timer }) =>
              compareIfProvaDateIsBigger(end_date, timer) === true
          );
        } else {
          // Local provas finalizadas: se o usuário tiver feito a prova ou a data final da prova já ter passado
          provas = provas.filter(
            ({ done, end_date, timer }) =>
              done === true ||
              compareIfProvaDateIsBigger(end_date, timer) === false
          );
        }
      }

      res.status(200).json({ provas });
    } catch (err) {
      console.log(err);
      res.status(500).json({
        errors: {
          msg: 'Ocorreu um erro ao obter provas',
        },
      });
    }
  }

  async getProva(req, res) {
    try {
      const { user_id, user_type, prova } = req.params;

      if (user_type === 2) {
        const isUserLinkedToProva = await findProvasUser(
          prova.prova_id,
          user_id
        );

        if (!isUserLinkedToProva) {
          return res.status(401).json({
            errors: {
              msg: 'Você não possui permissão para ver informações da prova',
            },
          });
        }

        if (!compareIfProvaDateIsBigger(prova.end_date, prova.timer)) {
          return res.status(403).json({
            errors: {
              msg: 'A data de aplicação da prova expirou',
            },
          });
        }
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

      let provaRes = {
        ...prova,
        total_score: question.total_score,
        total_question: parseInt(question.total_question),
        creator: {
          ...userObj,
        },
      };

      if (!compareIfProvaDateIsBigger(prova.end_date, prova.timer)) {
        provaRes['releaseResult'] = true;
      }

      res.status(200).json({
        prova: { ...provaRes },
      });
    } catch (error) {
      console.log(error);
      res.status(500).json({
        errors: {
          msg: 'Ocorreu um erro ao obter informações da prova',
        },
      });
    }
  }

  async getScore(req, res) {
    try {
      const { user_id, prova } = req.params;

      if (!prova.result) {
        return res.status(403).json({
          errors: {
            msg: 'O resultado da prova ainda não foi liberado',
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
        errors: {
          msg: 'Ocorreu um erro ao obter dados da prova',
        },
      });
    }
  }

  async releaseProvaResult(req, res) {
    try {
      const { prova, user_id } = req.params;

      if (prova.creator !== user_id) {
        return res.status(401).json({
          errors: {
            msg: 'Você não possui permissão para liberar o resultado',
          },
        });
      }

      if (compareIfProvaDateIsBigger(prova.end_date, prova.timer)) {
        return res.status(403).json({
          errors: {
            msg: 'O resultado da prova não pode ser liberado pois ela ainda está na data de aplicação',
          },
        });
      }

      await putProva(prova.prova_id, { result: true });

      res.status(200).json({
        msg: 'O resultado da prova foi liberado com sucesso',
      });
    } catch (error) {
      console.log(error);
      res.status(500).json({
        errors: {
          msg: 'Ocorreu um erro ao liberar resultado da prova',
        },
      });
    }
  }

  newProva = async (req, res) => {
    try {
      const { user_id } = req.params;
      const { title, description, timer, initial_date, end_date, questions } =
        req.body;

      const errors = validationResult(req);

      if (!errors.isEmpty()) {
        return res.status(400).json({
          errors: {
            msg: errors.array(),
          },
        });
      }

      const uuid = uuidv4();

      await createProva(
        {
          title,
          description,
          initial_date,
          end_date,
          uuid,
          creator: user_id,
          timer,
        },
        questions
      );

      res.status(201).json({ msg: 'Prova cadastrada com sucesso!' });
    } catch (error) {
      console.log(error);
      res.status(500).json({
        errors: {
          msg: 'Ocorreu um erro ao criar prova',
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

      if (prova.result) {
        return res.status(403).json({
          errors: {
            msg: 'Não é possível vincular candidatos a uma prova em que o resultado já foi liberado',
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
        .status(201)
        .json({ msg: 'Usuário(s) vinculado(s) a prova com sucesso' });
    } catch (error) {
      console.log(error);
      res.status(500).json({
        errors: {
          msg: 'Ocorreu um erro ao vincular usuários a prova',
        },
      });
    }
  }

  async deslinkProvaUser(req, res) {
    try {
      const { prova, uuidDeslinkUser } = req.params;
      const user = await findUserByUuid(uuidDeslinkUser);

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
        errors: {
          msg: 'Ocorreu um erro ao desvincular usuário da prova',
        },
      });
    }
  }

  async getUsersByProva(req, res) {
    try {
      const { prova } = req.params;

      const users = await findUsersByProva(prova.prova_id);

      res.status(200).json({ users, totalLinkedUsers: users.length });
    } catch (error) {
      console.log(error);
      res.status(500).json({
        errors: {
          msg: 'Ocorreu um erro ao listar candidatos da prova',
        },
      });
    }
  }

  async updateProva(req, res) {
    try {
      const { prova } = req.params;

      const errors = validationResult(req);

      if (!errors.isEmpty()) {
        return res.status(400).json(errors.array());
      }

      const { title, description, timer, initial_date, end_date } = req.body;

      if (prova.result) {
        return res.status(403).json({
          errors: {
            msg: 'Não é possível editar a prova após o resultado ser liberado',
          },
        });
      }

      await putProva(prova.prova_id, {
        title,
        description,
        initial_date,
        end_date,
        timer,
      });

      res.status(200).json({
        msg: 'Informações da prova editadas com sucesso',
      });
    } catch (error) {
      console.log(error);
      res.status(500).json({
        errors: {
          msg: 'Ocorreu um erro ao editar informações da prova',
        },
      });
    }
  }

  async publishProva(req, res) {
    try {
      const { prova } = req.params;

      await updatePublishedStatus(prova.prova_id, true);

      res.status(200).json({
        msg: 'Prova publicada com sucesso',
      });
    } catch (error) {
      console.log(error);
      res.status(500).json({
        errors: {
          msg: 'Ocorreu um erro ao publicar prova',
        },
      });
    }
  }

  async unpublishProva(req, res) {
    try {
      const { prova } = req.params;

      await updatePublishedStatus(prova.prova_id, false);

      res.status(200).json({
        msg: 'Prova publicada com sucesso',
      });
    } catch (error) {
      console.log(error);
      res.status(500).json({
        errors: {
          errors: 'Ocorreu um erro ao despublicar prova',
        },
      });
    }
  }

  async markProvaDone(req, res) {
    try {
      const { user_id, prova } = req.params;

      await updateProvaDone(prova.prova_id, user_id);

      res.status(200).json({
        msg: 'Confirmação da realização da prova com sucesso',
      });
    } catch (error) {
      console.log(error);
      res.status(500).json({
        errors: {
          msg: 'Ocorreu um erro ao confirmar realização da prova',
        },
      });
    }
  }
}

module.exports = new ProvaControllers();
