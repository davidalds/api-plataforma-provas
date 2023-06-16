const express = require('express');
const userControllers = require('../controllers/userControllers');
const auth = require('../middlewares/auth');
const user = require('../middlewares/user');
const creator = require('../middlewares/creator');
const router = express.Router();

router.post('/user', userControllers.createUser);
router.post('/login', userControllers.login);
router.get(
  '/users/:uuidUser/:uuidProva',
  auth,
  user,
  creator,
  userControllers.getUsersCandidato
);

module.exports = router;
