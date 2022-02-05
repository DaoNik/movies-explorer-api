const User = require('../models/User');
const NotFoundError = require('../errors/NotFoundError');
const ValidationError = require('../errors/ValidationError');

// const { JWT_SECRET = 'dev-secret' } = process.env;

const getUser = (req, res, next) => {
  const { id } = req.params;
  return User.findById(id)
    .then((user) => {
      if (!user) {
        throw new NotFoundError('Нет пользователя с таким id');
      }
      return res.status(200).send(user);
    })
    .catch((err) => {
      if (err.name === 'CastError') {
        next(new ValidationError('Невалидный id пользователя'));
      } else if (err.name === 'NotFoundError') {
        next(new NotFoundError('Неверный идентификатор пользователя'));
      } else {
        next(err);
      }
    });
};

const patchUser = (req, res, next) => {
  const { email, name } = req.body;
  return User.findByIdAndUpdate(
    req.user._id,
    { name, email },
    { new: true, runValidators: true }
  )
    .then((user) => {
      if (!user) {
        throw new NotFoundError('Нет пользователя с таким id');
      }
      return res.status(200).send(user);
    })
    .catch((err) => {
      if (err.name === 'ValidationError') {
        next(new ValidationError('Неверно введены данные для пользователя'));
      } else if (err.name === 'CastError') {
        next(new ValidationError('Неверный идентификатор пользователя'));
      } else {
        next(err);
      }
    });
};

module.exports = { getUser, patchUser };
