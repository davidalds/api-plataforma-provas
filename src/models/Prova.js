const knex = require('../db/connection');

class Prova {
  async findProvas(user_id, filter_done, user_type, published) {
    try {
      let provas;
      if (user_type === 1) {
        provas = await knex
          .select()
          .from('prova')
          .where({ creator: user_id, published });
      } else if (user_type === 2) {
        provas = await knex
          .select()
          .from('prova_users')
          .modify((queryBuilder) => {
            if (!filter_done) {
              queryBuilder.where({
                user_id,
                published: true,
                result: false,
              });
            } else {
              queryBuilder.where({
                user_id,
                published: true,
              });
            }
          })
          .join('prova', 'prova.prova_id', 'prova_users.prova_id');
      }
      return provas;
    } catch (error) {
      throw error;
    }
  }

  findProvaById = async (prova_id) => {
    try {
      const prova = await knex.select().from('prova').where({ prova_id });
      return prova[0];
    } catch (error) {
      throw error;
    }
  };

  findProvaByUuid = async (uuid) => {
    try {
      const prova = await knex
        .select(
          'prova_id',
          'title',
          'description',
          'initial_date',
          'end_date',
          'creator',
          'published',
          'timer',
          'result'
        )
        .from('prova')
        .where({ uuid })
        .then((value) => value.shift());

      return prova;
    } catch (error) {
      throw error;
    }
  };

  async saveScore(score, prova_id, user_id, correct_questions) {
    try {
      await knex.transaction(async (trx) => {
        await trx
          .insert({ score, prova_id, user_id, correct_questions })
          .into('provascore');

        await trx
          .update({ done: true })
          .where({ prova_id: prova_id, user_id: user_id })
          .into('prova_users');
      });
    } catch (error) {
      throw error;
    }
  }

  async updateProvaDone(prova_id, user_id) {
    try {
      await knex
        .update({ done: true })
        .where({ prova_id, user_id })
        .into('prova_users');
    } catch (error) {
      throw error;
    }
  }

  findScore = async (prova_id, user_id) => {
    try {
      const score = await knex
        .select('provascore_id', 'score', 'correct_questions')
        .from('provascore')
        .where({ prova_id, user_id })
        .then((data) => data.shift());

      return score;
    } catch (error) {
      throw error;
    }
  };

  findQuestionByProva = async (prova_id) => {
    try {
      const questions = await knex
        .select('question_id', 'peso')
        .from('question')
        .where({ prova_id });

      return questions;
    } catch (error) {
      throw error;
    }
  };

  async createProva(provaData, questionData) {
    try {
      await knex.transaction(async (trx) => {
        const prova = await trx.insert(provaData, ['prova_id']).into('prova');

        const insertQuestions = questionData.map(({ title, peso }) => ({
          title,
          peso,
          prova_id: prova[0].prova_id,
        }));

        const questions = await trx
          .insert(insertQuestions, ['question_id'])
          .into('question');

        const insertOptions = questionData
          .map(({ options }, index) =>
            options.map((option) => ({
              ...option,
              question_id: questions[index].question_id,
            }))
          )
          .flat();

        await trx.insert(insertOptions).into('option');
      });
    } catch (error) {
      throw error;
    }
  }

  async findProvasUser(prova_id, user_id) {
    try {
      const provasUser = await knex
        .select()
        .from('prova_users')
        .where({ prova_id, user_id })
        .then((value) => value.shift());

      return provasUser;
    } catch (error) {
      throw error;
    }
  }

  async createProvaUsers(users_arr) {
    try {
      await knex.insert(users_arr).into('prova_users');
    } catch (error) {
      throw error;
    }
  }

  async deleteProvaUsers(prova_id, user_id) {
    try {
      await knex.del().where({ prova_id, user_id }).from('prova_users');
    } catch (error) {
      throw error;
    }
  }

  async putProva(prova_id, prova_data) {
    try {
      await knex.update(prova_data).into('prova').where({ prova_id });
    } catch (error) {
      throw error;
    }
  }

  async findUsersByProva(prova_id) {
    try {
      const users = await knex
        .select(
          'users.username',
          'users.email',
          'users.uuid',
          'prova_users.done'
        )
        .from('prova_users')
        .where({
          prova_id,
        })
        .join('users', 'prova_users.user_id', 'users.user_id');

      return users;
    } catch (error) {
      throw error;
    }
  }

  async updatePublishedStatus(prova_id, published) {
    try {
      await knex.update({ published }).into('prova').where({ prova_id });
    } catch (error) {
      throw error;
    }
  }
}

module.exports = new Prova();
