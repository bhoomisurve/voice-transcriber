# AI Voice Transcriber

A real-time voice transcription application that leverages OpenAI's Whisper model to convert speech to text with automatic cleaning and formatting.

## Overview

This application provides a web-based interface for recording audio, transcribing it using state-of-the-art speech recognition, and automatically cleaning the output by removing filler words and improving formatting. The system consists of a React frontend for audio capture and a FastAPI backend for processing.

## Features

- **Real-time Audio Recording**: Browser-based microphone access with high-quality audio capture
- **Accurate Transcription**: Powered by OpenAI's Whisper model for reliable speech-to-text conversion
- **Intelligent Text Cleaning**: Automatic removal of filler words (um, uh, like, etc.) and formatting improvements
- **Dual Display**: Side-by-side comparison of raw transcription and cleaned output
- **Modern UI**: Glassmorphic design with smooth animations and visual feedback
- **Error Handling**: Comprehensive error detection and user-friendly messages

## Technology Stack

### Frontend
- React 18
- Vite (Build tool)
- MediaRecorder API (Audio capture)
- CSS3 with modern animations

### Backend
- FastAPI (Python web framework)
- OpenAI Whisper (Speech recognition)
- Uvicorn (ASGI server)
- Python 3.8+

## Prerequisites

- Node.js (v16 or higher)
- Python (v3.8 or higher)
- pip (Python package manager)
- Modern web browser with microphone access

## Installation

### Backend Setup

1. Navigate to the backend directory:
```bash
cd backend
```

2. Create a virtual environment (recommended):
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

3. Install Python dependencies:
```bash
pip install -r requirements.txt
```

4. Install FFmpeg (required by Whisper):
   - **Ubuntu/Debian**: `sudo apt install ffmpeg`
   - **macOS**: `brew install ffmpeg`
   - **Windows**: Download from [ffmpeg.org](https://ffmpeg.org/download.html)

### Frontend Setup

1. Navigate to the frontend directory:
```bash
cd frontend
```

2. Install Node.js dependencies:
```bash
npm install
```

## Running the Application

### Start the Backend Server

1. Activate your virtual environment (if not already active)
2. Run the FastAPI server:
```bash
python main.py
```

The backend will start on `http://127.0.0.1:8000`

### Start the Frontend Development Server

In a separate terminal:

```bash
cd frontend
npm run dev
```

The frontend will start on `http://localhost:5173` (or another port if 5173 is occupied)

## Usage

1. Open your browser and navigate to the frontend URL (typically `http://localhost:5173`)
2. Click the microphone button to start recording
3. Speak clearly into your microphone
4. Click the microphone button again to stop recording
5. Wait for the transcription to process
6. View both the raw transcript and AI-cleaned version in the panels



## API Endpoints

### GET /
Health check endpoint
- **Response**: `{"message": "Backend is working!", "status": "online"}`

### POST /transcribe
Transcribe audio file to text
- **Input**: Audio file (multipart/form-data)
- **Response**: `{"transcript": "...", "success": true}`

### POST /clean
Clean transcribed text
- **Input**: `{"text": "..."}`
- **Response**: `{"cleaned": "...", "success": true}`

## Configuration

### Audio Recording Settings

Audio is captured with the following parameters (configured in `Recorder.jsx`):
- Echo Cancellation: Enabled
- Noise Suppression: Enabled
- Sample Rate: 44.1kHz
- Audio Bitrate: 128kbps
- Format: WebM with Opus codec (fallback to Ogg)

### Whisper Model

The backend uses the "base" Whisper model by default. You can modify this in `main.py`:
```python
model = whisper.load_model("base")  # Options: tiny, base, small, medium, large
```

Larger models provide better accuracy but require more computational resources.

## Troubleshooting

### Microphone Access Denied
Ensure your browser has permission to access the microphone. Check browser settings and reload the page.

### No Speech Detected
- Speak louder and closer to the microphone
- Check microphone input levels in system settings
- Ensure the correct microphone is selected in browser settings

### Backend Connection Failed
- Verify the backend is running on port 8000
- Check for firewall or antivirus blocking the connection
- Ensure CORS is properly configured

### FFmpeg Not Found
Install FFmpeg following the instructions in the Prerequisites section. Whisper requires FFmpeg for audio processing.

## Performance Considerations

- First transcription may take longer as the Whisper model loads into memory
- Audio file size affects processing time
- Internet connection not required after initial setup
- Temporary audio files are automatically cleaned up after processing

