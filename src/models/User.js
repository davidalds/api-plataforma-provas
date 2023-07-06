const knex = require('../db/connection');

class User {
  async create(userData) {
    try {
      const { username, password, email, uuid, user_type } = userData;
      const newUser = await knex
        .insert({ username, password, email, uuid, user_type })
        .into('users');

      return newUser;
    } catch (error) {
      throw error;
    }
  }

  async findUserById(user_id) {
    try {
      const user = await knex
        .select('username', 'email')
        .from('users')
        .where({ user_id });

      if (user) {
        return user[0];
      }

      return null;
    } catch (error) {
      throw error;
    }
  }

  async findUserByEmail(userEmail) {
    try {
      const user = await knex.select().from('users').where('email', userEmail);
      if (user) {
        return user[0];
      }
      return null;
    } catch (error) {
      throw error;
    }
  }
  async findUserByUuid(uuidUser) {
    try {
      const user = await knex
        .select('user_id', 'user_type')
        .from('users')
        .where({ uuid: uuidUser })
        .then((value) => value.shift());

      return user;
    } catch (error) {
      throw error;
    }
  }

  async findAllUsersCandidato(prova_id, offset, limit, search) {
    try {
      const prova = await knex
        .select('prova_users.user_id')
        .where({ 'prova.prova_id': prova_id })
        .from('prova')
        .join('prova_users', 'prova_users.prova_id', 'prova.prova_id');

      const users_id = prova.map((p) => p.user_id);

      const total_users = await knex
        .sum('users as total_users')
        .from(function () {
          this.select(knex.raw('count(*) as users'))
            .from('users')
            .where({ user_type: 2 })
            .andWhereLike('email', search ? search : '%')
            .groupBy('user_id')
            .havingNotIn('user_id', users_id)
            .as('users_table');
        })
        .then((data) => data.shift()); // Filtra para usuarios que já não estejam vinculados a prova

      const users = await knex
        .select('username', 'email', 'uuid')
        .from('users')
        .where({ user_type: 2 })
        .andWhereLike('email', search ? search : '%')
        .groupBy('user_id')
        .havingNotIn('user_id', users_id) // Filtra para usuarios que já não estejam vinculados a prova
        .offset(offset ? offset : 0)
        .limit(limit ? limit : 10);

      return { users, total_users };
    } catch (error) {
      throw error;
    }
  }
}

module.exports = new User();
