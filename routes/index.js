const router = require('express').Router();
const usersRouter = require('./users');
const moviesRouter = require('./movies');
const auth = require('../middleware/auth');
const NotFoundError = require('../errors/NotFoundError');

router.get('/', (req, res) => {
  res.status(200).send('Hello');
});

router.use(auth);

router.use('/users', usersRouter);
router.use('/movies', moviesRouter);

router.use((req, res, next) => {
  next(new NotFoundError('Страница не найдена'));
});

module.exports = router;
