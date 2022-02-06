require('dotenv').config();
const express = require('express');
// const path = require('path');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const router = require('./routes/index');
const { requestLogger, errorLogger } = require('./middleware/logger');

const { PORT = 3000 } = process.env;

const app = express();
app.use(bodyParser.json());

app.use(requestLogger);

app.use(router);

app.use(errorLogger);

app.use((err, req, res, next) => {
  // если у ошибки нет статуса, выставляем 500
  const { statusCode = 500, message } = err;

  res.status(statusCode).send({
    // проверяем статус и выставляем сообщение в зависимости от него
    message: statusCode === 500 ? 'На сервере произошла ошибка' : message,
  });

  next();
});

async function start() {
  try {
    await mongoose.connect('mongodb://localhost:27017/bitfilmsdb', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    app.listen(PORT, () => {
      console.log(`App has been started port ${PORT}`);
    });
  } catch (e) {
    console.log('Server error', e.message);
    process.exit(1);
  }
}

start();
