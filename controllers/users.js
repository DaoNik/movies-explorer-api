const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const NotFoundError = require('../errors/NotFoundError');
const ValidationError = require('../errors/ValidationError');
const ConflictError = require('../errors/ConflictError');
const AuthorizationError = require('../errors/AuthorizationError');

const { JWT_SECRET = 'dev-secret' } = process.env;

const register = (req, res, next) => {
  const { email, password, name } = req.body;
  bcrypt
    .hash(password, 10)
    .then((hash) => User.create({ email, password: hash, name }))
    .then((user) => {
      console.log(user);
      const newUser = user.toObject();
      delete newUser.password;
      res.send(newUser);
    })
    .catch((err) => {
      if (err.name === 'ValidationError') {
        return next(
          new ValidationError('Неверно введены данные для пользователя')
        );
      }
      if (err.name === 'MongoServerError' && err.code === 11000) {
        return next(
          new ConflictError('Данный пользователь уже зарегистрирован')
        );
      }

      return next(err);
    });
};

const login = (req, res, next) => {
  const { email, password } = req.body;

  return User.findOne({ email })
    .select('+password')
    .then((user) => {
      if (!user) {
        throw new AuthorizationError('Неправильные почта или пароль');
      }
      return bcrypt.compare(password, user.password).then((matched) => {
        if (!matched) {
          throw new AuthorizationError('Неправильные почта или пароль');
        }
        const { name } = user;
        const token = jwt.sign({ _id: user._id }, JWT_SECRET, {
          expiresIn: '7d',
        });
        return res.send({ token, name });
      });
    })
    .catch(next);
};

const getUser = (req, res, next) => {
  const id = req.user._id;
  return User.findById(id)
    .then((user) => {
      if (!user) {
        throw new NotFoundError('Нет пользователя с таким id');
      }
      return res.send(user);
    })
    .catch((err) => {
      if (err.name === 'CastError') {
        return next(new ValidationError('Невалидный id пользователя'));
      }
      if (err.name === 'NotFoundError') {
        return next(new NotFoundError('Неверный идентификатор пользователя'));
      }
      return next(err);
    });
};

const patchUser = (req, res, next) => {
  const { email, name } = req.body;
  console.log(email, name, req.body);
  return User.findByIdAndUpdate(
    req.user._id,
    { name, email },
    { new: true, runValidators: true }
  )
    .then((user) => {
      if (!user) {
        throw new NotFoundError('Нет пользователя с таким id');
      }
      return res.send(user);
    })
    .catch((err) => {
      if (err.name === 'ValidationError') {
        return next(
          new ValidationError('Неверно введены данные для пользователя')
        );
      }
      if (err.name === 'CastError') {
        return next(new ValidationError('Неверный идентификатор пользователя'));
      }
      if (err.name === 'MongoServerError' && err.code === 11000) {
        return next(
          new ConflictError('Вы не можете обновить данные другого пользователя')
        );
      }
      return next(err);
    });
};

module.exports = {
  register,
  login,
  getUser,
  patchUser,
};
