require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const app = express();
const port = 8000;

app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(helmet());

const whitelist = process.env.WHITELIST.split(',');

const corsOptions = {
  origin: (origin, callback) => {
    if (whitelist.includes(origin) || !origin) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
};

app.use(cors(corsOptions));

const provaRoutes = require('./src/routes/provaRoutes');
const questionRoutes = require('./src/routes/questionRoutes');
const userRoutes = require('./src/routes/userRoutes');

app.use('/', provaRoutes);
app.use('/', questionRoutes);
app.use('/', userRoutes);

app.listen(port, (err) => {
  if (err) {
    console.log('Ocorreu um erro ao iniciar servidor');
  } else {
    console.log(`Servidor rodando na porta: ${port}`);
  }
});
