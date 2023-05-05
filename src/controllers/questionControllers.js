const { saveScore } = require('../models/Prova');
const { findQuestionWithOptions } = require('../models/Question');

class QuestionControllers {
  async questionAnswersVerify(req, res) {
    try {
      const { options, prova_id } = req.body;
      const { user_id } = req.params;

      const answersPoints = options.length
        ? await findQuestionWithOptions(prova_id).then((query) => {
            return query
              .filter((q) => {
                if (options.find((o) => q.option_id === o.option_id)) {
                  return q;
                }
              })
              .reduce((acc, q) => acc + q.peso, 0);
          })
        : 0;

      await saveScore(answersPoints, prova_id, user_id);
      res.status(200).json({ msg: `Pontuação na prova salva com sucesso` });
    } catch (error) {
      res.status(500).json({
        msg: {
          error: 'Ocorreu um erro ao verificar respostas da prova',
        },
      });
    }
  }
}

module.exports = new QuestionControllers();
