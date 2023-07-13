const express = require('express');
const router = express.Router();
const questionControllers = require('../controllers/questionControllers');
const auth = require('../middlewares/auth');
const user = require('../middlewares/user');
const questionAnswersSchema = require('../middlewares/schemas/questionAnswersSchema');
const creator = require('../middlewares/creator');

router.get(
  '/questions/:uuidUser/:uuidProva',
  auth,
  user,
  questionControllers.getQuestions
);

router.put(
  '/questions/:uuidUser/:uuidProva',
  auth,
  user,
  creator,
  questionControllers.updateQuestion
);

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

router.delete(
  '/question/:uuidUser/:questionId',
  auth,
  user,
  creator,
  questionControllers.removeQuestion
);

module.exports = router;
