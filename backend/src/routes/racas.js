const express = require('express');
const pool = require('../db');
const asyncHandler = require('../utils/asyncHandler');

const router = express.Router();

const SELECT_RACAS = `
  SELECT r.*, e.nome AS especie_nome
  FROM racas r
  JOIN especies e ON e.id = r.especie_id
`;

async function especieExiste(especie_id) {
  const [rows] = await pool.query('SELECT id FROM especies WHERE id = ?', [especie_id]);
  return rows.length > 0;
}

// GET /racas - lista todas as raças, com filtro opcional ?especie_id=
router.get('/', asyncHandler(async (req, res) => {
  const { especie_id } = req.query;

  const sql = especie_id
    ? `${SELECT_RACAS} WHERE r.especie_id = ? ORDER BY r.nome`
    : `${SELECT_RACAS} ORDER BY e.nome, r.nome`;
  const params = especie_id ? [especie_id] : [];

  const [rows] = await pool.query(sql, params);
  res.json(rows);
}));

// GET /racas/:id - detalhe de uma raça
router.get('/:id', asyncHandler(async (req, res) => {
  const [rows] = await pool.query(`${SELECT_RACAS} WHERE r.id = ?`, [req.params.id]);
  if (rows.length === 0) {
    return res.status(404).json({ erro: 'Raça não encontrada' });
  }
  res.json(rows[0]);
}));

// POST /racas - cria uma raça vinculada a uma espécie
router.post('/', asyncHandler(async (req, res) => {
  const { nome, especie_id } = req.body;
  if (!nome || !especie_id) {
    return res.status(400).json({ erro: 'Campos obrigatórios: nome, especie_id' });
  }
  if (!(await especieExiste(especie_id))) {
    return res.status(404).json({ erro: 'Espécie não encontrada' });
  }

  try {
    const [result] = await pool.query(
      'INSERT INTO racas (nome, especie_id) VALUES (?, ?)',
      [nome, especie_id]
    );
    const [rows] = await pool.query(`${SELECT_RACAS} WHERE r.id = ?`, [result.insertId]);
    res.status(201).json(rows[0]);
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ erro: 'Raça já cadastrada para essa espécie' });
    }
    throw err;
  }
}));

// PUT /racas/:id - atualiza uma raça
router.put('/:id', asyncHandler(async (req, res) => {
  const { nome, especie_id } = req.body;
  if (!nome || !especie_id) {
    return res.status(400).json({ erro: 'Campos obrigatórios: nome, especie_id' });
  }
  if (!(await especieExiste(especie_id))) {
    return res.status(404).json({ erro: 'Espécie não encontrada' });
  }

  const [existente] = await pool.query('SELECT id FROM racas WHERE id = ?', [req.params.id]);
  if (existente.length === 0) {
    return res.status(404).json({ erro: 'Raça não encontrada' });
  }

  try {
    await pool.query('UPDATE racas SET nome = ?, especie_id = ? WHERE id = ?', [
      nome,
      especie_id,
      req.params.id,
    ]);
    const [rows] = await pool.query(`${SELECT_RACAS} WHERE r.id = ?`, [req.params.id]);
    res.json(rows[0]);
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ erro: 'Raça já cadastrada para essa espécie' });
    }
    throw err;
  }
}));

// DELETE /racas/:id - remove uma raça
// Animais vinculados perdem a referência (raca_id volta a NULL)
router.delete('/:id', asyncHandler(async (req, res) => {
  const [result] = await pool.query('DELETE FROM racas WHERE id = ?', [req.params.id]);
  if (result.affectedRows === 0) {
    return res.status(404).json({ erro: 'Raça não encontrada' });
  }
  res.status(204).send();
}));

module.exports = router;
