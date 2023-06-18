const express = require('express');
const router = express.Router();
const questionControllers = require('../controllers/questionControllers');
const auth = require('../middlewares/auth');
const user = require('../middlewares/user');
const creator = require('../middlewares/creator');

router.get('/questions/:uuidProva', auth, questionControllers.getQuestions);

router.get(
  '/questions/feedback/:uuidProva/:uuidUser',
  auth,
  user,
  creator,
  questionControllers.getQuestionsFeedback
);

router.post(
  '/questionverify/:uuidUser',
  auth,
  user,
  questionControllers.questionAnswersVerify
);

module.exports = router;
