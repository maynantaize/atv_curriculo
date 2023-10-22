const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;
app.use(express.json());

const db = require('./db/db'); 

// Rota para criar um currículo
app.post('/api/curriculo', async (req, res) => {
  const { nome, experiencias, educacao } = req.body;

  try {
    const query = 'INSERT INTO curriculo (nome, experiencias, educacao) VALUES ($1, $2, $3) RETURNING *';
    const values = [nome, experiencias, educacao];
    const result = await db.query(query, values);
    res.json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).send('Erro ao criar currículo');
  }
});

// Rota para atualizar um currículo
app.put('/api/curriculo/:id', async (req, res) => {
  const id = req.params.id;
  const { nome, experiencias, educacao } = req.body;

  try {
    const query = 'UPDATE curriculo SET nome = $1, experiencias = $2, educacao = $3 WHERE id = $4 RETURNING *';
    const values = [nome, experiencias, educacao, id];
    const result = await db.query(query, values);
    res.json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).send('Erro ao atualizar currículo');
  }
});

// Rota para obter todos os currículos
app.get('/api/curriculo', async (req, res) => {
  try {
    const query = 'SELECT * FROM curriculo';
    const result = await db.query(query);
    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).send('Erro ao buscar currículo');
  }
});
// Rota para excluir um currículo
app.delete('/api/curriculo/:id', async (req, res) => {
  const id = req.params.id;

  try {
    const query = 'DELETE FROM curriculos WHERE id = $1 RETURNING *';
    const values = [id];
    const result = await db.query(query, values);

    if (result.rowCount === 0) {
      res.status(404).send('Currículo não encontrado');
    } else {
      res.json(result.rows[0]);
    }
  } catch (error) {
    console.error(error);
    res.status(500).send('Erro ao excluir currículo');
  }
});

app.listen(PORT, () => {
  console.log(`App utilizando a porta ${PORT}`);
});
