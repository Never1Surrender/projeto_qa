const express = require('express');
const pool = require('../db');
const asyncHandler = require('../utils/asyncHandler');

const router = express.Router();

const STATUS_VALIDOS = ['disponivel', 'adotado'];

const SELECT_ANIMAIS = `
  SELECT
    a.*,
    e.nome AS especie_nome,
    r.nome AS raca_nome,
    c.nome AS cidade_nome,
    c.estado AS cidade_estado,
    CASE
      WHEN a.data_nascimento IS NULL THEN NULL
      ELSE TIMESTAMPDIFF(YEAR, a.data_nascimento, CURDATE())
    END AS idade
  FROM animais a
  JOIN especies e ON e.id = a.especie_id
  LEFT JOIN racas r ON r.id = a.raca_id
  LEFT JOIN cidades c ON c.id = a.cidade_id
`;

function dataNascimentoValida(data_nascimento) {
  if (data_nascimento === undefined || data_nascimento === null || data_nascimento === '') {
    return true;
  }
  const data = new Date(data_nascimento);
  if (Number.isNaN(data.getTime())) {
    return false;
  }
  return data <= new Date();
}

async function cidadeExiste(cidade_id) {
  const [rows] = await pool.query('SELECT id FROM cidades WHERE id = ?', [cidade_id]);
  return rows.length > 0;
}

async function especieExiste(especie_id) {
  const [rows] = await pool.query('SELECT id FROM especies WHERE id = ?', [especie_id]);
  return rows.length > 0;
}

// Retorna null se ok, ou uma mensagem de erro se a raça não existir/não pertencer à espécie
async function validarRaca(raca_id, especie_id) {
  if (!raca_id) return null;
  const [rows] = await pool.query('SELECT especie_id FROM racas WHERE id = ?', [raca_id]);
  if (rows.length === 0) {
    return 'Raça não encontrada';
  }
  if (String(rows[0].especie_id) !== String(especie_id)) {
    return 'Raça não pertence à espécie informada';
  }
  return null;
}

// GET /animais - lista todos, com filtros opcionais ?status=, ?especie_id=, ?cidade_id=
router.get('/', asyncHandler(async (req, res) => {
  const { status, especie_id, cidade_id } = req.query;
  if (status && !STATUS_VALIDOS.includes(status)) {
    return res.status(400).json({ erro: `status inválido, use: ${STATUS_VALIDOS.join(', ')}` });
  }

  const condicoes = [];
  const params = [];
  if (status) {
    condicoes.push('a.status = ?');
    params.push(status);
  }
  if (especie_id) {
    condicoes.push('a.especie_id = ?');
    params.push(especie_id);
  }
  if (cidade_id) {
    condicoes.push('a.cidade_id = ?');
    params.push(cidade_id);
  }

  const sql = `${SELECT_ANIMAIS}${condicoes.length ? ` WHERE ${condicoes.join(' AND ')}` : ''} ORDER BY a.id DESC`;

  const [rows] = await pool.query(sql, params);
  res.json(rows);
}));

// GET /animais/:id - detalhe de um animal
router.get('/:id', asyncHandler(async (req, res) => {
  const [rows] = await pool.query(`${SELECT_ANIMAIS} WHERE a.id = ?`, [req.params.id]);
  if (rows.length === 0) {
    return res.status(404).json({ erro: 'Animal não encontrado' });
  }
  res.json(rows[0]);
}));

// POST /animais - cria um animal
router.post('/', asyncHandler(async (req, res) => {
  const { nome, especie_id, raca_id, data_nascimento, cidade_id } = req.body;
  if (!nome || !especie_id) {
    return res.status(400).json({ erro: 'Campos obrigatórios: nome, especie_id' });
  }
  if (!(await especieExiste(especie_id))) {
    return res.status(404).json({ erro: 'Espécie não encontrada' });
  }
  const erroRaca = await validarRaca(raca_id, especie_id);
  if (erroRaca) {
    return res.status(400).json({ erro: erroRaca });
  }
  if (!dataNascimentoValida(data_nascimento)) {
    return res.status(400).json({ erro: 'data_nascimento inválida (não pode ser futura)' });
  }
  if (cidade_id && !(await cidadeExiste(cidade_id))) {
    return res.status(404).json({ erro: 'Cidade não encontrada' });
  }

  const [result] = await pool.query(
    'INSERT INTO animais (nome, especie_id, raca_id, data_nascimento, cidade_id) VALUES (?, ?, ?, ?, ?)',
    [nome, especie_id, raca_id || null, data_nascimento || null, cidade_id || null]
  );
  const [rows] = await pool.query(`${SELECT_ANIMAIS} WHERE a.id = ?`, [result.insertId]);
  res.status(201).json(rows[0]);
}));

