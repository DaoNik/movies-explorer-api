require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const router = require('./routes/index');
const { requestLogger, errorLogger } = require('./middleware/logger');
const handleAllowedCors = require('./middleware/handleAllowedCors');
const handleErrors = require('./middleware/handleErrors');

const { PORT = 3000 } = process.env;

const app = express();
app.use(bodyParser.json());

app.use(requestLogger);

app.use(handleAllowedCors);

app.use(router);

app.use(errorLogger);

app.use(handleErrors);

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
