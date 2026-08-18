const express = require('express');
const cors = require('cors');
require('dotenv').config();

const animaisRouter = require('./routes/animais');
const adotantesRouter = require('./routes/adotantes');
const cidadesRouter = require('./routes/cidades');
const especiesRouter = require('./routes/especies');
const racasRouter = require('./routes/racas');

const app = express();

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.json({ status: 'ok', mensagem: 'API de adoção de animais no ar' });
});

app.use('/animais', animaisRouter);
app.use('/adotantes', adotantesRouter);
app.use('/cidades', cidadesRouter);
app.use('/especies', especiesRouter);
app.use('/racas', racasRouter);

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ erro: 'Erro interno do servidor' });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`API rodando em http://localhost:${PORT}`);
});
