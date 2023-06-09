const knex = require('../db/connection');

class Question {
  async findQuestion(provaId) {
    try {
      const question = await knex
        .select()
        .from('question')
        .where('prova_id', provaId);
      return question;
    } catch (error) {
      throw error;
    }
  }

  async findQuestionById(question_id) {
    try {
      const question = await knex
        .select()
        .from('question')
        .where({ question_id });

      if (question.length) {
        return question[0];
      }
      return null;
    } catch (error) {
      throw error;
    }
  }

  async findQuestionWithOptions(provaId) {
    try {
      const questionAndOptions = await knex
        .select(
          'question.question_id',
          'question.peso',
          'option.option_letter',
          'option.option_id',
          'option.question_id',
          'option.iscorrect'
        )
        .from('question')
        .join('option', 'option.question_id', 'question.question_id')
        .where('prova_id', provaId)
        .andWhere('option.iscorrect', true);

      return questionAndOptions;
    } catch (error) {
      throw error;
    }
  }

  async findQuestionsWithPeso(prova_id) {
    try {
      const questions = await knex
        .select()
        .sum('peso as total_score')
        .count('* as total_question')
        .from('question')
        .where({ prova_id });

      return questions[0];
    } catch (error) {
      throw error;
    }
  }

  async findQuestions(prova_id, is_feedback = false) {
    try {
      const questions = await knex
        .select([
          'question.*',
          'option.title as option_title',
          'option.option_id',
          'option.option_letter',
          'option.iscorrect',
        ])
        .from('question')
        .where('prova_id', prova_id)
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
                      iscorrect,
                    }) =>
                      is_feedback
                        ? {
                            option_question_id: question_id,
                            option_id,
                            option_title,
                            option_letter,
                            iscorrect,
                          }
                        : {
                            option_question_id: question_id,
                            option_id,
                            option_title,
                            option_letter,
                          }
                  ),
              };
              arr.push(obj);
            }
          });
          return arr;
        });

      return questions;
    } catch (error) {
      throw error;
    }
  }

  async saveQuestionsAnswers(questions_answered) {
    try {
      await knex.insert(questions_answered).into('questions_answers');
    } catch (error) {
      throw error;
    }
  }

  async findQuestionAnswer(user_id, question_id) {
    try {
      const question_answer = knex
        .select()
        .from('questions_answers')
        .where({ user_id, question_id })
        .then((value) => value.shift());
      return question_answer;
    } catch (error) {
      throw error;
    }
  }

  async putQuestion(prova_id, { question_id, title, peso, options }) {
    try {
      await knex.transaction(async (trx) => {
        const q = await trx
          .update({ title, peso }, ['question_id'])
          .into('question')
          .where({ prova_id, question_id });

        await Promise.all(
          options.map(
            async ({ option_id, option_title, iscorrect }) =>
              await trx
                .update({ option_id, title: option_title, iscorrect })
                .into('option')
                .where({ option_id, question_id: q[0].question_id })
          )
        );

        return;
      });
    } catch (error) {
      throw error;
    }
  }

  async postQuestion(prova_id, { title, peso, options }) {
    try {
      await knex.transaction(async (trx) => {
        const q = await trx
          .insert({ title, prova_id, peso }, ['question_id'])
          .into('question');

        await Promise.all(
          options.map(
            async ({ option_letter, option_title, iscorrect }) =>
              await trx
                .insert({
                  option_letter,
                  title: option_title,
                  iscorrect,
                  question_id: q[0].question_id,
                })
                .into('option')
          )
        );

        return;
      });
    } catch (error) {
      throw error;
    }
  }

  async deleteQuestion(question_id) {
    try {
      await knex.del().from('question').where({ question_id });
    } catch (error) {
      throw error;
    }
  }
}

module.exports = new Question();
