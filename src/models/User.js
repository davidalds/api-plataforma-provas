const knex = require('../db/connection');

class User {
  async create(userData) {
    try {
      const { username, password, email, uuid } = userData;
      const newUser = await knex
        .insert({ username, password, email, uuid })
        .into('users');
      return newUser;
    } catch (error) {
      console.log(error);
    }
  }
  async getUserByEmail(userEmail) {
    try {
      const user = await knex.select().from('users').where('email', userEmail);
      if (user) {
        return user[0];
      }
      return null;
    } catch (error) {
      console.log(error);
    }
  }
}

module.exports = new User();
