const express = require('express');
const pool = require('../db');
const asyncHandler = require('../utils/asyncHandler');

const router = express.Router();

// GET /cidades - lista todas as cidades
router.get('/', asyncHandler(async (req, res) => {
  const [rows] = await pool.query('SELECT * FROM cidades ORDER BY nome, estado');
  res.json(rows);
}));

// GET /cidades/:id - detalhe de uma cidade
router.get('/:id', asyncHandler(async (req, res) => {
  const [rows] = await pool.query('SELECT * FROM cidades WHERE id = ?', [req.params.id]);
  if (rows.length === 0) {
    return res.status(404).json({ erro: 'Cidade não encontrada' });
  }
  res.json(rows[0]);
}));

// POST /cidades - cria uma cidade
router.post('/', asyncHandler(async (req, res) => {
  const { nome, estado } = req.body;
  if (!nome || !estado) {
    return res.status(400).json({ erro: 'Campos obrigatórios: nome, estado' });
  }
  if (estado.length !== 2) {
    return res.status(400).json({ erro: 'estado deve ser a sigla UF com 2 letras' });
  }

  try {
    const [result] = await pool.query(
      'INSERT INTO cidades (nome, estado) VALUES (?, ?)',
      [nome, estado.toUpperCase()]
    );
    const [rows] = await pool.query('SELECT * FROM cidades WHERE id = ?', [result.insertId]);
    res.status(201).json(rows[0]);
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ erro: 'Cidade já cadastrada para esse estado' });
    }
    throw err;
  }
}));

// PUT /cidades/:id - atualiza uma cidade
router.put('/:id', asyncHandler(async (req, res) => {
  const { nome, estado } = req.body;
  if (!nome || !estado) {
    return res.status(400).json({ erro: 'Campos obrigatórios: nome, estado' });
  }
  if (estado.length !== 2) {
    return res.status(400).json({ erro: 'estado deve ser a sigla UF com 2 letras' });
  }

  const [existente] = await pool.query('SELECT id FROM cidades WHERE id = ?', [req.params.id]);
  if (existente.length === 0) {
    return res.status(404).json({ erro: 'Cidade não encontrada' });
  }

  try {
    await pool.query('UPDATE cidades SET nome = ?, estado = ? WHERE id = ?', [
      nome,
      estado.toUpperCase(),
      req.params.id,
    ]);
    const [rows] = await pool.query('SELECT * FROM cidades WHERE id = ?', [req.params.id]);
    res.json(rows[0]);
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ erro: 'Cidade já cadastrada para esse estado' });
    }
    throw err;
  }
}));

// DELETE /cidades/:id - remove uma cidade
// Animais e adotantes vinculados perdem a referência (cidade_id volta a NULL)
router.delete('/:id', asyncHandler(async (req, res) => {
  const [result] = await pool.query('DELETE FROM cidades WHERE id = ?', [req.params.id]);
  if (result.affectedRows === 0) {
    return res.status(404).json({ erro: 'Cidade não encontrada' });
  }
  res.status(204).send();
}));

module.exports = router;
