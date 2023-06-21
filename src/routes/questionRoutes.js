const express = require('express');
const router = express.Router();
const questionControllers = require('../controllers/questionControllers');
const auth = require('../middlewares/auth');
const user = require('../middlewares/user');
const questionAnswersSchema = require('../middlewares/schemas/questionAnswersSchema');

router.get('/questions/:uuidProva', auth, questionControllers.getQuestions);

router.get(
  '/questions/feedback/:uuidProva/:uuidUser',
  auth,
  user,
  questionControllers.getQuestionsFeedback
);

router.post(
  '/questionverify/:uuidUser',
  auth,
  user,
  questionAnswersSchema,
  questionControllers.questionAnswersVerify
);

module.exports = router;
