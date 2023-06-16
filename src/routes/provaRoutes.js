const express = require('express');
const router = express.Router();
const provaControllers = require('../controllers/provaControllers');
const auth = require('../middlewares/auth');
const user = require('../middlewares/user');
const creator = require('../middlewares/creator');

router.get('/provas/:uuidUser', auth, user, provaControllers.getProvas);
router.get('/prova/:uuidProva', auth, provaControllers.getProva);
router.get(
  '/prova/score/:uuid/:uuidUser',
  auth,
  user,
  provaControllers.getScore
);
router.post(
  '/provas/:uuidUser',
  auth,
  user,
  creator,
  provaControllers.newProva
);
router.post(
  '/provas/link/:uuidUser',
  auth,
  user,
  creator,
  provaControllers.linkProvaUser
);
router.get(
  '/provas/link/:uuidUser/:uuid',
  auth,
  user,
  creator,
  provaControllers.getUsersByProva
);

router.delete(
  '/provas/deslink/:uuidUser/:uuidProva/:uuidDeslinkUser',
  auth,
  user,
  creator,
  provaControllers.deslinkProvaUser
);

module.exports = router;
