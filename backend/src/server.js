const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

const animaisRouter = require('./routes/animais');
const adotantesRouter = require('./routes/adotantes');
const cidadesRouter = require('./routes/cidades');
const especiesRouter = require('./routes/especies');
const racasRouter = require('./routes/racas');
const uploadRouter = require('./routes/upload');

const app = express();

const PASTA_UPLOADS = path.join(__dirname, '../uploads');
fs.mkdirSync(PASTA_UPLOADS, { recursive: true });

app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(PASTA_UPLOADS));

app.get('/', (req, res) => {
  res.json({ status: 'ok', mensagem: 'API de adoção de animais no ar' });
});

app.use('/animais', animaisRouter);
app.use('/adotantes', adotantesRouter);
app.use('/cidades', cidadesRouter);
app.use('/especies', especiesRouter);
app.use('/racas', racasRouter);
app.use('/uploads', uploadRouter);

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ erro: 'Erro interno do servidor' });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`API rodando em http://localhost:${PORT}`);
});
