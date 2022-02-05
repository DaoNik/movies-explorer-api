const router = require('express').Router();
const { getUser, patchUser } = require('../controllers/users');

router.get('/me', getUser);

router.patch('/me', patchUser);

module.exports = router;
