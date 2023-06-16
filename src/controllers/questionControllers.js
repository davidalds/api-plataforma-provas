const knex = require('../db/connection');
const { saveScore, findScore, findProvaByUuid } = require('../models/Prova');
const { findQuestionWithOptions } = require('../models/Question');

class QuestionControllers {
  async questionAnswersVerify(req, res) {
    try {
      const { options, prova_id } = req.body;
      const { user_id } = req.params;

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

      const hasProvaScore = await findScore(prova_id, user_id);

      if (hasProvaScore) {
        return res.status(403).json({
          error: {
            msg: 'Já existe uma resposta registrada para a prova',
          },
        });
      }

      await saveScore(answersPoints, prova_id, user_id, correct_questions);
      res.status(200).json({ msg: `Pontuação na prova salva com sucesso` });
    } catch (error) {
      console.log(error);
      res.status(500).json({
        msg: {
          error: 'Ocorreu um erro ao verificar respostas da prova',
        },
      });
    }
  }

  async getQuestions(req, res) {
    try {
      const { uuidProva } = req.params;

      const prova = await findProvaByUuid(uuidProva);

      if (!prova) {
        return res.status(404).json({
          msg: {
            error: 'Não foram encontradas provas com o identificador informado',
          },
        });
      }

      const questions = await knex
        .select([
          'question.*',
          'option.title as option_title',
          'option.option_id',
          'option.option_letter',
        ])
        .from('question')
        .where('prova_id', prova.prova_id)
        .join('option', 'option.question_id', 'question.question_id')
        .then((query) => {
          const arr = [];
          query.forEach((question) => {
            if (
              arr.length === 0 ||
              !arr.find((o) => o.question_id === question.question_id)
            ) {
              const obj = {
                question_id: question.question_id,
                question_title: question.title,
                peso: question.peso,
                options: query
                  .filter((q) => q.question_id === question.question_id)
                  .map(
                    ({
                      option_id,
                      option_title,
                      question_id,
                      option_letter,
                    }) => ({
                      option_question_id: question_id,
                      option_id,
                      option_title,
                      option_letter,
                    })
                  ),
              };
              arr.push(obj);
            }
          });
          return arr;
        });

      res.status(200).json({
        prova_id: prova.prova_id,
        prova_title: prova.title,
        questions,
      });
    } catch (error) {
      console.log(error);
      res.status(500).json({
        msg: {
          error: 'Ocorreu um erro ao obter questões da prova',
        },
      });
    }
  }
}

module.exports = new QuestionControllers();
