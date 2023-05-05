const knex = require('../db/connection');
const { findProvas, findProva, findScore } = require('../models/Prova');

class ProvaControllers {
  async getProvas(req, res) {
    try {
      const { user_id } = req.params;
      const done_status = req.query.done || false;
      const provas = await findProvas(user_id, done_status);
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
      const { uuid } = req.params;

      const prova = await findProva(uuid);

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
                  .map(({ option_id, option_title, question_id }) => ({
                    option_question_id: question_id,
                    option_id,
                    option_title,
                  })),
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

  async getScore(req, res) {
    try {
      const { user_id, uuid } = req.params;

      const score = await findScore(uuid, user_id);

      if (!score) {
        return res.status(404).json({
          errors: {
            msg: 'Não foram encontradas provas com o identificador informado',
          },
        });
      }

      res.status(200).json({
        score,
      });
    } catch (error) {
      console.log(error);
      res.status(500).json({
        msg: {
          error: 'Ocorreu um erro ao obter pontuação da prova',
        },
      });
    }
  }
}

module.exports = new ProvaControllers();
