const express = require('express');
const router = express.Router();
const questionControllers = require('../controllers/questionControllers');
const auth = require('../middlewares/auth');
const user = require('../middlewares/user');

router.get('/questions/:uuidProva', auth, questionControllers.getQuestions);

router.post(
  '/questionverify/:uuidUser',
  auth,
  user,
  questionControllers.questionAnswersVerify
);

module.exports = router;
