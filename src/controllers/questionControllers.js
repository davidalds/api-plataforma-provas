const knex = require('../db/connection');
const {
  saveScore,
  findProvaByUuid,
  findProvasUser,
  findScore,
  findProvaById,
} = require('../models/Prova');
const {
  findQuestionWithOptions,
  findQuestions,
  saveQuestionsAnswers,
  findQuestionAnswer,
  putQuestion,
  postQuestion,
  deleteQuestion,
  findQuestionById,
} = require('../models/Question');

const { validationResult } = require('express-validator');

class QuestionControllers {
  async questionAnswersVerify(req, res) {
    try {
      const errors = validationResult(req);

      if (!errors.isEmpty()) {
        return res.status(400).json(errors.array());
      }

      const { user_id } = req.params;
      const { options, prova_id } = req.body;

      const prova = await findProvaById(prova_id);

      if (!prova) {
        return res.status(404).json({
          errors: {
            msg: 'Prova não encontrada',
          },
        });
      }

      if (prova.result) {
        return res.status(403).json({
          errors: {
            msg: 'Não é possível responder a prova, pois o resultado já foi liberado',
          },
        });
      }

      let correct_questions = 0;
      const answersPoints = options.length
        ? await findQuestionWithOptions(prova_id).then((query) => {
            return query
              .filter((q) => {
                if (options.find((o) => q.option_id === o.option_id)) {
                  correct_questions++;
                  return q;
                }
              })
              .reduce((acc, q) => acc + q.peso, 0);
          })
        : 0;

      const questions_answered = options.map((op) => ({
        user_id: user_id,
        question_id: op.option_question_id,
        option_id: op.option_id,
      }));

      const hasScore = await findScore(prova_id, user_id);

      if (hasScore) {
        return res.status(403).json({
          error: {
            msg: 'O usuário já respondeu à prova',
          },
        });
      }

      await saveScore(answersPoints, prova_id, user_id, correct_questions);
      await saveQuestionsAnswers(questions_answered);
      res.status(201).json({ msg: `Pontuação na prova salva com sucesso` });
    } catch (error) {
      console.log(error);
      res.status(500).json({
        errors: {
          msg: 'Ocorreu um erro ao verificar respostas da prova',
        },
      });
    }
  }

  async getQuestions(req, res) {
    try {
      const { user_id, user_type, uuidProva } = req.params;
      const { isFeedback } = req.query;

      const prova = await findProvaByUuid(uuidProva);

      if (!prova) {
        return res.status(404).json({
          errors: {
            msg: 'Não foram encontradas provas com o identificador informado',
          },
        });
      }

      if (user_type === 2) {
        const isProvaDone = await findProvasUser(prova.prova_id, user_id);

        if (!compareIfProvaDateIsBigger(prova.end_date, prova.timer)) {
          return res.status(403).json({
            errors: {
              msg: 'A data de aplicação da prova expirou',
            },
          });
        }

        if (prova.result) {
          return res.status(403).json({
            errors: {
              msg: 'O resultado da prova já foi liberado',
            },
          });
        }

        if (isProvaDone && isProvaDone.done) {
          return res.status(403).json({
            errors: {
              msg: 'O usuário já acessou a prova',
            },
          });
        }
        const isUserLinkedToProva = await findProvasUser(
          prova.prova_id,
          user_id
        );

        if (!isUserLinkedToProva) {
          return res.status(401).json({
            errors: {
              msg: 'Você não possui permissão para ver o questionário da prova',
            },
          });
        }
      }

      const questions = await findQuestions(
        prova.prova_id,
        isFeedback ? isFeedback : false
      );

      res.status(200).json({
        prova_id: prova.prova_id,
        prova_title: prova.title,
        timer: prova.timer,
        questions,
      });
    } catch (error) {
      console.log(error);
      res.status(500).json({
        errors: {
          msg: 'Ocorreu um erro ao obter questões da prova',
        },
      });
    }
  }

  async getQuestionsFeedback(req, res) {
    try {
      const { uuidProva } = req.params;
      const { user_id } = req.params;

      const prova = await findProvaByUuid(uuidProva);

      if (!prova) {
        return res.status(404).json({
          errors: {
            msg: 'Não foram encontradas provas com o identificador informado',
          },
        });
      }

      const questionsData = await findQuestions(prova.prova_id, true);

      const questions = questionsData.length
        ? await Promise.all(
            questionsData.map(async (q) => {
              const option_answered = await findQuestionAnswer(
                user_id,
                q.question_id
              );

              return {
                ...q,
                option_answered_id: option_answered
                  ? option_answered.option_id
                  : 0,
              };
            })
          )
        : [];

      res.status(200).json({
        prova_id: prova.prova_id,
        prova_title: prova.title,
        questions,
      });
    } catch (error) {
      console.log(error);
      res.status(500).json({
        errors: {
          msg: 'Ocorreu um erro ao obter feedback de questões',
        },
      });
    }
  }

  async updateQuestion(req, res) {
    try {
      const errors = validationResult(req);

      if (!errors.isEmpty()) {
        return res.status(400).json(errors.array());
      }

      const { questions } = req.body;

      const { uuidProva } = req.params;

      const prova = await findProvaByUuid(uuidProva);

      if (!prova) {
        return res.status(404).json({
          errors: {
            msg: 'Não foram encontradas provas com o identificador informado',
          },
        });
      }

      if (prova.result) {
        return res.status(403).json({
          errors: {
            msg: 'Não é possível alterar questões após a liberação do resultado da prova',
          },
        });
      }

      await Promise.all(
        questions.map(
          async ({ question_id, question_title, peso, options }) => {
            if (question_id !== undefined) {
              return await putQuestion(prova.prova_id, {
                question_id,
                title: question_title,
                peso,
                options,
              });
            }

            return await postQuestion(prova.prova_id, {
              title: question_title,
              peso,
              options,
            });
          }
        )
      );

      res.status(201).json({
        msg: 'Questões atualizadas com sucesso',
      });
    } catch (error) {
      console.log(error);
      res.status(500).json({
        errors: {
          msg: 'Ocorreu um erro ao editar questões',
        },
      });
    }
  }

  async removeQuestion(req, res) {
    try {
      const { questionId } = req.params;

      const question = await findQuestionById(questionId);

      if (!question) {
        return res.statu(404).json({
          errors: {
            msg: 'Não foram encontradas questões com o identificador informado',
          },
        });
      }

      const prova = await findProvaById(question.prova_id);

      if (prova.result) {
        return res.status(403).json({
          errors: {
            msg: 'Não é possível excluir questões após o resultado da prova ser liberado',
          },
        });
      }

      await deleteQuestion(question.question_id);

      res.status(200).json({
        msg: 'Questão deletada com sucesso',
      });
    } catch (error) {
      console.log(error);
      res.status(500).json({
        errors: {
          msg: 'Ocorreu um erro ao deletar questão',
        },
      });
    }
  }
}

module.exports = new QuestionControllers();
