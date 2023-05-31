const express = require('express');
const bodyParser = require('body-parser');
const { Pool } = require('pg');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(bodyParser.json());

const pool = new Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'store',
    password: 'root',
    port: 5432,
});

app.get('/stocks', async (req, res) => {
    const result = await pool.query('SELECT * FROM stocks');
    res.json(result.rows);
});

app.get('/stocks/:id', async (req, res) => {
    const result = await pool.query('SELECT * FROM stocks WHERE id = $1', [req.params.id]);
    if (result.rows.length > 0) {
        res.json(result.rows[0]);
    } else {
        res.status(404).json({message: 'Stock not found'});
    }
});

app.post('/stocks', async (req, res) => {
    const result = await pool.query(
        'INSERT INTO stocks (name, amount, value) VALUES ($1, $2, $3) RETURNING *',
        [req.body.name, req.body.amount, req.body.value]
    );
    res.status(201).json(result.rows[0]);
});

app.put('/stocks/:id', async (req, res) => {
    const result = await pool.query(
        'UPDATE stocks SET name = $1, amount = $2, value = $3 WHERE id = $4 RETURNING *',
        [req.body.name, req.body.amount, req.body.value, req.params.id]
    );
    if (result.rows.length > 0) {
        res.json(result.rows[0]);
    } else {
        res.status(404).json({message: 'Stock not found'});
    }
});

app.delete('/stocks/:id', async (req, res) => {
    const result = await pool.query('DELETE FROM stocks WHERE id = $1 RETURNING *', [req.params.id]);
    if (result.rows.length > 0) {
        res.json(result.rows[0]);
    } else {
        res.status(404).json({message: 'Stock not found'});
    }
});

const port = 3000;
app.listen(port, () => console.log(`Stocks app listening on port ${port}`));
