// routes/movies.js

const express = require('express');
const router = express.Router();

// Import database connections
const { Pool } = require('pg');
const pool = new Pool();
const mongoose = require('mongoose');
const Movie = mongoose.model('Movie');

// Movie search route
router.get('/search', async (req, res) => {
    const searchQuery = req.query.q;
    try {
        // Query PostgreSQL
        const pgResult = await pool.query(
            "SELECT * FROM movies WHERE title ILIKE $1 OR description ILIKE $1 OR director ILIKE $1",
            [`%${searchQuery}%`]
        );

        // Query MongoDB
        const mongoResult = await Movie.find({
            $or: [
                { title: new RegExp(searchQuery, 'i') },
                { description: new RegExp(searchQuery, 'i') },
                { director: new RegExp(searchQuery, 'i') }
            ]
        });

        // Combine results
        const results = [...pgResult.rows, ...mongoResult];
        
        res.render('index', { movies: results, searchQuery });
    } catch (err) {
        console.error(err);
        res.status(500).send('Server error');
    }
});

module.exports = router;
