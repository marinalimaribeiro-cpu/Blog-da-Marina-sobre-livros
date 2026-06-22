const express = require('express');
const path = require('path');
const fs = require('fs');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

const DB_PATH = path.join(__dirname, 'books.db');
const dbExists = fs.existsSync(DB_PATH);
const db = new sqlite3.Database(DB_PATH);

db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS books (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    author TEXT NOT NULL,
    date TEXT,
    rating INTEGER,
    review TEXT,
    created INTEGER
  )`);
});

// Serve arquivos estáticos (frontend)
app.use(express.static(path.join(__dirname)));

// API
app.get('/api/books', (req, res) => {
  db.all('SELECT * FROM books ORDER BY created DESC', (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

app.post('/api/books', (req, res) => {
  const { title, author, date, rating, review, created } = req.body;
  if (!title || !author) return res.status(400).json({ error: 'Título e autor são obrigatórios.' });
  const stmt = db.prepare('INSERT INTO books (title, author, date, rating, review, created) VALUES (?, ?, ?, ?, ?, ?)');
  stmt.run(title, author, date || '', rating || null, review || '', created || Date.now(), function(err) {
    if (err) return res.status(500).json({ error: err.message });
    db.get('SELECT * FROM books WHERE id = ?', [this.lastID], (err2, row) => {
      if (err2) return res.status(500).json({ error: err2.message });
      res.status(201).json(row);
    });
  });
  stmt.finalize();
});

app.delete('/api/books/:id', (req, res) => {
  const id = Number(req.params.id);
  db.run('DELETE FROM books WHERE id = ?', [id], function(err) {
    if (err) return res.status(500).json({ error: err.message });
    if (this.changes === 0) return res.status(404).json({ error: 'Livro não encontrado' });
    res.json({ success: true });
  });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
