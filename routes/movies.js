const router = require('express').Router();
const { celebrate, Joi } = require('celebrate');
const {
  getMovies,
  createMovie,
  deleteMovie,
} = require('../controllers/movies');

router.get('/', getMovies);

router.post(
  '/',
  celebrate({
    body: Joi.object().keys({
      country: Joi.string().required(),
      director: Joi.string().required(),
      duration: Joi.number().required(),
      year: Joi.string().required(),
      description: Joi.string().required(),
      image: Joi.string()
        .required()
        .pattern(/^(http|https):\/\/(www){0,1}\.?\w+\.\S+/),
      trailerLink: Joi.string()
        .required()
        .pattern(/^(http|https):\/\/(www){0,1}\.?\w+\.\S+/),
      thumbnail: Joi.string()
        .required()
        .pattern(/^(http|https):\/\/(www){0,1}\.?\w+\.\S+/),
      movieId: Joi.number().required(),
      nameRU: Joi.string().required(),
      nameEN: Joi.string().required(),
    }),
  }),
  createMovie
);

router.delete(
  '/:id',
  celebrate({
    params: Joi.object().keys({
      id: Joi.string().length(24).hex(),
    }),
  }),
  deleteMovie
);

module.exports = router;
