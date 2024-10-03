const express = require('express');
const { spawn } = require('child_process');
const pool = require('./db');
const path = require('path');

const router = express.Router();

router.get('/:bitrate/:id', async (req, res) => {
    const { bitrate, id } = req.params;

    try {
        // Fetch song metadata from PostgreSQL
        const query = 'SELECT * FROM songs WHERE id = $1';
        const result = await pool.query(query, [id]);

        if (result.rows.length === 0) {
            return res.status(404).send('Song not found');
        }

        const song = result.rows[0];
        const filePath = song.file_path;

        // Validate bitrate
        const allowedBitrates = ['128', '192', '320'];
        if (!allowedBitrates.includes(bitrate)) {
            return res.status(400).send('Invalid bitrate');
        }

        // Use ffmpeg to transcode on the fly
        const ffmpeg = spawn('ffmpeg', [
            '-i', filePath,           // Input file
            '-b:a', `${bitrate}k`,    // Specify bitrate
            '-f', 'mp3',              // Format as MP3
            'pipe:1'                  // Output to stdout (pipe to response)
        ]);

        res.setHeader('Content-Type', 'audio/mpeg');
        ffmpeg.stdout.pipe(res);

        ffmpeg.stderr.on('data', (data) => {
            console.error(`ffmpeg error: ${data}`);
        });

        ffmpeg.on('close', (code) => {
            if (code !== 0) {
                res.status(500).send('Error during transcoding');
            }
        });
    } catch (err) {
        console.error(err);
        res.status(500).send('Server error');
    }
});

module.exports = router;
