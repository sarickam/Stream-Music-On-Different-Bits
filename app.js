require('dotenv').config();
const express = require('express');
const fileUpload = require('express-fileupload');
const path = require('path');
const uploadRouter = require('./upload');
const streamRouter = require('./stream');
const pool = require('./db');

const app = express();

// Middleware for handling file uploads
app.use(fileUpload());

// Serve static files (index.html and style.css)
app.use(express.static(path.join(__dirname, 'public')));

// Routes for upload and stream
app.use('/upload', uploadRouter);
app.use('/stream', streamRouter);

// Route to get all songs (for listing on index.html)
app.get('/songs', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM songs');
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).send('Error fetching songs');
    }
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
