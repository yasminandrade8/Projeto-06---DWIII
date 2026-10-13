const express = require('express');
const path = require('path');
const db = require('./database');

const app = express();
const PORT = 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// Listar todos os contatos
app.get('/api/contatos', (req, res) => {
    const sql = 'SELECT * FROM contatos ORDER BY nome ASC';
    db.all(sql, [], (err, rows) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json(rows);
    });
});

// Obter contato por ID
app.get('/api/contatos/:id', (req, res) => {
    const sql = 'SELECT * FROM contatos WHERE id = ?';
    db.get(sql, [req.params.id], (err, row) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        if (!row) {
            return res.status(404).json({ error: 'Contato não encontrado.' });
        }
        res.json(row);
    });
});

// Cadastrar novo contato
app.post('/api/contatos', (req, res) => {
    const {
        nome, email, telefone, cep,
        logradouro, bairro, cidade, estado, numero,
        data_nascimento
    } = req.body;

    if (!nome || !email || !telefone || !cep || !data_nascimento) {
        return res.status(400).json({ error: 'Campos obrigatórios não preenchidos.' });
    }

    const sql = `
        INSERT INTO contatos (nome, email, telefone, cep, logradouro, bairro, cidade, estado, numero, data_nascimento)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    const params = [nome, email, telefone, cep, logradouro, bairro, cidade, estado, numero, data_nascimento];

    db.run(sql, params, function (err) {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.status(201).json({ id: this.lastID, message: 'Contato inserido com sucesso!' });
    });
});

// Atualizar contato
app.put('/api/contatos/:id', (req, res) => {
    const {
        nome, email, telefone, cep,
        logradouro, bairro, cidade, estado, numero,
        data_nascimento
    } = req.body;

    const sql = `
        UPDATE contatos
        SET nome = ?, email = ?, telefone = ?, cep = ?, logradouro = ?, bairro = ?, cidade = ?, estado = ?, numero = ?, data_nascimento = ?
        WHERE id = ?
    `;
    const params = [nome, email, telefone, cep, logradouro, bairro, cidade, estado, numero, data_nascimento, req.params.id];

    db.run(sql, params, function (err) {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        if (this.changes === 0) {
            return res.status(404).json({ error: 'Contato não encontrado.' });
        }
        res.json({ message: 'Contato atualizado com sucesso!' });
    });
});

// Deletar contato
app.delete('/api/contatos/:id', (req, res) => {
    const sql = 'DELETE FROM contatos WHERE id = ?';
    db.run(sql, [req.params.id], function (err) {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        if (this.changes === 0) {
            return res.status(404).json({ error: 'Contato não encontrado.' });
        }
        res.json({ message: 'Contato excluído com sucesso!' });
    });
});

app.listen(PORT, () => {
    console.log(`Servidor rodando em http://localhost:${PORT}`);
});