// PUT /animais/:id - atualiza um animal
router.put('/:id', asyncHandler(async (req, res) => {
  const { nome, especie_id, raca_id, data_nascimento, cidade_id } = req.body;
  if (!nome || !especie_id) {
    return res.status(400).json({ erro: 'Campos obrigatórios: nome, especie_id' });
  }
  if (!(await especieExiste(especie_id))) {
    return res.status(404).json({ erro: 'Espécie não encontrada' });
  }
  const erroRaca = await validarRaca(raca_id, especie_id);
  if (erroRaca) {
    return res.status(400).json({ erro: erroRaca });
  }
  if (!dataNascimentoValida(data_nascimento)) {
    return res.status(400).json({ erro: 'data_nascimento inválida (não pode ser futura)' });
  }
  if (cidade_id && !(await cidadeExiste(cidade_id))) {
    return res.status(404).json({ erro: 'Cidade não encontrada' });
  }

  const [existente] = await pool.query('SELECT id FROM animais WHERE id = ?', [req.params.id]);
  if (existente.length === 0) {
    return res.status(404).json({ erro: 'Animal não encontrado' });
  }

  await pool.query(
    'UPDATE animais SET nome = ?, especie_id = ?, raca_id = ?, data_nascimento = ?, cidade_id = ? WHERE id = ?',
    [nome, especie_id, raca_id || null, data_nascimento || null, cidade_id || null, req.params.id]
  );
  const [rows] = await pool.query(`${SELECT_ANIMAIS} WHERE a.id = ?`, [req.params.id]);
  res.json(rows[0]);
}));

// DELETE /animais/:id - remove um animal
router.delete('/:id', asyncHandler(async (req, res) => {
  const [result] = await pool.query('DELETE FROM animais WHERE id = ?', [req.params.id]);
  if (result.affectedRows === 0) {
    return res.status(404).json({ erro: 'Animal não encontrado' });
  }
  res.status(204).send();
}));

// POST /animais/:id/adotar - marca o animal como adotado
// Recebe adotante_id (adotante já existente) OU nome+contato (+ cidade_id opcional) para criar um adotante novo
router.post('/:id/adotar', asyncHandler(async (req, res) => {
  const { adotante_id, nome, contato, cidade_id } = req.body;

  const [animalRows] = await pool.query('SELECT * FROM animais WHERE id = ?', [req.params.id]);
  if (animalRows.length === 0) {
    return res.status(404).json({ erro: 'Animal não encontrado' });
  }
  if (animalRows[0].status === 'adotado') {
    return res.status(409).json({ erro: 'Animal já está adotado' });
  }

  let adotanteId = adotante_id;

  if (!adotanteId) {
    if (!nome || !contato) {
      return res.status(400).json({
        erro: 'Informe adotante_id de um adotante existente, ou nome e contato para cadastrar um novo',
      });
    }
    if (cidade_id && !(await cidadeExiste(cidade_id))) {
      return res.status(404).json({ erro: 'Cidade não encontrada' });
    }
    const [result] = await pool.query(
      'INSERT INTO adotantes (nome, contato, cidade_id) VALUES (?, ?, ?)',
      [nome, contato, cidade_id || null]
    );
    adotanteId = result.insertId;
  } else {
    const [adotanteRows] = await pool.query('SELECT id FROM adotantes WHERE id = ?', [adotanteId]);
    if (adotanteRows.length === 0) {
      return res.status(404).json({ erro: 'Adotante não encontrado' });
    }
  }

  await pool.query(
    "UPDATE animais SET status = 'adotado', adotante_id = ? WHERE id = ?",
    [adotanteId, req.params.id]
  );
  const [rows] = await pool.query(`${SELECT_ANIMAIS} WHERE a.id = ?`, [req.params.id]);
  res.json(rows[0]);
}));

module.exports = router;
