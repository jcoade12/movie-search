const express = require('express');
const pool = require('../models/postgres');
const db = require('../models/mongo');
const Movie = db.collection('movies');
const router = express.Router();

router.get('/search', (req, res) => {
    res.render('search');
});

router.post('/search', async (req, res) => {
    const { query, source } = req.body;

    let results = [];
    if (source === 'postgres' || source === 'both') {
        const pgResults = await pool.query(
            'SELECT * FROM movies WHERE title ILIKE $1 OR description ILIKE $1',
            [`%${query}%`]
        );
        results = results.concat(pgResults.rows);
    }

    if (source === 'mongo' || source === 'both') {
        const mongoResults = await Movie.find({
            $text: { $search: query }
        }).toArray();
        results = results.concat(mongoResults);
    }

    res.render('results', { results });
});

module.exports = router;
