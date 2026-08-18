const express = require('express');
const pool = require('../db');
const asyncHandler = require('../utils/asyncHandler');
const { nomeValido } = require('../utils/validadores');

const router = express.Router();

// GET /especies - lista todas as espécies
router.get('/', asyncHandler(async (req, res) => {
  const [rows] = await pool.query('SELECT * FROM especies ORDER BY nome');
  res.json(rows);
}));

// GET /especies/:id - detalhe de uma espécie
router.get('/:id', asyncHandler(async (req, res) => {
  const [rows] = await pool.query('SELECT * FROM especies WHERE id = ?', [req.params.id]);
  if (rows.length === 0) {
    return res.status(404).json({ erro: 'Espécie não encontrada' });
  }
  res.json(rows[0]);
}));

// POST /especies - cria uma espécie
router.post('/', asyncHandler(async (req, res) => {
  const { nome } = req.body;
  if (!nomeValido(nome, 50)) {
    return res.status(400).json({ erro: 'Nome é obrigatório (máx. 50 caracteres)' });
  }

  try {
    const [result] = await pool.query('INSERT INTO especies (nome) VALUES (?)', [nome.trim()]);
    const [rows] = await pool.query('SELECT * FROM especies WHERE id = ?', [result.insertId]);
    res.status(201).json(rows[0]);
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ erro: 'Espécie já cadastrada' });
    }
    throw err;
  }
}));

// PUT /especies/:id - atualiza uma espécie
router.put('/:id', asyncHandler(async (req, res) => {
  const { nome } = req.body;
  if (!nomeValido(nome, 50)) {
    return res.status(400).json({ erro: 'Nome é obrigatório (máx. 50 caracteres)' });
  }

  const [existente] = await pool.query('SELECT id FROM especies WHERE id = ?', [req.params.id]);
  if (existente.length === 0) {
    return res.status(404).json({ erro: 'Espécie não encontrada' });
  }

  try {
    await pool.query('UPDATE especies SET nome = ? WHERE id = ?', [nome.trim(), req.params.id]);
    const [rows] = await pool.query('SELECT * FROM especies WHERE id = ?', [req.params.id]);
    res.json(rows[0]);
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ erro: 'Espécie já cadastrada' });
    }
    throw err;
  }
}));

// DELETE /especies/:id - remove uma espécie
// Bloqueado se houver animais ou raças vinculados (FK sem ON DELETE SET NULL)
router.delete('/:id', asyncHandler(async (req, res) => {
  try {
    const [result] = await pool.query('DELETE FROM especies WHERE id = ?', [req.params.id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ erro: 'Espécie não encontrada' });
    }
    res.status(204).send();
  } catch (err) {
    if (err.code === 'ER_ROW_IS_REFERENCED_2' || err.code === 'ER_ROW_IS_REFERENCED') {
      return res.status(409).json({
        erro: 'Não é possível excluir: existem animais ou raças vinculados a essa espécie',
      });
    }
    throw err;
  }
}));

module.exports = router;
