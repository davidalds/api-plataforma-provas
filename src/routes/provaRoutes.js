const express = require('express');
const router = express.Router();
const provaControllers = require('../controllers/provaControllers');
const auth = require('../middlewares/auth');
const user = require('../middlewares/user');
const creator = require('../middlewares/creator');
const createProvaSchema = require('../middlewares/schemas/createProvaSchema');
const updateProvaSchema = require('../middlewares/schemas/updateProvaSchema');
const checkProva = require('../middlewares/checkProva');

router.get('/provas/:uuidUser', auth, user, provaControllers.getProvas);
router.get(
  '/prova/:uuidUser/:uuidProva',
  auth,
  user,
  checkProva,
  provaControllers.getProva
);
router.get(
  '/prova/score/:uuidProva/:uuidUser',
  auth,
  user,
  checkProva,
  provaControllers.getScore
);

router.put(
  '/prova/:uuidUser/:uuidProva',
  auth,
  user,
  creator,
  checkProva,
  updateProvaSchema,
  provaControllers.updateProva
);

router.post(
  '/provas/:uuidUser',
  auth,
  user,
  creator,
  createProvaSchema,
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
  '/provas/link/:uuidUser/:uuidProva',
  auth,
  user,
  creator,
  checkProva,
  provaControllers.getUsersByProva
);

router.delete(
  '/provas/deslink/:uuidUser/:uuidProva/:uuidDeslinkUser',
  auth,
  user,
  creator,
  checkProva,
  provaControllers.deslinkProvaUser
);

router.put(
  '/prova/publish/:uuidUser/:uuidProva',
  auth,
  user,
  creator,
  checkProva,
  provaControllers.publishProva
);

router.put(
  '/prova/unpublish/:uuidUser/:uuidProva',
  auth,
  user,
  creator,
  checkProva,
  provaControllers.unpublishProva
);

router.put(
  '/prova/done/:uuidUser/:uuidProva',
  auth,
  user,
  checkProva,
  provaControllers.markProvaDone
);

router.put(
  '/prova/result/:uuidUser/:uuidProva',
  auth,
  user,
  creator,
  checkProva,
  provaControllers.releaseProvaResult
);

module.exports = router;
