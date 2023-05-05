const express = require('express');
const router = express.Router();
const provaControllers = require('../controllers/provaControllers');
const auth = require('../middlewares/auth');
const user = require('../middlewares/user');

router.get('/provas/:uuidUser', auth, user, provaControllers.getProvas);
router.get('/prova/:uuid', auth, provaControllers.getProva);
router.get(
  '/prova/score/:uuid/:uuidUser',
  auth,
  user,
  provaControllers.getScore
);

module.exports = router;
