const { Pool } = require('pg');
const getRawBody = require('raw-body');

// Conecta ao CockroachDB
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

module.exports = async (req, res) => {
  try {
    if (req.method === 'GET') {
      const result = await pool.query('SELECT * FROM tarefas ORDER BY criada_em DESC');
      return res.status(200).json(result.rows);
    }

    if (req.method === 'POST') {
      const raw = await getRawBody(req);
      const body = JSON.parse(raw.toString());

      const { titulo, descricao, data_limite, prioridade } = body;

      await pool.query(
        'INSERT INTO tarefas (titulo, descricao, data_limite, prioridade) VALUES ($1, $2, $3, $4)',
        [titulo, descricao, data_limite, prioridade]
      );

      return res.status(201).json({ mensagem: 'Tarefa criada com sucesso!' });
    }

    return res.status(405).json({ erro: 'Método não permitido' });
  } catch (error) {
    console.error('Erro na API:', error);
    return res.status(500).json({ erro: 'Erro interno do servidor' });
  }
};