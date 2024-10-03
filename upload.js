const express = require('express');
const path = require('path');
const pool = require('./db');
const fs = require('fs');

const router = express.Router();

router.post('/', async (req, res) => {
    try {
        // Check if the file was uploaded
        if (!req.files || !req.files.song) {
            console.log('No file uploaded');
            return res.status(400).send('No song file uploaded');
        }

        const songFile = req.files.song;
        const songName = req.body.song_name;

        console.log(`Received file: ${songFile.name}`);
        console.log(`Song Name: ${songName}`);

        // Path to save the file
        const uploadPath = path.join(__dirname, 'uploads', songFile.name);

        console.log(`Saving file to: ${uploadPath}`);

        // Save file to the uploads folder
        await songFile.mv(uploadPath);
        console.log('File saved successfully.');

        // Insert metadata into PostgreSQL
        const query = 'INSERT INTO songs (song_name, file_path) VALUES ($1, $2) RETURNING *';
        const result = await pool.query(query, [songName, uploadPath]);

        console.log('Song metadata saved to database:', result.rows[0]);

        res.status(200).json({ message: 'Song uploaded successfully', data: result.rows[0] });
    } catch (err) {
        console.error('Error uploading file:', err);
        res.status(500).send('Server error');
    }
});

module.exports = router;
