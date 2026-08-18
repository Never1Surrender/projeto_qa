const express = require('express');
const pool = require('../db');
const asyncHandler = require('../utils/asyncHandler');

const router = express.Router();

// GET /adotantes - lista todos os adotantes
router.get('/', asyncHandler(async (req, res) => {
  const [rows] = await pool.query('SELECT * FROM adotantes ORDER BY id DESC');
  res.json(rows);
}));

// GET /adotantes/:id - detalhe de um adotante
router.get('/:id', asyncHandler(async (req, res) => {
  const [rows] = await pool.query('SELECT * FROM adotantes WHERE id = ?', [req.params.id]);
  if (rows.length === 0) {
    return res.status(404).json({ erro: 'Adotante não encontrado' });
  }
  res.json(rows[0]);
}));

// POST /adotantes - cria um adotante
router.post('/', asyncHandler(async (req, res) => {
  const { nome, contato } = req.body;
  if (!nome || !contato) {
    return res.status(400).json({ erro: 'Campos obrigatórios: nome, contato' });
  }
  const [result] = await pool.query(
    'INSERT INTO adotantes (nome, contato) VALUES (?, ?)',
    [nome, contato]
  );
  const [rows] = await pool.query('SELECT * FROM adotantes WHERE id = ?', [result.insertId]);
  res.status(201).json(rows[0]);
}));

module.exports = router;
