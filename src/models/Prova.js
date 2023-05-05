const knex = require('../db/connection');

class Prova {
  async findProvas(user_id, filter_done) {
    try {
      const provas = await knex
        .select()
        .from('prova_users')
        .where({ user_id: user_id, done: filter_done })
        .join('prova', 'prova.prova_id', 'prova_users.prova_id');

      return provas;
    } catch (error) {
      console.log(error);
    }
  }

  findProva = async (uuid) => {
    try {
      const prova = await knex
        .select('prova_id', 'title')
        .from('prova')
        .where('uuid', uuid)
        .then((value) => value.shift());

      return prova;
    } catch (error) {
      console.log(error);
    }
  };

  async saveScore(score, prova_id, user_id) {
    try {
      await knex.transaction(async (trx) => {
        await trx.insert({ score, prova_id, user_id }).into('provascore');

        await trx
          .update({ done: true })
          .where({ prova_id: prova_id, user_id: user_id })
          .into('prova_users');
      });
    } catch (error) {
      console.log(error);
    }
  }

  findScore = async (uuid, user_id) => {
    try {
      const prova = await this.findProva(uuid);

      if (!prova) {
        return null;
      }

      const score = await knex
        .select('provascore_id', 'score')
        .from('provascore')
        .where({ prova_id: prova.prova_id, user_id })
        .then((data) => data.shift());

      return score;
    } catch (error) {
      console.log(error);
    }
  };
}

module.exports = new Prova();
