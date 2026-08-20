const express = require('express');
const pool = require('../db');
const asyncHandler = require('../utils/asyncHandler');
const { somenteDigitos, validarCamposAdotante } = require('../utils/validadores');

const router = express.Router();

const ORDENACOES_VALIDAS = { nome: 'ad.nome', criado_em: 'ad.criado_em' };
const LIMITE_PADRAO = 15;
const LIMITE_MAXIMO = 100;

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

// GET /adotantes - lista com busca (?busca=), ordenação (?ordenar=nome|criado_em, ?direcao=asc|desc)
// e paginação (?page=, ?limit=)
router.get('/', asyncHandler(async (req, res) => {
  const { busca, ordenar, direcao, page, limit } = req.query;
  if (ordenar && !ORDENACOES_VALIDAS[ordenar]) {
    return res.status(400).json({ erro: `ordenar inválido, use: ${Object.keys(ORDENACOES_VALIDAS).join(', ')}` });
  }
  if (direcao && !['asc', 'desc'].includes(direcao)) {
    return res.status(400).json({ erro: 'direcao inválida, use: asc, desc' });
  }

  const condicoes = [];
  const params = [];
  if (busca) {
    condicoes.push('ad.nome LIKE ?');
    params.push(`%${busca}%`);
  }
  const where = condicoes.length ? ` WHERE ${condicoes.join(' AND ')}` : '';

  const ordem = ordenar ? `${ORDENACOES_VALIDAS[ordenar]} ${direcao === 'desc' ? 'DESC' : 'ASC'}` : 'ad.id DESC';

  const limiteNum = Math.min(Math.max(parseInt(limit, 10) || LIMITE_PADRAO, 1), LIMITE_MAXIMO);
  const paginaNum = Math.max(parseInt(page, 10) || 1, 1);
  const offset = (paginaNum - 1) * limiteNum;

  const [totalRows] = await pool.query(`SELECT COUNT(*) AS total FROM adotantes ad${where}`, params);
  const total = totalRows[0].total;

  const sql = `${SELECT_ADOTANTES}${where} ORDER BY ${ordem} LIMIT ? OFFSET ?`;
  const [rows] = await pool.query(sql, [...params, limiteNum, offset]);

  res.json({
    dados: rows,
    total,
    pagina: paginaNum,
    totalPaginas: Math.max(Math.ceil(total / limiteNum), 1),
    limite: limiteNum,
  });
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
// Bloqueado se o adotante ainda tiver animais adotados vinculados, ou se tiver
// histórico de adoção (tabela adocoes), pra não perder esse registro
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

  const [historico] = await pool.query('SELECT id FROM adocoes WHERE adotante_id = ?', [req.params.id]);
  if (historico.length > 0) {
    return res.status(409).json({
      erro: 'Não é possível excluir: este adotante tem histórico de adoção',
    });
  }

  const [result] = await pool.query('DELETE FROM adotantes WHERE id = ?', [req.params.id]);
  if (result.affectedRows === 0) {
    return res.status(404).json({ erro: 'Adotante não encontrado' });
  }
  res.status(204).send();
}));

module.exports = router;
