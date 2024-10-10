# Stream Music On Different Bitrates

This project enables streaming of audio files at different bitrates using **Express** and **FFmpeg**. Songs are uploaded to the server and stored in PostgreSQL, with the ability to transcode and stream the songs on-the-fly at various bitrates.

## Project Structure

```
/project-root
│
|── index.html     # Frontend static file (for user interaction)
|── style.css      # Optional stylesheet
│
├── /uploads           # Directory where uploaded songs are stored
│
|── upload.js      # Handles song uploads
|── stream.js      # Handles streaming of songs at different bitrates
│
├── db.js              # PostgreSQL connection configuration
├── app.js             # Main server setup and routing
├── .env               # Environment variables (PostgreSQL config, etc.)
└── README.md          # Documentation
```

## Features

- **Song Upload:** Users can upload songs via the `/upload` route.
- **On-the-Fly Bitrate Transcoding:** The `/stream/:bitrate/:id` route streams songs at different bitrates, using FFmpeg to transcode them.
- **Database Integration:** Song metadata, such as file path and song name, is stored in PostgreSQL.

## Prerequisites

- **Node.js** (v14 or higher)
- **PostgreSQL** for storing song metadata
- **FFmpeg** for transcoding songs at different bitrates

## Installation

### Step 1: Clone the repository

Clone the project from GitHub:

```bash
git clone https://github.com/sarickam/Stream_Music_On_Different_Bits.git
cd Stream_Music_On_Different_Bits
```

### Step 2: Install dependencies

Run the following command to install the required dependencies:

```bash
npm install
```

### Step 3: Configure PostgreSQL

Create a `.env` file in the root directory to configure the database connection. Replace the placeholders with your database credentials:

```
DB_USER=your_db_user
DB_HOST=your_db_host
DB_NAME=your_db_name
DB_PASS=your_db_password
DB_PORT=your_db_port
```

Make sure PostgreSQL is running and accessible from your project.

### Step 4: Install FFmpeg

FFmpeg is required for transcoding audio files to different bitrates.

#### On Ubuntu (Linux):

```bash
sudo apt update
sudo apt install ffmpeg
```

#### On macOS:

If you use Homebrew:

```bash
brew install ffmpeg
```

#### On Windows:

1. Download FFmpeg from the official website: [FFmpeg Download](https://ffmpeg.org/download.html)
2. Extract the archive and add the `bin` folder to your system’s PATH environment variable.

### Step 5: Run the application

Once everything is set up, start the application with:

```bash
npm start
```

By default, the server will run on port `3000`. You can access the application at `http://localhost:3000`.

## Routes

### 1. **Upload Song**

- **POST** `/upload`
- Allows users to upload a song. The request should contain:
  - `song` (form-data field): The song file to upload.
  - `song_name` (form-data field): Name of the song.

### 2. **Stream Song at Different Bitrates**

- **GET** `/stream/:bitrate/:id`
- Streams the song at the specified bitrate. The `bitrate` parameter should be the desired bitrate (e.g., 128, 192, 256), and `id` should be the song ID stored in the database.

## How It Works

1. **Uploading a Song:**
   When a song is uploaded, it is stored in the `uploads` directory, and its metadata (such as song name and file path) is saved in the PostgreSQL database.

2. **Streaming at Different Bitrates:**
   When a request is made to stream a song at a specific bitrate, FFmpeg transcodes the song on-the-fly based on the provided bitrate. The transcoded audio is streamed directly to the client.

## Example Request

To upload a song:

```bash
curl -X POST -F "song=@path/to/song.mp3" -F "song_name=My Song" http://localhost:3000/upload
```

To stream a song at 128kbps:

```bash
curl http://localhost:3000/stream/128/1
```

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
