const { saveScore, findScore, findProvaByUuid } = require('../models/Prova');
const {
  findQuestionWithOptions,
  findQuestions,
} = require('../models/Question');

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

      const questions = await findQuestions(prova.prova_id);

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

  async getQuestionsFeedback(req, res) {
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

      const questions = await findQuestions(prova.prova_id, true);

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
}

module.exports = new QuestionControllers();
