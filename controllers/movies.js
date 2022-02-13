const Movie = require('../models/Movie');
const NotFoundError = require('../errors/NotFoundError');
const ValidationError = require('../errors/ValidationError');
const AllowsError = require('../errors/AllowsError');

const getMovies = (req, res, next) => {
  Movie.find({})
    .where('owner')
    .equals(req.user._id)
    .then((movies) => {
      res.send(movies);
    })
    .catch(next);
};

const createMovie = (req, res, next) => {
  Movie.create({ ...req.body, owner: req.user._id })
    .then((movie) => {
      res.send(movie);
    })
    .catch((err) => {
      if (err.name === 'ValidationError') {
        return next(new ValidationError('Неверно введены данные для фильма'));
      }
      return next(err);
    });
};

const deleteMovie = (req, res, next) => {
  const { id } = req.params;

  return Movie.findById(id)
    .then((movie) => {
      if (!movie) {
        throw new NotFoundError('Нет фильма с таким id');
      }
      const movieOwnerId = movie.owner.toString();
      if (movieOwnerId !== req.user._id) {
        throw new AllowsError('Вы не можете удалить эту карточку');
      }
      return movie;
    })
    .then(() => Movie.findByIdAndDelete(id))
    .then((movie) => res.send(movie))
    .catch((err) => {
      if (err.name === 'CastError') {
        return next(new ValidationError('Невалидный id фильма'));
      }

      return next(err);
    });
};

module.exports = { getMovies, createMovie, deleteMovie };
