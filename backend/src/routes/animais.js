const express = require('express');
const pool = require('../db');
const asyncHandler = require('../utils/asyncHandler');

const router = express.Router();

const STATUS_VALIDOS = ['disponivel', 'adotado'];
const ESPECIES_VALIDAS = ['cachorro', 'gato', 'ave', 'coelho', 'reptil', 'outro'];

const SELECT_ANIMAIS = `
  SELECT *,
    CASE
      WHEN data_nascimento IS NULL THEN NULL
      ELSE TIMESTAMPDIFF(YEAR, data_nascimento, CURDATE())
    END AS idade
  FROM animais
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

// GET /animais - lista todos, com filtros opcionais ?status=disponivel|adotado e ?especie=
router.get('/', asyncHandler(async (req, res) => {
  const { status, especie } = req.query;
  if (status && !STATUS_VALIDOS.includes(status)) {
    return res.status(400).json({ erro: `status inválido, use: ${STATUS_VALIDOS.join(', ')}` });
  }
  if (especie && !ESPECIES_VALIDAS.includes(especie)) {
    return res.status(400).json({ erro: `especie inválida, use: ${ESPECIES_VALIDAS.join(', ')}` });
  }

  const condicoes = [];
  const params = [];
  if (status) {
    condicoes.push('status = ?');
    params.push(status);
  }
  if (especie) {
    condicoes.push('especie = ?');
    params.push(especie);
  }

  const sql = `${SELECT_ANIMAIS}${condicoes.length ? ` WHERE ${condicoes.join(' AND ')}` : ''} ORDER BY id DESC`;

  const [rows] = await pool.query(sql, params);
  res.json(rows);
}));

// GET /animais/:id - detalhe de um animal
router.get('/:id', asyncHandler(async (req, res) => {
  const [rows] = await pool.query(`${SELECT_ANIMAIS} WHERE id = ?`, [req.params.id]);
  if (rows.length === 0) {
    return res.status(404).json({ erro: 'Animal não encontrado' });
  }
  res.json(rows[0]);
}));

// POST /animais - cria um animal
router.post('/', asyncHandler(async (req, res) => {
  const { nome, especie, raca, data_nascimento } = req.body;
  if (!nome || !especie) {
    return res.status(400).json({ erro: 'Campos obrigatórios: nome, especie' });
  }
  if (!ESPECIES_VALIDAS.includes(especie)) {
    return res.status(400).json({ erro: `especie inválida, use: ${ESPECIES_VALIDAS.join(', ')}` });
  }
  if (!dataNascimentoValida(data_nascimento)) {
    return res.status(400).json({ erro: 'data_nascimento inválida (não pode ser futura)' });
  }

  const [result] = await pool.query(
    'INSERT INTO animais (nome, especie, raca, data_nascimento) VALUES (?, ?, ?, ?)',
    [nome, especie, raca || null, data_nascimento || null]
  );
  const [rows] = await pool.query(`${SELECT_ANIMAIS} WHERE id = ?`, [result.insertId]);
  res.status(201).json(rows[0]);
}));

// PUT /animais/:id - atualiza um animal
router.put('/:id', asyncHandler(async (req, res) => {
  const { nome, especie, raca, data_nascimento } = req.body;
  if (!nome || !especie) {
    return res.status(400).json({ erro: 'Campos obrigatórios: nome, especie' });
  }
  if (!ESPECIES_VALIDAS.includes(especie)) {
    return res.status(400).json({ erro: `especie inválida, use: ${ESPECIES_VALIDAS.join(', ')}` });
  }
  if (!dataNascimentoValida(data_nascimento)) {
    return res.status(400).json({ erro: 'data_nascimento inválida (não pode ser futura)' });
  }

  const [existente] = await pool.query('SELECT id FROM animais WHERE id = ?', [req.params.id]);
  if (existente.length === 0) {
    return res.status(404).json({ erro: 'Animal não encontrado' });
  }

  await pool.query(
    'UPDATE animais SET nome = ?, especie = ?, raca = ?, data_nascimento = ? WHERE id = ?',
    [nome, especie, raca || null, data_nascimento || null, req.params.id]
  );
  const [rows] = await pool.query(`${SELECT_ANIMAIS} WHERE id = ?`, [req.params.id]);
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
// Recebe adotante_id (adotante já existente) OU nome+contato (cria um adotante novo)
router.post('/:id/adotar', asyncHandler(async (req, res) => {
  const { adotante_id, nome, contato } = req.body;

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
    const [result] = await pool.query(
      'INSERT INTO adotantes (nome, contato) VALUES (?, ?)',
      [nome, contato]
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
  const [rows] = await pool.query(`${SELECT_ANIMAIS} WHERE id = ?`, [req.params.id]);
  res.json(rows[0]);
}));

module.exports = router;
