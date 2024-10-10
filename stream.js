//Custom Bitrate streaming of song

const express = require('express');
const { spawn } = require('child_process');
const pool = require('./db');

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

        // Validate if bitrate is a positive integer
        if (isNaN(bitrate) || bitrate <= 0) {
            return res.status(400).send('Invalid bitrate');
        }

        // Use ffmpeg to transcode on the fly with the given bitrate
        const ffmpeg = spawn('ffmpeg', [
            '-i', filePath,           // Input file
            '-b:a', `${bitrate}k`,    // Specify bitrate
            '-f', 'mp3',              // Format as MP3
            'pipe:1'                  // Output to stdout (pipe to response)
        ]);

        // Set headers for the response
        res.setHeader('Content-Type', 'audio/mpeg');

        // Pipe the transcoded audio to the response
        ffmpeg.stdout.pipe(res);

        // Handle ffmpeg errors and log them
        ffmpeg.stderr.on('data', (data) => {
            console.error(`ffmpeg error: ${data}`);
        });

        // Handle ffmpeg close event
        ffmpeg.on('close', (code) => {
            if (code !== 0) {
                console.error(`ffmpeg process exited with code ${code}`);
                // Do not attempt to send a response if the headers have already been sent
                if (!res.headersSent) {
                    res.status(500).send('Error during transcoding');
                }
            } else {
                console.log('ffmpeg process finished successfully');
            }
        });

        // Ensure ffmpeg is killed if the client disconnects
        req.on('close', () => {
            ffmpeg.kill('SIGTERM'); // Terminate ffmpeg process
            console.log('Request closed, ffmpeg process terminated');
        });

    } catch (err) {
        console.error(err);
        // Only send the error response if headers haven't been sent
        if (!res.headersSent) {
            res.status(500).send('Server error');
        }
    }
});

module.exports = router;






















//predefined Bitrate streaming of song
// const express = require('express');
// const { spawn } = require('child_process');
// const pool = require('./db');
// const path = require('path');

// const router = express.Router();

// router.get('/:bitrate/:id', async (req, res) => {
//     const { bitrate, id } = req.params;

//     try {
//         // Fetch song metadata from PostgreSQL
//         const query = 'SELECT * FROM songs WHERE id = $1';
//         const result = await pool.query(query, [id]);

//         if (result.rows.length === 0) {
//             return res.status(404).send('Song not found');
//         }

//         const song = result.rows[0];
//         const filePath = song.file_path;

//         // Validate bitrate
//         const allowedBitrates = ['64', '128', '192', '256', '320'];
//         if (!allowedBitrates.includes(bitrate)) {
//             return res.status(400).send('Invalid bitrate');
//         }

//         // Use ffmpeg to transcode on the fly
//         const ffmpeg = spawn('ffmpeg', [
//             '-i', filePath,           // Input file
//             '-b:a', `${bitrate}k`,    // Specify bitrate
//             '-f', 'mp3',              // Format as MP3
//             'pipe:1'                  // Output to stdout (pipe to response)
//         ]);

//         let responseSent = false;  // Keep track of response status

//         // Set the response content type for MP3
//         res.setHeader('Content-Type', 'audio/mpeg');

//         // Pipe the ffmpeg output (the transcoded song) to the response
//         ffmpeg.stdout.pipe(res);

//         // Handle any ffmpeg errors
//         ffmpeg.stderr.on('data', (data) => {
//             console.error(`ffmpeg error: ${data}`);
//         });

//         // When the request is closed (e.g., client disconnects), kill the ffmpeg process
//         req.on('close', () => {
//             if (!responseSent && ffmpeg) {
//                 ffmpeg.kill('SIGTERM');  // Terminate the ffmpeg process
//                 console.log('Request closed, ffmpeg process terminated');
//             }
//         });

//         // Handle the completion of the ffmpeg process
//         ffmpeg.on('close', (code) => {
//             if (responseSent) return;  // Avoid sending multiple responses

//             if (code !== 0) {
//                 console.error(`ffmpeg process exited with code ${code}`);
//                 if (!res.headersSent) {
//                     res.status(500).send('Error during transcoding');
//                 }
//             } else {
//                 console.log('ffmpeg process finished successfully');
//             }

//             responseSent = true;  // Mark response as sent
//         });

//     } catch (err) {
//         console.error(err);
//         if (!res.headersSent) {
//             res.status(500).send('Server error');
//         }
//     }
// });

// module.exports = router;
