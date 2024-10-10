require('dotenv').config();
const express = require('express');
const fileUpload = require('express-fileupload');
const path = require('path');
const uploadRouter = require('./upload');
const streamRouter = require('./stream');
const pool = require('./db');
const helmet = require('helmet'); // Optional: For additional security

const app = express();

// Middleware for security
app.use(helmet());  // Use Helmet for security headers

// Middleware for handling file uploads with limits
app.use(fileUpload({
    limits: { fileSize: 50 * 1024 * 1024 }, // Set max file size to 50MB
    abortOnLimit: true,  // Abort the request if file size exceeds the limit
    responseOnLimit: 'File too large',  // Custom message when file size limit is exceeded
}));

// Serve static files (index.html and style.css) with caching
app.use(express.static(path.join(__dirname, 'public'), {
    maxAge: '1d', // Cache static files for one day
}));

// Routes for upload and stream
app.use('/upload', uploadRouter);
app.use('/stream', streamRouter);

// Route to get all songs (for listing on index.html)
app.get('/songs', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM songs');
        res.json(result.rows);
    } catch (err) {
        console.error('Error fetching songs:', err);
        res.status(500).send('Error fetching songs');
    }
});

// Global error handler for unexpected errors
app.use((err, req, res, next) => {
    console.error('Unexpected error:', err);
    res.status(500).send('An unexpected error occurred');
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
