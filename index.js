const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;
app.use(express.json());
const { initializeApp } = require("@firebase/app");
const { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signInWithCustomToken, signOut  } = require("firebase/auth");
const firebaseJson = require('./firebase.json');
const auth = getAuth(initializeApp(firebaseJson));
var admin = require("firebase-admin");
var serviceAccount = require("./firebaseAdmin.json");
admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
});

const AuthMiddleware = async (req, res, next) => {
  
  const token = req.headers['authorization'] ? req.headers['authorization'].replace('Bearer ', '') : null;

  if (!token) {
      return res.status(401).json({ message: 'Acesso não autorizado' });
  }

  try {
  
      const authUser = await admin.auth().verifyIdToken(token);
      req.authUser = authUser;
      next();

  } catch (e) {
      return res.sendStatus(401);
      
  }
};

const db = require('./db/db');

app.post('/api/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    // Autentica o usuário com o email e a senha
    const user = await signInWithEmailAndPassword(auth, email, password).then(() => {
      // O usuário foi autenticado com sucesso
      const user = userCredential.user;

      return user;

    });

    return res.status(200).json({ message: "Autenticação bem-sucedida", user });

  } catch (error) {
    return res.status(401).json({ error: "Credenciais inválidas" });
  }
});

app.post('/api/registro', async (req, res) => {
  const { email, password } = req.body;
  let errorMessage = false; // Declara a variável errorMessage

  await createUserWithEmailAndPassword(auth, email, password)
    .then((userCredential) => {
      console.log('Usuário criado');
    })
    .catch((error) => {
      errorMessage = true;
    });

  if (errorMessage) {
    return res.status(500).json({ error: "Usuário já existe" });
  }

  return res.status(201).json({ message: "Usuário registrado com sucesso" });
});

// Rota para criar um currículo
app.post('/api/curriculo', AuthMiddleware,async (req, res) => {
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
app.put('/api/curriculo/:id', AuthMiddleware,async (req, res) => {
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
app.get('/api/curriculo', AuthMiddleware,async (req, res) => {
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
app.delete('/api/curriculo/:id', AuthMiddleware,async (req, res) => {
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
