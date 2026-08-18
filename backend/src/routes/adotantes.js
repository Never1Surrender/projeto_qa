const express = require('express');
const pool = require('../db');
const asyncHandler = require('../utils/asyncHandler');
const { somenteDigitos, validarCamposAdotante } = require('../utils/validadores');

const router = express.Router();

const SELECT_ADOTANTES = `
  SELECT
    ad.*,
    c.nome AS cidade_nome,
    c.estado AS cidade_estado
  FROM adotantes ad
  LEFT JOIN cidades c ON c.id = ad.cidade_id
`;

async function cidadeExiste(cidade_id) {
  const [rows] = await pool.query('SELECT id FROM cidades WHERE id = ?', [cidade_id]);
  return rows.length > 0;
}

// GET /adotantes - lista todos os adotantes
router.get('/', asyncHandler(async (req, res) => {
  const [rows] = await pool.query(`${SELECT_ADOTANTES} ORDER BY ad.id DESC`);
  res.json(rows);
}));

// GET /adotantes/:id - detalhe de um adotante
router.get('/:id', asyncHandler(async (req, res) => {
  const [rows] = await pool.query(`${SELECT_ADOTANTES} WHERE ad.id = ?`, [req.params.id]);
  if (rows.length === 0) {
    return res.status(404).json({ erro: 'Adotante não encontrado' });
  }
  res.json(rows[0]);
}));

// POST /adotantes - cria um adotante
router.post('/', asyncHandler(async (req, res) => {
  const { nome, cpf, telefone, email, cidade_id } = req.body;
  const erroValidacao = validarCamposAdotante({ nome, cpf, telefone, email });
  if (erroValidacao) {
    return res.status(400).json({ erro: erroValidacao });
  }
  if (cidade_id && !(await cidadeExiste(cidade_id))) {
    return res.status(404).json({ erro: 'Cidade não encontrada' });
  }

  try {
    const [result] = await pool.query(
      'INSERT INTO adotantes (nome, cpf, telefone, email, cidade_id) VALUES (?, ?, ?, ?, ?)',
      [nome.trim(), somenteDigitos(cpf), telefone ? somenteDigitos(telefone) : null, email || null, cidade_id || null]
    );
    const [rows] = await pool.query(`${SELECT_ADOTANTES} WHERE ad.id = ?`, [result.insertId]);
    res.status(201).json(rows[0]);
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ erro: 'CPF já cadastrado' });
    }
    throw err;
  }
}));

// PUT /adotantes/:id - atualiza um adotante
router.put('/:id', asyncHandler(async (req, res) => {
  const { nome, cpf, telefone, email, cidade_id } = req.body;
  const erroValidacao = validarCamposAdotante({ nome, cpf, telefone, email });
  if (erroValidacao) {
    return res.status(400).json({ erro: erroValidacao });
  }
  if (cidade_id && !(await cidadeExiste(cidade_id))) {
    return res.status(404).json({ erro: 'Cidade não encontrada' });
  }

  const [existente] = await pool.query('SELECT id FROM adotantes WHERE id = ?', [req.params.id]);
  if (existente.length === 0) {
    return res.status(404).json({ erro: 'Adotante não encontrado' });
  }

  try {
    await pool.query(
      'UPDATE adotantes SET nome = ?, cpf = ?, telefone = ?, email = ?, cidade_id = ? WHERE id = ?',
      [
        nome.trim(),
        somenteDigitos(cpf),
        telefone ? somenteDigitos(telefone) : null,
        email || null,
        cidade_id || null,
        req.params.id,
      ]
    );
    const [rows] = await pool.query(`${SELECT_ADOTANTES} WHERE ad.id = ?`, [req.params.id]);
    res.json(rows[0]);
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ erro: 'CPF já cadastrado' });
    }
    throw err;
  }
}));

// DELETE /adotantes/:id - remove um adotante
// Bloqueado se o adotante ainda tiver animais adotados vinculados (evita animal "adotado" sem dono)
router.delete('/:id', asyncHandler(async (req, res) => {
  const [animaisVinculados] = await pool.query(
    "SELECT id FROM animais WHERE adotante_id = ? AND status = 'adotado'",
    [req.params.id]
  );
  if (animaisVinculados.length > 0) {
    return res.status(409).json({
      erro: 'Não é possível excluir: este adotante ainda tem animais adotados vinculados',
    });
  }

  const [result] = await pool.query('DELETE FROM adotantes WHERE id = ?', [req.params.id]);
  if (result.affectedRows === 0) {
    return res.status(404).json({ erro: 'Adotante não encontrado' });
  }
  res.status(204).send();
}));

module.exports = router;
