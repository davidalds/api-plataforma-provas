const express = require('express');
const userControllers = require('../controllers/userControllers');
const auth = require('../middlewares/auth');
const user = require('../middlewares/user');
const creator = require('../middlewares/creator');
const router = express.Router();
const createUserSchema = require('../middlewares/schemas/createUserSchema');

router.post('/user', userControllers.createUser);
router.post('/login', userControllers.login);
router.post('/register', createUserSchema, userControllers.createUser);
router.get(
  '/users/:uuidUser/:uuidProva',
  auth,
  user,
  creator,
  userControllers.getUsersCandidato
);

module.exports = router;
