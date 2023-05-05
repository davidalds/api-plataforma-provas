const knex = require('../db/connection');

class Question {
  async findQuestion(provaId) {
    const question = await knex
      .select()
      .from('question')
      .where('prova_id', provaId);
    return question;
  }

  async findQuestionWithOptions(provaId) {
    try {
      const questionAndOptions = await knex
        .select(
          'question.peso',
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
      console.log(error);
    }
  }
}

module.exports = new Question();
