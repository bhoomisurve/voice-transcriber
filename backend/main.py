from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import whisper
from utils import clean_text
import os
import shutil

app = FastAPI()

# Enable CORS for frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Create temp_audio directory if it doesn't exist
os.makedirs("temp_audio", exist_ok=True)

# Load Whisper model once
print("Loading Whisper model...")
model = whisper.load_model("base")
print("Model loaded successfully!")


class CleanTextRequest(BaseModel):
    text: str


@app.get("/")
def home():
    return {"message": "Backend is working!", "status": "online"}


@app.post("/transcribe")
async def transcribe_audio(file: UploadFile = File(...)):
    try:
        # Support multiple audio formats
        file_extension = os.path.splitext(file.filename)[1] or ".webm"
        file_location = f"temp_audio/input{file_extension}"
        
        # Save uploaded file
        with open(file_location, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
        
        file_size = os.path.getsize(file_location)
        print(f"Received audio file: {file_location}, Size: {file_size} bytes")
        
        if file_size < 100:
            raise HTTPException(status_code=400, detail="Audio file too small or empty")
        
        # Transcribe audio with additional options
        print("Starting transcription...")
        result = model.transcribe(
            file_location, 
            language="en", 
            fp16=False,
            verbose=True,
            temperature=0.0
        )
        
        transcript_text = result["text"].strip()
        print(f"Transcription result: '{transcript_text}'")
        print(f"Detected language: {result.get('language', 'unknown')}")
        
        # Clean up temp file
        if os.path.exists(file_location):
            os.remove(file_location)
        
        if not transcript_text:
            return {"transcript": "[No speech detected - please speak clearly and try again]", "success": False}
        
        return {"transcript": transcript_text, "success": True}
    
    except Exception as e:
        print(f"Error during transcription: {str(e)}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Transcription failed: {str(e)}")


@app.post("/clean")
async def clean_transcript(request: CleanTextRequest):
    try:
        cleaned_text = clean_text(request.text)
        return {"cleaned": cleaned_text, "success": True}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Cleaning failed: {str(e)}")


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)